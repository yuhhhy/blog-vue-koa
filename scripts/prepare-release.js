import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const releaseDir = path.join(projectRoot, 'release')

async function copy(source, destination) {
  const destinationPath = path.join(releaseDir, destination)
  await fs.mkdir(path.dirname(destinationPath), { recursive: true })
  await fs.cp(path.join(projectRoot, source), destinationPath, { recursive: true })
}

async function prepareRelease() {
  await fs.rm(releaseDir, { recursive: true, force: true })
  await fs.mkdir(releaseDir, { recursive: true })

  await copy('blog-client/dist', 'frontend/dist')
  await copy('blog-background/dist', 'admin/dist')

  for (const directory of ['config', 'controllers', 'middlewares', 'models', 'routes', 'utils']) {
    await copy(`blog-server/${directory}`, `server/${directory}`)
  }

  for (const file of ['app.js', 'package.json', 'package-lock.json']) {
    await copy(`blog-server/${file}`, `server/${file}`)
  }

  const packagePath = path.join(releaseDir, 'server/package.json')
  const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'))
  delete packageJson.scripts?.seed
  await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

  await copy('scripts/deploy-release.sh', 'deploy-release.sh')

  console.log(`Release prepared at ${releaseDir}`)
}

prepareRelease().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
