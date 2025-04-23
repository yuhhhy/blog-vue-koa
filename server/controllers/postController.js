import { BlogPost } from '../models/PostSchema.js'

// 获取文章列表
export const listArticles = async (ctx) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 })
        ctx.body = {
            success: true,
            data: posts
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = {
            success: false,
            message: error.message
        }
    }
}

// 创建新文章
export const addArticle = async (ctx) => {
    try {
        const newPost = new BlogPost(ctx.request.body)
        const savedPost = await newPost.save()
        ctx.status = 201
        ctx.body = {
            success: true,
            data: savedPost
        }
    } catch (error) {
        ctx.status = 400
        ctx.body = {
            success: false,
            message: error.message
        }
    }
}