// 获取格式化日期 YYYY-MM-DD
export function getFormatDate(dateStr) {
    let date = new Date(dateStr)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let strDate = date.getDate()
    if (month < 10) month = `0${month}`
    if (strDate < 10) strDate = `0${strDate}`
    return `${year}-${month}-${strDate}`
}

export function getFormatDateTimeToMinute(dateStr, timeZone = 'Asia/Shanghai') {
    const date = new Date(dateStr)
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
    }

    try {
        const parts = new Intl.DateTimeFormat('zh-CN', options).formatToParts(date)
        const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
        return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}`
    } catch {
        return getFormatDateTimeToMinute(dateStr, 'Asia/Shanghai')
    }
}
