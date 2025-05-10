import { Blog } from '../models/BlogSchema.js'

/*
* Blog Controller
* 用于处理博客相关的操作，包括获取博客列表、获取单个博客、创建新博客、删除博客等。
* 这些操作将直接与数据库交互，返回相应的结果。
*/

// 获取博客列表
export const getBlogList = async (ctx) => {
    const posts = await Blog.find({}) // 从数据库获取所有博客文章
    ctx.status = 200
    ctx.body = posts
}

// 通过id获取博客
export const getBlogById = async (ctx) => {
    const { id } = ctx.request.params
    // 从数据库获取单个博客文章
    const blog = await Blog.findOne({ id: id })
    if (!blog) {
        console.log('博客不存在')
        ctx.status= 404
        ctx.body = { message: '博客不存在' }
        return  
    }
    ctx.status = 200
    ctx.body = blog
}

// 创建新博客
export const createBlog = async (ctx) => {
    // POST 请求体作为数据，创建新博客到数据库
    const newBlog = new Blog(ctx.request.body)
    try {
        await newBlog.save()
        ctx.status = 201
        ctx.body = { message: '博客创建成功', blog: newBlog }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '博客创建失败', error: error.message }
    }
}

// 删除博客
export const deleteBlog = async (ctx) => {
    const { id } = ctx.request.params
    try {
        await Blog.findByIdAndDelete(id)
        ctx.status = 200
        ctx.body = { message: '博客删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '博客删除失败', error: error.message }
    }
}

// 删除所有博客
export const deleteAllBlogs = async (ctx) => {
    try {
        await Blog.deleteMany({})
        ctx.status = 200
        ctx.body = { message: '全部博客删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '全部博客删除失败', error: error.message }
    }
}