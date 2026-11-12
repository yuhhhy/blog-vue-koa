import fsp from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

// Legacy thumbnail sizes are retained only for identifying and deleting old files.
export const imageVariantWidths = [360, 720, 960]

export const getImageVariantPath = (imageDir, width, filename) => {
    const parsed = path.parse(filename)
    return path.join(imageDir, `${parsed.name}_${width}.avif`)
}

export const isImageVariantFile = (filename) => {
    const parsed = path.parse(filename)
    return imageVariantWidths.some((width) => parsed.name.endsWith(`_${width}`))
}

export const convertImageToAvif = async (sourcePath, filename) => {
    const parsed = path.parse(filename)
    const targetFilename = `${parsed.name}.avif`
    const targetPath = path.join(path.dirname(sourcePath), targetFilename)

    if (path.extname(filename).toLowerCase() === '.avif') {
        return {
            path: sourcePath,
            filename,
        }
    }

    await sharp(sourcePath)
        .rotate()
        .avif({ quality: 65, effort: 4 })
        .toFile(targetPath)

    await fsp.unlink(sourcePath)

    return {
        path: targetPath,
        filename: targetFilename,
    }
}

export const deleteImageVariants = async (imageDir, filename) => {
    await Promise.all(
        imageVariantWidths.map(async (width) => {
            try {
                await fsp.unlink(getImageVariantPath(imageDir, width, filename))
            } catch (error) {
                if (error.code !== 'ENOENT') throw error
            }
        }),
    )
}
