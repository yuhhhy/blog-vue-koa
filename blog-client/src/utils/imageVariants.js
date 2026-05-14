const IMAGE_VARIANT_WIDTHS = [360, 720, 960]

const canUseImageVariant = (src) => {
    return typeof src === 'string' && src.startsWith('/images/')
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
