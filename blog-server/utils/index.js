import { UAParser } from 'ua-parser-js'
import ip2region from "ip2region"
const IP2Region = ip2region.default

// 获取IP地址
// 代理处理
export const getIp = (ctx) => {
    // 按优先级获取IP
    const ip = 
        ctx.req.headers['x-forwarded-for']?.split(',')[0] || // 代理转发的真实IP
        ctx.req.headers['x-real-ip'] || // nginx代理的真实IP
        ctx.req.socket.remoteAddress?.replace(/^::ffff:/, '') || // IPv4
        ctx.request.ip || 
        '0.0.0.0' // 默认值
    
    // 如果是本地测试，返回实际的局域网IP
    if (ip === '127.0.0.1' || ip === '::1') {
        return '116.162.214.228'
    }
    // 内网ip 192.168.238.43
    // 公网ip 116.162.214.228

    return ip
}

// 解析IP地址
export const parseIp = (ip) => {
    // 这里可以使用第三方库来解析IP地址
    // 例如：ip2region、geoip-lite等
    const query = new IP2Region({ disableIpv6: true })
    console.log('ip' , ip);
    
    const res = query.search(ip)
    console.log('res', res)
    
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