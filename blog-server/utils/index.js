import { UAParser } from 'ua-parser-js'
import ip2region from "ip2region"
const IP2Region = ip2region.default

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
    const query = new IP2Region({ disableIpv6: true })
    const res = query.search(ip)
    
    const { province, city, isp } = res
    return `${province} ${city} ${isp}` // 这里可以根据需要返回更多信息
}

// 解析浏览器信息
export const parseBrowser = (userAgent) => {
    // 使用ua-parser-js第三方库来解析浏览器信息
    const { browser, cpu, device } = UAParser(userAgent)
    const deviceType = device.is('mobile') ? 'mobile' : device.is('tablet') ? 'tablet' : 'desktop'
    return `${browser.name || 'unknown'} ${browser.version} ${deviceType}` // 这里可以根据需要返回更多信息
}
