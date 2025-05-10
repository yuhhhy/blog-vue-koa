import mongoose from 'mongoose'

// 定义博客文章的数据模型
export const BlogSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    coverImage: { type: String, required: true },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
    link: { type: String, required: true },
})

export const Blog = mongoose.model('Blog', BlogSchema)