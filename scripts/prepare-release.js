import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const releaseDir = path.join(projectRoot, 'release')
const supportedComponents = new Set(['frontend', 'admin', 'server'])

const getSelectedComponents = () => {
  const requestedComponents = (process.env.DEPLOY_COMPONENTS || 'frontend admin server')
    .split(/\s+/)
    .filter(Boolean)
  const selectedComponents = [...new Set(requestedComponents)]

  if (!selectedComponents.length) {
    throw new Error('At least one release component is required')
  }

  for (const component of selectedComponents) {
    if (!supportedComponents.has(component)) {
      throw new Error(`Unsupported release component: ${component}`)
    }
  }

  return selectedComponents
}

async function copy(source, destination) {
  const destinationPath = path.join(releaseDir, destination)
  await fs.mkdir(path.dirname(destinationPath), { recursive: true })
  await fs.cp(path.join(projectRoot, source), destinationPath, { recursive: true })
}

async function prepareRelease() {
  const selectedComponents = getSelectedComponents()

  await fs.rm(releaseDir, { recursive: true, force: true })
  await fs.mkdir(releaseDir, { recursive: true })

  if (selectedComponents.includes('frontend')) {
    await copy('blog-client/dist', 'frontend/dist')
  }

  if (selectedComponents.includes('admin')) {
    await copy('blog-background/dist', 'admin/dist')
  }

  if (selectedComponents.includes('server')) {
    for (const directory of ['config', 'controllers', 'middlewares', 'models', 'routes', 'services', 'utils']) {
      await copy(`blog-server/${directory}`, `workspace/blog-server/${directory}`)
    }

    for (const file of ['app.js', 'package.json']) {
      await copy(`blog-server/${file}`, `workspace/blog-server/${file}`)
    }

    for (const file of ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']) {
      await copy(file, `workspace/${file}`)
    }

    const packagePath = path.join(releaseDir, 'workspace/blog-server/package.json')
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'))
    delete packageJson.scripts?.seed
    await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
  }

  await copy('scripts/deploy-release.sh', 'deploy-release.sh')
  await fs.writeFile(
    path.join(releaseDir, 'deploy-components.txt'),
    `${selectedComponents.join('\n')}\n`,
  )

  console.log(`Release prepared at ${releaseDir}: ${selectedComponents.join(', ')}`)
}

prepareRelease().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
