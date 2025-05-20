import { Visitor } from '../models/VisitorSchema.js'
import { getIp, parseIp, parseBrowser } from '../utils/index.js' 

/**
 * Visitor Controller
 * 用于处理访客相关的操作。
 */
// 新建访客记录
export const createVisitor = async (ctx) => {
    const { role } = ctx.request.body || 'client'
    const { page } = ctx.request.body || 'home'
    const ip = getIp(ctx)
    const address = parseIp(ip)
    const browser = parseBrowser(ctx.request.headers['user-agent'])
    const today = new Date().toISOString().split('T')[0]

    const existingVisitor = await Visitor.findOne({
        ip,
        browser,
        page,
        visitedAt: {
            $gte: new Date(today) // 如果今天访问过，则符合查找条件
        }
    })

    // 如果访客记录已存在，则更新访问次数
    if (existingVisitor) {
        existingVisitor.viewNum += 1
        await existingVisitor.save()
        ctx.status = 200
        ctx.body = { message: 'Visitor updated successfully', visitor: existingVisitor }
    } else {
        // 否则创建新的访客记录
        const visitor = new Visitor({ role, ip, address, browser, page, viewNum: 1 })
        await visitor.save()
        ctx.status = 201
        ctx.body = { message: 'Visitor created successfully', visitor }
    }
}