export const imageWidthOptions = [25, 50, 75, 100]

const widthMetadataPattern = /(?:^|\s*\|\s*)width=(25|50|75|100)%\s*$/i

export const parseImageWidth = (title = '') => {
    const normalizedTitle = String(title).trim()
    const match = normalizedTitle.match(widthMetadataPattern)

    if (!match) return { title: normalizedTitle, width: null }

    return {
        title: normalizedTitle.slice(0, match.index).trim(),
        width: Number(match[1]),
    }
}

export const setImageWidth = (title = '', width = null) => {
    const parsed = parseImageWidth(title)
    if (!imageWidthOptions.includes(width)) return parsed.title
    return parsed.title ? `${parsed.title} | width=${width}%` : `width=${width}%`
}

export const applyImageWidth = (token) => {
    const parsed = parseImageWidth(token.attrGet('title') || '')
    if (!parsed.width) return null

    token.attrSet('data-image-width', String(parsed.width))
    const titleIndex = token.attrIndex('title')
    if (parsed.title) token.attrSet('title', parsed.title)
    else if (titleIndex >= 0) token.attrs.splice(titleIndex, 1)

    return parsed.width
}
