export const defaultEssayTitle = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date)
    const value = (type) => parts.find((part) => part.type === type)?.value
    return `${value('month')}月${value('day')}日随笔`
}

export const normalizeEssayTime = (value, fallback = new Date()) => {
    if (value === undefined || value === null || value === '') {
        return { createTime: fallback === null ? null : new Date(fallback) }
    }
    if (typeof value !== 'string' && !(value instanceof Date)) {
        return { error: '随笔日期和时间无效' }
    }
    const date = new Date(value)
    if (!Number.isFinite(date.valueOf())) return { error: '随笔日期和时间无效' }
    if (typeof value === 'string') {
        const parts =
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.exec(
                value,
            )
        if (!parts) return { error: '随笔日期和时间无效' }
        const [year, month, day, hour, minute, second] = parts
            .slice(1)
            .map((part) => Number(part ?? 0))
        const calendarDate = new Date(0)
        calendarDate.setUTCFullYear(year, month - 1, day)
        if (
            calendarDate.getUTCFullYear() !== year ||
            calendarDate.getUTCMonth() !== month - 1 ||
            calendarDate.getUTCDate() !== day ||
            hour > 23 ||
            minute > 59 ||
            second > 59
        ) {
            return { error: '随笔日期和时间无效' }
        }
    }
    return { createTime: date }
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
