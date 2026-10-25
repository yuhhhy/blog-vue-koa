import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageRoot = resolve(projectRoot, 'node_modules/vditor')
const targetRoot = resolve(projectRoot, 'public/vendor/vditor')
const packageInfo = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'))
const markerPath = resolve(targetRoot, '.version')

let installedVersion = ''
try {
    installedVersion = (await readFile(markerPath, 'utf8')).trim()
} catch {
    // The local browser assets have not been generated yet.
}

if (installedVersion !== packageInfo.version) {
    await rm(targetRoot, { recursive: true, force: true })
    await mkdir(targetRoot, { recursive: true })
    await cp(resolve(packageRoot, 'dist'), resolve(targetRoot, 'dist'), { recursive: true })
    await writeFile(markerPath, `${packageInfo.version}\n`)
}
