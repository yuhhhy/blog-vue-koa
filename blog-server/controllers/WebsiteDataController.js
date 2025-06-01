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

            switch (range) {
                case 'today': {
                    // 获取今天零点时间
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return dailyDatas.filter(item => new Date(item.date) >= today)
                }
                case 'week': {
                    // 创建过去7天的初始数据数组
                    const weekData = []
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(now.getDate() - i)
                        date.setHours(0, 0, 0, 0)

                        // 查找这一天是否有数据
                        const dayData = dailyDatas.find(item => {
                            const itemDate = new Date(item.date)
                            itemDate.setHours(0, 0, 0, 0)
                            return itemDate.getTime() === date.getTime()
                        })

                        weekData.push({
                            date: date,
                            count: dayData ? dayData.count : 0
                        })
                    }
                    return weekData
                }
                case 'month': {
                    // 获取当月天数
                    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

                    // 创建本月所有日期的数据数组
                    const monthData = []
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(now.getFullYear(), now.getMonth(), day)
                        date.setHours(0, 0, 0, 0)

                        // 查找这一天是否有数据
                        const dayData = dailyDatas.find(item => {
                            const itemDate = new Date(item.date)
                            itemDate.setHours(0, 0, 0, 0)
                            return itemDate.getTime() === date.getTime()
                        })

                        monthData.push({
                            date: date,
                            count: dayData ? dayData.count : 0
                        })
                    }
                    return monthData
                }
                case 'year': {
                    // 获取本年1月1号零点的时间
                    const startOfYear = new Date(now.getFullYear(), 0, 1)

                    // 首先筛选出本年的数据
                    const thisYearData = dailyDatas.filter(item => {
                        const itemDate = new Date(item.date)
                        return itemDate >= startOfYear
                    })

                    // 创建包含所有月份的初始对象
                    const initialMonthlyData = {}
                    for (let month = 0; month < 12; month++) {
                        const monthDate = new Date(now.getFullYear(), month, 1)
                        const monthKey = `${monthDate.getFullYear()}-${month}`
                        initialMonthlyData[monthKey] = {
                            date: monthDate,
                            count: 0
                        }
                    }

                    // 按月份分组并合并数据
                    const monthlyData = thisYearData.reduce((acc, curr) => {
                        const date = new Date(curr.date)
                        const monthKey = `${date.getFullYear()}-${date.getMonth()}`

                        // 累加当月数据
                        acc[monthKey].count += curr.count

                        // 如果当前日期更早，更新为月份的代表日期
                        if (new Date(curr.date) < new Date(acc[monthKey].date)) {
                            acc[monthKey].date = curr.date
                        }

                        return acc
                    }, initialMonthlyData)

                    // 转换为数组并按日期排序
                    return Object.values(monthlyData).sort((a, b) =>
                        new Date(a.date) - new Date(b.date)
                    )
                }
                    
                default: // 'all'默认返回全部数据
                    return dailyDatas
            }
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

// 获取网站数据（不含dailyData）
export const getWebsiteDataCount = async (ctx) => {
    const data = await WebsiteData.findOne({})
    ctx.status = 200
    ctx.body = {
        view: {
            total: data.view.total,
        },
        visit: {
            total: data.visit.total,
        },
        comment: {
            total: data.comment.total,
        },
        updateTime: data.updateTime,
        totalWordCount: data.totalWordCount
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