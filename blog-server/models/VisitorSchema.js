import mongoose from "mongoose"

const visitorSchema = new mongoose.Schema({
    role: { type: String, enum: ["admin", "client"], default: "client", comment: '用户角色' },
    visitedAt: { type: Date, default: Date.now, comment: '访问时间' },
    ip: { type: String, comment: '访问IP' },
    address: { type: String, comment: '访问来源' },
    browser: { type: String, comment: '设备' },
    page: { type: String, comment: '访问页面' },
    viewNum: { type: Number, default: 1, comment: '访问次数' },
})

export const Visitor = mongoose.model("Visitor", visitorSchema)