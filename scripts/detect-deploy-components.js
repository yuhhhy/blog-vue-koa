import fs from 'fs'
import { pathToFileURL } from 'url'

const componentOrder = ['frontend', 'admin', 'server']

const isSharedDeploymentFile = (file) => (
  ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'].includes(file)
  || file.startsWith('.github/workflows/')
  || file.startsWith('scripts/')
)

export const detectDeployComponents = (files, { forceAll = false } = {}) => {
  const selected = new Set(forceAll ? componentOrder : [])

  for (const file of files) {
    if (isSharedDeploymentFile(file)) {
      componentOrder.forEach((component) => selected.add(component))
      continue
    }

    if (file.startsWith('blog-client/')) selected.add('frontend')
    if (file.startsWith('blog-background/')) selected.add('admin')
    if (file.startsWith('blog-server/')) selected.add('server')
  }

  const components = componentOrder.filter((component) => selected.has(component))

  return {
    frontend: selected.has('frontend'),
    admin: selected.has('admin'),
    server: selected.has('server'),
    hasChanges: components.length > 0,
    components,
  }
}

const writeGithubOutputs = (result) => {
  const outputPath = process.env.GITHUB_OUTPUT
  if (!outputPath) return

  fs.appendFileSync(outputPath, [
    `frontend=${result.frontend}`,
    `admin=${result.admin}`,
    `server=${result.server}`,
    `has_changes=${result.hasChanges}`,
    `components=${result.components.join(' ')}`,
    '',
  ].join('\n'))
}

const run = () => {
  const input = fs.readFileSync(0)
  const files = input
    .toString('utf8')
    .split(/\0|\r?\n/)
    .filter(Boolean)
  const result = detectDeployComponents(files, {
    forceAll: process.env.FORCE_ALL === 'true',
  })

  files.forEach((file) => console.log(`  ${file}`))
  console.log(`Selected components: ${result.components.join(' ') || 'none'}`)
  writeGithubOutputs(result)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
}
