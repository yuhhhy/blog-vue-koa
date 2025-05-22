import { WebsiteData } from '../models/WebsiteDataSchema.js'

/**
 * WebsiteVisit Controller
 * 用于处理网站访问相关的操作，包括获取网站访问次数。
 * 这些操作将直接与数据库交互，返回相应的结果。
 */

// 获取网站数据
export const getWebsiteData = async (ctx) => {
    const data = await WebsiteData.findOne({})
    ctx.status = 200
    ctx.body = data
}

// 更新网站访问次数
export const updateWebsiteVisit = async (ctx) => {
    const visit = await WebsiteData.findOneAndUpdate({}, { $inc: { visit: 1 } }, { new: true, upsert: true })
    ctx.status = 200
    ctx.body = visit
}

// 更新网站浏览次数
export const updateWebsiteView = async (ctx) => {
    const view = await WebsiteData.findOneAndUpdate({}, { $inc: { view: 1 } }, { new: true, upsert: true })
    ctx.status = 200
    ctx.body = view
}

// 更新网站最后更新时间
export const updateWebsiteLastUpdate = async (ctx) => {
    const lastUpdate = await WebsiteData.findOneAndUpdate({}, { $set: { updateTime: new Date() } }, { new: true, upsert: true })
    ctx.status = 200
    ctx.body = lastUpdate
}