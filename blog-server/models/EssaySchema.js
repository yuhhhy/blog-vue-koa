import mongoose from 'mongoose'

const EssaySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
})

export const Essay = mongoose.model('Essay', EssaySchema)
