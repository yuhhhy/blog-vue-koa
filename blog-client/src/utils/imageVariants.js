const IMAGE_VARIANT_WIDTHS = [360, 720, 960]

const canUseImageVariant = (src) => {
    return typeof src === 'string' && src.startsWith('/images/')
}

const getImageVariantUrl = (src, width) => {
    const filename = src.split('/').pop()
    const extensionIndex = filename.lastIndexOf('.')
    const basename = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename

    return `/images/${encodeURIComponent(basename)}_${width}.avif`
}

export const getImageVariantSrcset = (src) => {
    if (!canUseImageVariant(src)) return undefined

    return IMAGE_VARIANT_WIDTHS
        .map((width) => `${getImageVariantUrl(src, width)} ${width}w`)
        .join(', ')
}
