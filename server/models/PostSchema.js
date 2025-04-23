import mongoose from 'mongoose'

// 定义博客文章的数据模型
export const BlogsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    coverImage: { type: String, default: '' },
    tags: { type: [String], default: [] }
})

export const Blog = mongoose.model('Blog', BlogsSchema)