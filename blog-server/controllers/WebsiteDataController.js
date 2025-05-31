import { WebsiteData } from '../models/WebsiteDataSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'

/**
 * WebsiteVisit Controller
 * 用于处理网站访问相关的操作，包括获取网站访问次数。
 * 这些操作将直接与数据库交互，返回相应的结果。
 */

// 获取网站数据
export const getWebsiteData = async (ctx) => {
    try {
        const timeRange = ctx.query.timeRange || 'all'
        const data = await WebsiteData.findOne({})

        // 根据时间范围筛选数据
        const filterData = (dailyDatas, range) => {
            const now = new Date()
            let startDate = new Date()

            switch (range) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0)
                    break
                case 'week':
                    startDate.setDate(now.getDate() - 7)
                    break
                case 'month':
                    startDate.setMonth(now.getMonth() - 1)
                    break
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1)
                    break
                default: // 'all'默认返回全部数据
                    return dailyDatas
            }

            return dailyDatas.filter(item => new Date(item.date) >= startDate)
        }

        // 处理返回数据
        ctx.status = 200
        ctx.body = {
            view: {
                total: data.view.total,
                data: filterData(data.view.dailyData, timeRange).map(item => item.count)
            },
            visit: {
                total: data.visit.total,
                data: filterData(data.visit.dailyData, timeRange).map(item => item.count)
            },
            comment: {
                total: data.comment.total,
                data: filterData(data.comment.dailyData, timeRange).map(item => item.count)
            },
            updateTime: data.updateTime,
            totalWordCount: data.totalWordCount
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = {
            code: 500,
            message: '获取统计数据失败',
            error: error.message
        }
    }
}

// 更新网站访问次数
export const updateWebsiteVisit = async (ctx) => {
    const websiteData = await WebsiteData.updateDailyData('visit')
    ctx.status = 200
    ctx.body = websiteData
}

// 更新网站浏览次数
export const updateWebsiteView = async (ctx) => {
    const websiteData = await WebsiteData.updateDailyData('view')
    ctx.status = 200
    ctx.body = websiteData
}

// 更新网站总评论数
export const updateWebsiteComment = async (ctx) => {
    const websiteData = await WebsiteData.updateDailyData('comment')
    ctx.status = 200
    ctx.body = websiteData
}

// 更新网站最后更新时间
export const updateWebsiteLastUpdate = async (ctx) => {
    const lastUpdate = await WebsiteData.findOneAndUpdate(
        {},
        { $set: { updateTime: new Date() } },
        { new: true, upsert: true }
    )
    ctx.status = 200
    ctx.body = lastUpdate
}

// 更新网站总字数
export const updataWebsitetotalWordCount = async (ctx) => {
    const blogContents = await BlogContent.find({})
    
    const totalWordCount = blogContents.reduce((sum, currentBlog) => {
        return sum + currentBlog.wordCount
    }, 0)

    // 更新数据库中的总字数
    const result = await WebsiteData.findOneAndUpdate(
        {},
        { $set: { totalWordCount } },
        { new: true, upsert: true }
    )
    
    ctx.status = 200
    ctx.body = result
}