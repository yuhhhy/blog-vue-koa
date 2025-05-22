import mongoose from "mongoose"

const visitorSchema = new mongoose.Schema({
    role: { type: String, enum: ["admin", "client"], default: "client" },
    ip: { type: String, comment: '访问IP' },
    address: { type: String , comment: '访问地址' },
    browser: { type: String, comment: '访问设备' },
    page: { type: String, comment: '访问页面' },
    viewNum: { type: Number, default: 1, comment: '访问次数' },
    visitTime: { type: Date, default: Date.now },
})

export const Visitor = mongoose.model("Visitor", visitorSchema)