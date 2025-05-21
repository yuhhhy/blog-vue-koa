import { BlogContent } from '../models/BlogContentSchema.js'

/**
 * BlogContent Controller
 * 用于处理博客内容相关的操作，包括获取博客内容、创建新博客内容、删除博客内容等。
 * 这些操作将直接与数据库交互，返回相应的结果。
 */

// 创建博客内容
export const createBlogContent = async (ctx) => {
    const newBlogContent = new BlogContent(ctx.request.body)
    try {
        await newBlogContent.save()
        ctx.status = 201
        ctx.body = { message: '博客创建成功', blog: newBlogContent }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '博客创建失败', error: error.message }
    }
}

// 获取博客内容
export const getBlogContent = async (ctx) => {
    const { id } = ctx.request.params
    // 从数据库获取单个博客文章
    const newBlogContent = await BlogContent.findOne({ id: id })
    if (!newBlogContent) {
        console.log('博客不存在')
        ctx.status = 404
        ctx.body = { message: '博客不存在' }
        return
    }
    ctx.status = 200
    ctx.body = newBlogContent
}

// 获取所有博客内容
export const getBlogContentList = async (ctx) => {
    const blogContents = await BlogContent.find({})
    ctx.status = 200
    ctx.body = blogContents
}

// 删除一条博客内容
export const deleteBlogContent = async (ctx) => {
    const { id } = ctx.request.params
    const deletedBlogContent = await BlogContent.findOneAndDelete({ id })
    ctx.status = 200
    ctx.body = deletedBlogContent
}

// 删除所有博客内容
export const deleteAllBlogContents = async (ctx) => {
    try {
        await BlogContent.deleteMany({})
        ctx.status = 200
        ctx.body = { message: '全部博客内容删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '全部博客内容删除失败', error: error.message }
    }
}

// 更新博客内容
export const UpdateBlogContent = async (ctx) => {
    const { id } = ctx.request.params
    try {
        const blogContent = await BlogContent.findOne({ id: id })
        blogContent.author = ctx.request.body.author || blogContent.author
        blogContent.coverImage = ctx.request.body.coverImage || blogContent.coverImage
        blogContent.date = ctx.request.body.date || blogContent.date
        blogContent.tags = ctx.request.body.tags || blogContent.tags
        blogContent.content = ctx.request.body.content || blogContent.content
        blogContent.wordCount = ctx.request.body.wordCount || blogContent.wordCount
        
        await blogContent.save()
        ctx.status = 200
        ctx.body = { message: '博客内容更新成功', blogContent: blogContent }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '博客内容更新失败', error: error.message }
    }
}

// 更新博客的浏览量
export const updateBlogViewCount = async (ctx) => {
    const { id } = ctx.request.params
    try {
        const blogContent = await BlogContent.findOne({ id: id })
        if (!blogContent) {
            ctx.status = 404
            ctx.body = { message: '博客不存在' }
            return
        }
        blogContent.viewCount += 1 // 增加浏览量
        await blogContent.save()
        ctx.status = 200
        ctx.body = { message: '浏览量更新成功', viewCount: blogContent.viewCount }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '浏览量更新失败', error: error.message }
    }   
}

// 更新博客的点赞量
export const updateBlogLikeCount = async (ctx) => {
    const { id } = ctx.request.params
    try {
        const blogContent = await BlogContent.findOne({ id: id })
        if (!blogContent) {
            ctx.status = 404
            ctx.body = { message: '博客不存在' }
            return
        }
        blogContent.likeCount += 1 // 增加点赞量
        await blogContent.save()
        ctx.status = 200
        ctx.body = { message: '点赞量更新成功', likeCount: blogContent.likeCount }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '点赞量更新失败', error: error.message }
    }
}