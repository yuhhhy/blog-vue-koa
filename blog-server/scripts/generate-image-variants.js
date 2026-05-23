import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateImageVariants, isImageVariantFile } from '../utils/imageVariants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imageDir = path.join(__dirname, '..', '..', 'public', 'images')
const supportedExtensions = new Set(['.avif', '.jpg', '.jpeg', '.png', '.webp'])

const generateVariantsInDir = async (dir) => {
    const entries = await fsp.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const filePath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            if (entry.name === '_variants') continue
            await generateVariantsInDir(filePath)
            continue
        }

        if (!entry.isFile() || isImageVariantFile(entry.name) || !supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
            continue
        }

        await generateImageVariants(filePath, entry.name, dir)
        console.log(`generated variants for ${path.relative(imageDir, filePath)}`)
    }
}

await generateVariantsInDir(imageDir)
