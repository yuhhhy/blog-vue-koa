import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateImageVariants, isImageVariantFile } from '../utils/imageVariants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imageDir = path.join(__dirname, '..', '..', 'public', 'images')
const supportedExtensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp'])

const files = await fsp.readdir(imageDir)

for (const file of files) {
    const filePath = path.join(imageDir, file)
    const stat = await fsp.stat(filePath)

    if (!stat.isFile() || isImageVariantFile(file) || !supportedExtensions.has(path.extname(file).toLowerCase())) {
        continue
    }

    await generateImageVariants(filePath, file, imageDir)
    console.log(`generated variants for ${file}`)
}
