import Router from '@koa/router'
import { Blog } from '../models/PostSchema.js'
// import { getPosts } from '../controllers/postController.js'

const router = new Router({ prefix: '/api' })

// router.get('/test', getPosts)

// 获取博客列表
router.get('/bloglist', async (ctx) => {
    const posts = await Blog.find({}) // 从数据库获取所有博客文章
    ctx.status = 200
    ctx.body = posts
})

// 获取单个博客文章
router.get('/blog/:id', async (ctx) => {
    const { id } = ctx.request.params
    // 从数据库获取单个博客文章
    const blog = await Blog.findOne({ id: id })
    if (!blog) {
        console.log('Blog not found')
        ctx.status= 404
        ctx.body = { message: 'Blog not found' }
        return  
    }
    ctx.status = 200
    ctx.body = blog
})

// 创建新博客文章
router.post('/blog', async (ctx) => {

    // POST 请求体作为数据，创建新博客到数据库
    const newBlog = new Blog(ctx.request.body)
    try {
        await newBlog.save()
        ctx.status = 201
        ctx.body = { message: 'Blog created successfully', blog: newBlog }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: 'Error creating blog', error: error.message }
    }
})

// 删除博客文章
router.delete('/blog/:id', async (ctx) => {
    const { id } = ctx.request.params
    try {
        await Blog.findByIdAndDelete(id)
        ctx.status = 200
        ctx.body = { message: 'Blog deleted successfully' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: 'Error deleting blog', error: error.message }
    }
})

// 删除所有博客文章
router.delete('/posts', async (ctx) => {
    try {
        await Blog.deleteMany({})
        ctx.status = 200
        ctx.body = { message: 'All blogs deleted successfully' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: 'Error deleting blogs', error: error.message }
    }
})


export default router