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

// 获取格式化日期到分钟 YYYY-MM-DD HH:mm
export function getFormatDateToMinutes(dateStr) {
    let date = new Date(dateStr)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let strDate = date.getDate()
    let hours = date.getHours()
    let minutes = date.getMinutes()

    if (month < 10) month = `0${month}`
    if (strDate < 10) strDate = `0${strDate}`
    if (hours < 10) hours = `0${hours}`
    if (minutes < 10) minutes = `0${minutes}`

    return `${year}-${month}-${strDate} ${hours}:${minutes}`
}