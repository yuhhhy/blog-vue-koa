import fsp from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export const imageVariantWidths = [360, 720, 960]

export const getImageVariantPath = (imageDir, width, filename) => {
    const parsed = path.parse(filename)
    return path.join(imageDir, `${parsed.name}_${width}.avif`)
}

export const isImageVariantFile = (filename) => {
    const parsed = path.parse(filename)
    return imageVariantWidths.some((width) => parsed.name.endsWith(`_${width}`))
}

export const generateImageVariants = async (sourcePath, filename, imageDir) => {
    await Promise.all(imageVariantWidths.map(async (width) => {
        const targetPath = getImageVariantPath(imageDir, width, filename)

        await fsp.mkdir(path.dirname(targetPath), { recursive: true })
        await sharp(sourcePath)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .avif({ quality: 55, effort: 4 })
            .toFile(targetPath)
    }))
}

export const deleteImageVariants = async (imageDir, filename) => {
    await Promise.all(imageVariantWidths.map(async (width) => {
        try {
            await fsp.unlink(getImageVariantPath(imageDir, width, filename))
        } catch (error) {
            if (error.code !== 'ENOENT') throw error
        }
    }))
}
