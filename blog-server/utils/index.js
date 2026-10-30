import { UAParser } from 'ua-parser-js'
import ip2region from "ip2region"
const IP2Region = ip2region.default
const ipRegionQuery = new IP2Region({ disableIpv6: true })

// IP 数据库不包含坐标。这里仅保留省级代表点，精度足够用于日出日落图标，
// 同时避免保存访问者的精确位置。
const provinceSolarLocations = {
    北京: [39.9042, 116.4074], 天津: [39.0842, 117.2009], 河北: [38.0428, 114.5149],
    山西: [37.8706, 112.5489], 内蒙古: [40.8426, 111.7492], 辽宁: [41.8057, 123.4315],
    吉林: [43.8171, 125.3235], 黑龙江: [45.8038, 126.5349], 上海: [31.2304, 121.4737],
    江苏: [32.0603, 118.7969], 浙江: [30.2741, 120.1551], 安徽: [31.8206, 117.2272],
    福建: [26.0745, 119.2965], 江西: [28.6829, 115.8582], 山东: [36.6512, 117.1201],
    河南: [34.7466, 113.6254], 湖北: [30.5928, 114.3055], 湖南: [28.2282, 112.9388],
    广东: [23.1291, 113.2644], 广西: [22.817, 108.3665], 海南: [20.044, 110.1999],
    重庆: [29.563, 106.5516], 四川: [30.5728, 104.0668], 贵州: [26.647, 106.6302],
    云南: [25.0389, 102.7183], 西藏: [29.652, 91.1721], 陕西: [34.3416, 108.9398],
    甘肃: [36.0611, 103.8343], 青海: [36.6171, 101.7782], 宁夏: [38.4872, 106.2309],
    新疆: [43.8256, 87.6168], 香港: [22.3193, 114.1694], 澳门: [22.1987, 113.5439],
    台湾: [25.033, 121.5654],
}

const normalizeProvince = value => String(value || '')
    .replace(/特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市/g, '')
    .trim()

// 获取IP地址
// 代理处理
export const getIp = (ctx) => {
    const forwardedFor = ctx.req?.headers?.['x-forwarded-for']
    const forwardedIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
        ?.split(',')[0]
        ?.trim()
    const ip = forwardedIp
        || ctx.req?.headers?.['x-real-ip']
        || ctx.req?.socket?.remoteAddress
        || ctx.request?.ip
        || '0.0.0.0'

    return String(ip).trim().replace(/^::ffff:/, '')
}

// 解析IP地址
export const parseIp = (ip) => {
    // 这里可以使用第三方库来解析IP地址
    // 例如：ip2region、geoip-lite等
    const res = ipRegionQuery.search(ip)
    
    const { province, city, isp } = res
    return `${province} ${city} ${isp}` // 这里可以根据需要返回更多信息
}

export const parseIpSolarLocation = (ip) => {
    try {
        const result = ipRegionQuery.search(ip)
        const province = normalizeProvince(result?.province)
        const coordinates = provinceSolarLocations[province]
        if (!coordinates) return null

        return {
            latitude: coordinates[0],
            longitude: coordinates[1],
            region: [result?.province, result?.city].filter(Boolean).join(' '),
        }
    } catch {
        return null
    }
}

// 解析浏览器信息
export const parseBrowser = (userAgent) => {
    // 使用ua-parser-js第三方库来解析浏览器信息
    const { browser, cpu, device } = UAParser(userAgent)
    const deviceType = device.is('mobile') ? 'mobile' : device.is('tablet') ? 'tablet' : 'desktop'
    return `${browser.name || 'unknown'} ${browser.version} ${deviceType}` // 这里可以根据需要返回更多信息
}

export const parseBrowserAndOS = (userAgent = '') => {
    const { browser, os } = UAParser(userAgent)
    const formatNameAndVersion = ({ name, version }) => [name, version].filter(Boolean).join(' ')

    return {
        browser: formatNameAndVersion(browser),
        os: formatNameAndVersion(os),
    }
}
