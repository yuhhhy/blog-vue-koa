const IMAGE_VARIANT_WIDTHS = [360, 720, 960]
const RASTER_IMAGE_PATTERN = /\.(?:avif|jpe?g|png|webp)$/i

const canUseImageVariant = (src) => {
    if (typeof src !== 'string' || !src.startsWith('/images/')) return false

    const pathname = src.split(/[?#]/, 1)[0]
    return RASTER_IMAGE_PATTERN.test(pathname)
}

const getImageVariantUrl = (src, width) => {
    const lastSlashIndex = src.lastIndexOf('/')
    const dirname = src.slice(0, lastSlashIndex)
    const filename = src.slice(lastSlashIndex + 1)
    const extensionIndex = filename.lastIndexOf('.')
    const basename = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename

    return `${dirname}/${encodeURIComponent(basename)}_${width}.avif`
}

export const getImageVariantSrcset = (src) => {
    if (!canUseImageVariant(src)) return undefined

    return IMAGE_VARIANT_WIDTHS
        .map((width) => `${getImageVariantUrl(src, width)} ${width}w`)
        .join(', ')
}
