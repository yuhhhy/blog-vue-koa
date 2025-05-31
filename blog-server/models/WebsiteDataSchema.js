import mongoose from 'mongoose'

// 定义网站数据
export const WebsiteDataSchema = new mongoose.Schema({
    // 网站访问量，指的是来到然后离开网站的次数
    visit: {
        total: { type: Number, default: 0 },
        dailyData: [{
            date: { type: Date },
            count: { type: Number }
        }]
    },
    // 网站浏览量，指的是页面加载的次数
    view: {
        total: { type: Number, default: 0 },
        dailyData: [{
            date: { type: Date },
            count: { type: Number }
        }]
    },
    // 网站总评论数
    comment: {
        total: { type: Number, default: 0 },
        dailyData: [{
            date: { type: Date },
            count: { type: Number }
        }]
    },
    // 网站最后更新时间
    updateTime: {
        type: Date,
        default: Date.now
    }, 
    // 网站总字数
    totalWordCount: {
        type: Number,
        default: 0
    } 
})

// 添加更新日常数据的静态方法
WebsiteDataSchema.statics.updateDailyData = async function (type) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const websiteData = await this.findOne()
    if (!websiteData) {
        // 如果不存在则创建新的统计记录
        const newWebsiteData = new WebsiteData()
        await newWebsiteData.save()
        return
    }

    // 获取今天的数据索引
    const todayIndex = websiteData[type].dailyData.findIndex(data =>
        new Date(data.date).setHours(0, 0, 0, 0) === today.getTime()
    )

    if (todayIndex > -1) {
        // 如果今天已有数据，直接更新数组中的计数
        websiteData[type].dailyData[todayIndex].count += 1
    } else {
        // 如果今天没有数据，添加新的数据点
        websiteData[type].dailyData.push({
            date: today,
            count: 1
        })
    }

    // 更新总数
    websiteData[type].total += 1

    // 保存所有更改
    return await websiteData.save()
}


export const WebsiteData = mongoose.model('WebsiteData', WebsiteDataSchema)