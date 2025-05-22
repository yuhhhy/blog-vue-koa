import mongoose from 'mongoose'

// 定义网站访问量的数据模型
export const WebsiteDataSchema = new mongoose.Schema({
    visit: { type: Number, required: true }, // 网站访问量，指的是来到然后离开网站的次数
    view: { type: Number, required: true }, // 网站浏览量，指的是页面加载的次数
    updateTime: { type: Date, default: Date.now }, // 网站最后更新时间
})

export const WebsiteData = mongoose.model('WebsiteData', WebsiteDataSchema)