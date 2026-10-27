#!/usr/bin/env bash

set -Eeuo pipefail

readonly RELEASE_SHA="${1:?Release SHA is required}"
readonly DEPLOY_ROOT="/var/www"
readonly INCOMING_DIR="${DEPLOY_ROOT}/.incoming-${RELEASE_SHA}"
readonly BACKUP_DIR="${DEPLOY_ROOT}/.rollback-${RELEASE_SHA}-$(date +%s)"
readonly LOCK_FILE="/var/lock/blog-deploy.lock"
readonly PNPM_VERSION="11.7.0"

log() {
  printf '[deploy] %s\n' "$*"
}

if [[ ! "${RELEASE_SHA}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Invalid release SHA: ${RELEASE_SHA}" >&2
  exit 1
fi

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "Another production deployment is already running." >&2
  exit 1
fi
log "Deployment lock acquired for release ${RELEASE_SHA}."

if [[ ! -f "${INCOMING_DIR}/deploy-components.txt" ]]; then
  echo "Missing deploy component manifest." >&2
  exit 1
fi

mapfile -t COMPONENTS < <(sed '/^[[:space:]]*$/d' "${INCOMING_DIR}/deploy-components.txt")
if (( ${#COMPONENTS[@]} == 0 )); then
  echo "Deploy component manifest is empty." >&2
  exit 1
fi

declare -A SELECTED_COMPONENTS=()
for component in "${COMPONENTS[@]}"; do
  case "${component}" in
    frontend|admin|server) ;;
    *)
      echo "Unsupported deploy component: ${component}" >&2
      exit 1
      ;;
  esac

  if [[ -n "${SELECTED_COMPONENTS[${component}]:-}" ]]; then
    echo "Duplicate deploy component: ${component}" >&2
    exit 1
  fi
  SELECTED_COMPONENTS["${component}"]=true
done
log "Selected components: ${COMPONENTS[*]}."

log "Validating incoming release files..."
if [[ -n "${SELECTED_COMPONENTS[frontend]:-}" ]]; then
  test -f "${INCOMING_DIR}/frontend/dist/index.html"
fi
if [[ -n "${SELECTED_COMPONENTS[admin]:-}" ]]; then
  test -f "${INCOMING_DIR}/admin/dist/index.html"
fi
if [[ -n "${SELECTED_COMPONENTS[server]:-}" ]]; then
  test -f "${INCOMING_DIR}/workspace/pnpm-lock.yaml"
  test -f "${INCOMING_DIR}/workspace/blog-server/package.json"
fi
log "Incoming release files are complete."

if [[ -n "${SELECTED_COMPONENTS[server]:-}" ]]; then
  log "Installing production dependencies with pnpm ${PNPM_VERSION}..."
  (
    cd "${INCOMING_DIR}/workspace"
    test "$(corepack pnpm --version)" = "${PNPM_VERSION}"
    corepack pnpm install --frozen-lockfile --filter backend --prod
    corepack pnpm --filter backend deploy --prod "${INCOMING_DIR}/server"
  )

  rm -rf "${INCOMING_DIR}/workspace"
  log "Production server package is ready."

  # 沿用服务器现有的环境文件，密钥不进入构建产物。
  log "Copying the existing production environment file..."
  if [[ -f "${DEPLOY_ROOT}/server/.env" ]]; then
    install -m 600 "${DEPLOY_ROOT}/server/.env" "${INCOMING_DIR}/server/.env"
  else
    echo "Missing ${DEPLOY_ROOT}/server/.env" >&2
    exit 1
  fi

  mkdir -p "${INCOMING_DIR}/server/logs"

  log "Checking the new server entry point..."
  node --check "${INCOMING_DIR}/server/app.js"
fi

if [[ -n "${SELECTED_COMPONENTS[frontend]:-}" || -n "${SELECTED_COMPONENTS[admin]:-}" ]]; then
  log "Validating Caddy configuration..."
  (
    cd /opt/caddy
    docker compose exec -T caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
  )
fi

mkdir -p "${BACKUP_DIR}"
activated_components=()

restart_caddy() {
  (cd /opt/caddy && docker compose restart caddy)
}

component_was_activated() {
  local expected_component="$1"
  local activated_component

  for activated_component in "${activated_components[@]}"; do
    if [[ "${activated_component}" == "${expected_component}" ]]; then
      return 0
    fi
  done

  return 1
}

rollback() {
  local exit_code=$?
  trap - ERR

  if (( ${#activated_components[@]} > 0 )); then
    echo "Deployment failed; restoring the previous release..." >&2
    for (( index=${#activated_components[@]}-1; index>=0; index-- )); do
      component="${activated_components[index]}"
      rm -rf "${DEPLOY_ROOT:?}/${component}"
      mv "${BACKUP_DIR}/${component}" "${DEPLOY_ROOT}/${component}"
    done

    if component_was_activated server; then
      (cd "${DEPLOY_ROOT}/server" && NODE_ENV=production pm2 restart blog-server --update-env) || true
    fi
    if component_was_activated frontend || component_was_activated admin; then
      restart_caddy || true
    fi
  fi

  exit "${exit_code}"
}

trap rollback ERR

log "Activating release ${RELEASE_SHA}..."
for component in "${COMPONENTS[@]}"; do
  if [[ ! -e "${DEPLOY_ROOT}/${component}" ]]; then
    echo "Current component is missing: ${component}" >&2
    false
  fi

  mv "${DEPLOY_ROOT}/${component}" "${BACKUP_DIR}/${component}"
  if ! mv "${INCOMING_DIR}/${component}" "${DEPLOY_ROOT}/${component}"; then
    mv "${BACKUP_DIR}/${component}" "${DEPLOY_ROOT}/${component}"
    false
  fi
  activated_components+=("${component}")
  log "Activated ${component}."
done

if [[ -n "${SELECTED_COMPONENTS[server]:-}" ]]; then
  log "Restarting the backend service..."
  (
    cd "${DEPLOY_ROOT}/server"
    NODE_ENV=production pm2 restart blog-server --update-env
  )

  log "Waiting for the backend health check..."
  api_healthy=false
  for attempt in {1..15}; do
    if curl --fail --silent --show-error --max-time 3 http://127.0.0.1:3000/api/health >/dev/null; then
      api_healthy=true
      break
    fi
    sleep 2
  done

  if [[ "${api_healthy}" != true ]]; then
    echo "API health check failed after 30 seconds." >&2
    false
  fi
  log "Backend health check passed."
fi

if [[ -n "${SELECTED_COMPONENTS[frontend]:-}" || -n "${SELECTED_COMPONENTS[admin]:-}" ]]; then
  # Caddy 直接 bind mount dist 目录，需要重启容器才会绑定新目录。
  log "Restarting Caddy to mount the new web assets..."
  restart_caddy

  log "Checking the changed web applications..."
  web_healthy=false
  for attempt in {1..10}; do
    frontend_healthy=true
    admin_healthy=true

    if [[ -n "${SELECTED_COMPONENTS[frontend]:-}" ]]; then
      curl --fail --silent --show-error --max-time 5 \
        --resolve yuhhhy.cn:443:127.0.0.1 https://yuhhhy.cn/ >/dev/null \
        || frontend_healthy=false
    fi
    if [[ -n "${SELECTED_COMPONENTS[admin]:-}" ]]; then
      curl --fail --silent --show-error --max-time 5 \
        --resolve admin.yuhhhy.cn:443:127.0.0.1 https://admin.yuhhhy.cn/ >/dev/null \
        || admin_healthy=false
    fi

    if [[ "${frontend_healthy}" == true && "${admin_healthy}" == true ]]; then
      web_healthy=true
      break
    fi
    sleep 2
  done

  if [[ "${web_healthy}" != true ]]; then
    echo "Web application health check failed after 20 seconds." >&2
    false
  fi
  log "Changed web application health checks passed."
fi

trap - ERR
rm -f "${INCOMING_DIR}/deploy-release.sh"
rm -f "${INCOMING_DIR}/deploy-components.txt"
rmdir "${INCOMING_DIR}" 2>/dev/null || true

# 仅保留最近两个可回滚版本。
mapfile -t old_backups < <(
  find "${DEPLOY_ROOT}" -maxdepth 1 -mindepth 1 -type d -name '.rollback-*' -printf '%T@ %p\n' \
    | sort -rn \
    | tail -n +3 \
    | cut -d' ' -f2-
)
for old_backup in "${old_backups[@]}"; do
  if [[ "${old_backup}" == "${DEPLOY_ROOT}/.rollback-"* ]]; then
    rm -rf "${old_backup}"
  fi
done

log "Release ${RELEASE_SHA} deployed successfully."
