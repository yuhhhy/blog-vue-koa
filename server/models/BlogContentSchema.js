import mongoose from 'mongoose'

// 定义博客内容的数据模型
export const BlogContentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String, required: true },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
    content: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
})

export const BlogContent = mongoose.model('BlogContent', BlogContentSchema)