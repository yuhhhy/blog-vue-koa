export const defaultEssayTitle = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date)
    const value = (type) => parts.find((part) => part.type === type)?.value
    return `${value('month')}月${value('day')}日随笔`
}

export const normalizeEssayImages = (images = []) => {
    if (
        !Array.isArray(images) ||
        images.some(
            (image) =>
                typeof image !== 'string' ||
                !(
                    /^\/images\/[^\s]+$/.test(image) ||
                    /^https?:\/\/[^\s]+$/i.test(image)
                ),
        )
    )
        return { error: '随笔图片地址无效' }
    return { images: [...images] }
}

export const normalizeEssayInput = (input, date = new Date()) => {
    const title = typeof input?.title === 'string' ? input.title.trim() : ''
    const content =
        typeof input?.content === 'string' ? input.content.trim() : ''

    if (!content) return { error: '随笔正文不能为空' }
    if (title.length > 120) return { error: '随笔标题不能超过 120 字' }

    const images = normalizeEssayImages(input?.images)
    if (images.error) return images

    return { title: title || defaultEssayTitle(date), content, ...images }
}
