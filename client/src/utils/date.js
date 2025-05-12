// 获取格式化日期 YYYY-MM-DD
export function getFormatDate(date) {
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let strDate = date.getDate()
    if (month < 10) month = `0${month}`
    if (strDate < 10) strDate = `0${strDate}`
    return `${year}-${month}-${strDate}`
}