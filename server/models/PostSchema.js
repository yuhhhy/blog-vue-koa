import mongoose from 'mongoose'

// 定义博客文章的数据模型
export const BlogsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String, required: true },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
    id: { type: String, required: true },
    link: { type: String, required: true },
    content: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
})

export const Blog = mongoose.model('Blog', BlogsSchema)