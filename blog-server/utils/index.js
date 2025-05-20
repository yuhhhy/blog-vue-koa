import { UAParser } from 'ua-parser-js';

// 获取IP地址
export const getIp = (ctx) => {
    const ip = ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress || ctx.req.socket.remoteAddress || ctx.request.ip
}

// 解析IP地址
export const parseIp = (ip) => {
    // 这里可以使用第三方库来解析IP地址
    // 例如：ip2region、geoip-lite等
    // 这里简单返回IP地址作为示例
    return ip
}

// 解析浏览器信息
export const parseBrowser = (userAgent) => {
    // 使用ua-parser-js第三方库来解析浏览器信息
    const { browser, cpu, device } = UAParser(userAgent);
    const deviceType = device.is('mobile') ? 'mobile' : device.is('tablet') ? 'tablet' : 'desktop'
    return `${browser.name || 'unknown'} ${browser.version} ${deviceType}` // 这里可以根据需要返回更多信息
}