import { Visitor } from '../models/VisitorSchema.js'
import { WebsiteData } from '../models/WebsiteDataSchema.js'
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
    
    // 使用本地时间获取今天的日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 计算20分钟前的时间点
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000)

    const existingVisitor = await Visitor.findOne({
        ip,
        browser,
        page,
        visitTime: {
            $gte: twentyMinutesAgo
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


// 获取访客列表 分页查询
export const getVisitorList = async (ctx) => {
    const { page = 1, limit = 10 } = ctx.query
    const skip = (page - 1) * limit

    try {
        const visitors = await Visitor.find()
            .skip(skip)
            .limit(limit)
            .sort({ visitTime: -1 }) // 按照创建时间降序排序
        const totalVisitors = await Visitor.countDocuments()

        ctx.status = 200
        ctx.body = {
            message: 'Visitor list retrieved successfully',
            visitors,
            total: totalVisitors,
            page: parseInt(page),
            limit: parseInt(limit)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: 'Error retrieving visitor list', error }
    }
}

// 删除访客记录
export const deleteVisitor = async (ctx) => {  
    const { id } = ctx.params
    
    try {
        // 先查找要删除的访客记录
        const visitorToDelete = await Visitor.findById(id)
        
        if (!visitorToDelete) {
            ctx.status = 404
            ctx.body = { message: '访客记录不存在' }
            return
        }

        // 获取访客记录的日期（使用本地时区）
        const visitDate = new Date(visitorToDelete.visitTime)
        visitDate.setHours(0, 0, 0, 0)

        // 删除访客记录
        await Visitor.findByIdAndDelete(id)

        // 1. 更新总计数据
        await WebsiteData.updateOne(
            {},
            {
                $inc: {
                    'visit.total': -1,
                    'view.total': -visitorToDelete.viewNum
                }
            }
        )

        // 2. 减少 visit.dailyData 中对应日期的计数
        const visitUpdateResult = await WebsiteData.updateOne(
            {
                'visit.dailyData.date': visitDate
            },
            {
                $inc: {
                    'visit.dailyData.$.count': -1
                }
            }
        )

        // 3. 减少 view.dailyData 中对应日期的计数
        const viewUpdateResult = await WebsiteData.updateOne(
            {
                'view.dailyData.date': visitDate
            },
            {
                $inc: {
                    'view.dailyData.$.count': -visitorToDelete.viewNum
                }
            }
        )

        // 4. 清理计数为0或负数的日期项
        if (visitUpdateResult.matchedCount > 0) {
            await WebsiteData.updateOne(
                {},
                {
                    $pull: {
                        'visit.dailyData': {
                            date: visitDate,
                            count: { $lte: 0 }
                        }
                    }
                }
            )
        }

        if (viewUpdateResult.matchedCount > 0) {
            await WebsiteData.updateOne(
                {},
                {
                    $pull: {
                        'view.dailyData': {
                            date: visitDate,
                            count: { $lte: 0 }
                        }
                    }
                }
            )
        }

        ctx.status = 200
        ctx.body = {
            message: '访客记录删除成功',
            deletedVisitor: visitorToDelete
        }
    } catch (error) {
        console.error('删除访客记录失败:', error)
        ctx.status = 500
        ctx.body = { 
            message: '删除访客记录失败', 
            error: error.message 
        }
    }
}