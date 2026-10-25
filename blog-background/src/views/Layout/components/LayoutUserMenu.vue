<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiAccountOutline,
  mdiAccountCircleOutline,
  mdiBellOutline,
  mdiCommentProcessingOutline,
  mdiLinkVariant,
  mdiLogoutVariant,
  mdiShieldAccountOutline
} from '@mdi/js'
import avatarUrl from '@/assets/avatar.jpg'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const router = useRouter()
const isAdmin = computed(() => userStore.userData.role === 'admin')
const userRoleIcon = computed(() => isAdmin.value ? mdiShieldAccountOutline : mdiAccountOutline)
let notificationTimer = null

const userRoleText = computed(() => ({
  admin: '管理员',
  user: '用户'
})[userStore.userData.role] || userStore.userData.role)

watch(() => route.path, path => {
  if (path.includes('/comment/pending')) notificationStore.resetCommentsCount()
  if (path.includes('/links')) notificationStore.resetLinksCount()
}, { immediate: true })

watch(() => userStore.isAuthenticated, authenticated => {
  if (authenticated && isAdmin.value) fetchNotifications()
})

onMounted(() => {
  if (!isAdmin.value) return

  fetchNotifications()
  notificationTimer = window.setInterval(fetchNotifications, 60000)
})

onBeforeUnmount(() => {
  window.clearInterval(notificationTimer)
})

async function fetchNotifications() {
  if (isAdmin.value) await notificationStore.refreshAllNotifications()
}

async function handleLogout() {
  userStore.clearUserData()
  await router.replace({ name: 'Login' })
}

function handleLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="sidenav-user-menu">
    <el-popover
      v-if="userStore.isAuthenticated"
      width="300"
      placement="right-end"
      popper-class="admin-user-popover-panel"
      :show-arrow="false"
    >
      <template #reference>
        <button class="user-trigger" type="button">
          <span class="avatar-wrap">
            <img class="trigger-avatar" :src="avatarUrl" alt="">
            <span v-if="notificationStore.totalNotifications" class="notification-dot"></span>
          </span>
          <strong class="trigger-username">{{ userStore.userData.username }}</strong>
        </button>
      </template>

      <div class="user-popover">
        <div class="user-meta">
          <img class="popover-avatar" :src="avatarUrl" alt="">
          <div class="user-meta-main">
            <div class="popover-username">{{ userStore.userData.username }}</div>
            <div class="popover-email">{{ userStore.userData.email }}</div>
            <span class="role-label">
              <MaterialIcon class="role-label__icon" :path="userRoleIcon" />
              {{ userRoleText }}
            </span>
          </div>
        </div>
        <nav class="user-actions" aria-label="个人菜单">
          <div class="action-group">
            <RouterLink v-if="isAdmin" to="/comment/pending" class="popover-link">
              <MaterialIcon class="popover-link__icon" :path="mdiCommentProcessingOutline" />
              <span class="popover-link__label">待审评论</span>
              <span v-if="notificationStore.pendingCommentsCount" class="notice-count">
                {{ notificationStore.pendingCommentsCount }}
              </span>
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/links" class="popover-link">
              <MaterialIcon class="popover-link__icon" :path="mdiLinkVariant" />
              <span class="popover-link__label">友链申请</span>
              <span v-if="notificationStore.pendingLinksCount" class="notice-count">
                {{ notificationStore.pendingLinksCount }}
              </span>
            </RouterLink>
            <RouterLink to="/" class="popover-link">
              <MaterialIcon class="popover-link__icon" :path="mdiBellOutline" />
              <span class="popover-link__label">系统通知</span>
              <span v-if="notificationStore.unreadSystemCount" class="notice-count">
                {{ notificationStore.unreadSystemCount }}
              </span>
            </RouterLink>
          </div>
          <button class="popover-link logout-link" type="button" @click="handleLogout">
            <MaterialIcon class="popover-link__icon" :path="mdiLogoutVariant" />
            <span class="popover-link__label">退出登录</span>
          </button>
        </nav>
      </div>
    </el-popover>

    <button v-else class="user-trigger" type="button" @click="handleLogin">
      <span class="login-icon"><MaterialIcon :path="mdiAccountCircleOutline" /></span>
      <strong class="trigger-username">登录</strong>
    </button>
  </div>
</template>

<style scoped>
.sidenav-user-menu {
  display: flex;
  align-items: center;
  padding-top: 12px;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 48px;
  gap: 8px;
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  color: var(--admin-text);
  background: var(--admin-surface-muted);
  cursor: pointer;
  transition: background-color 180ms ease;
}

.user-trigger:hover {
  background: var(--admin-surface-high);
}

.avatar-wrap {
  position: relative;
  flex: 0 0 auto;
}

.trigger-avatar,
.login-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.trigger-avatar {
  display: block;
  object-fit: cover;
}

.login-icon {
  display: grid;
  place-items: center;
  color: var(--admin-text-muted);
  font-size: 22px;
  background: var(--admin-surface-high);
}

.notification-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border: 2px solid var(--admin-bg-soft);
  border-radius: 50%;
  background: var(--admin-danger);
}

.trigger-username {
  min-width: 0;
  max-width: 112px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.user-popover {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px 8px;
  text-align: center;
}

.popover-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 4px var(--admin-primary-soft);
}

.user-meta-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  margin-top: 10px;
}

.popover-username,
.popover-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popover-username {
  min-width: 0;
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 650;
  line-height: 22px;
}

.popover-email {
  max-width: 100%;
  margin-top: 1px;
  color: var(--admin-text-muted);
  font-size: 12px;
  line-height: 18px;
}

.role-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 7px;
  padding: 3px 9px;
  border-radius: 999px;
  color: var(--admin-on-primary-soft);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  background: var(--admin-primary-soft);
}

.role-label__icon {
  width: 14px;
  height: 14px;
}

.user-actions {
  display: grid;
  gap: 8px;
}

.action-group {
  display: grid;
  gap: 0;
  padding: 4px;
  border-radius: var(--admin-radius);
  background: var(--admin-surface-muted);
}

.popover-link {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  gap: 10px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--admin-radius-sm);
  color: var(--admin-text);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease;
}

.popover-link:hover {
  background: var(--admin-surface-high);
}

.popover-link:focus-visible {
  outline: 2px solid var(--admin-primary);
  outline-offset: -2px;
}

.popover-link__icon {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  color: var(--admin-text-muted);
}

.popover-link__label {
  flex: 1;
  text-align: left;
}

.notice-count {
  display: inline-grid;
  min-width: 22px;
  min-height: 22px;
  place-items: center;
  padding: 0 6px;
  border-radius: 999px;
  color: #410002;
  font-size: 12px;
  background: var(--admin-danger-soft);
}

.logout-link {
  color: var(--admin-danger);
  background: color-mix(in srgb, var(--admin-danger-soft) 58%, transparent);
}

.logout-link .popover-link__icon {
  color: currentColor;
}

.logout-link:hover {
  background: var(--admin-danger-soft);
}

:global(.admin-user-popover-panel.el-popper) {
  padding: 10px;
  border: 0;
  border-radius: var(--admin-radius);
  background: var(--admin-surface);
  box-shadow: 0 3px 8px rgba(29, 27, 32, 0.16), 0 1px 3px rgba(29, 27, 32, 0.12);
}
</style>
