// The blog displays essays in Beijing time, regardless of the editor's timezone.
export const toEssayTimeInput = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (!Number.isFinite(date.valueOf())) return ''
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(date)
            .map((part) => [part.type, part.value]),
    )
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${String(date.getUTCMilliseconds()).padStart(3, '0')}`
}

export const fromEssayTimeInput = (value) =>
    value ? new Date(`${value}+08:00`).toISOString() : null
