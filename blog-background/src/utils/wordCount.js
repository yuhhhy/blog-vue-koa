export default function (str) {
    let eTotal = 0 // 字母数
    let sTotal = 0 // 空格数
    for (let i = 0; i < str.length; i++) {
        let c = str.charAt(i)
        if (/[a-zA-Z]/.test(c)) {
            eTotal++
        } else if (/\s+/.test(c)) {
            sTotal++
        }
    }
    let wTotal = 0 // 英文单词数
    const segmenter = new Intl.Segmenter('en', { granularity: 'word' })
    const segments = Array.from(segmenter.segment(str))
    const words = segments.filter(s => s.isWordLike).map(s => s.segment)
    wTotal = words.filter(word => word.match(/^[a-zA-Z]+$/)).length
    
    return str.length - eTotal + wTotal - sTotal
}