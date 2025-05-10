import Router from '@koa/router'
import { Blog } from '../models/BlogSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'
// import { getPosts } from '../controllers/postController.js'

const router = new Router({ prefix: '/api' })
// router.get('/test', getPosts)

/*
* Blog API
*/

// 获取博客列表
router.get('/blog/bloglist', async (ctx) => {
    const posts = await Blog.find({}) // 从数据库获取所有博客文章
    ctx.status = 200
    ctx.body = posts
})

// 获取单个博客
router.get('/blog/:id', async (ctx) => {
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
})

// 创建新博客
router.post('/blog', async (ctx) => {

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
})

// 删除博客
router.delete('/blog/:id', async (ctx) => {
    const { id } = ctx.request.params
    try {
        await Blog.findByIdAndDelete(id)
        ctx.status = 200
        ctx.body = { message: '博客删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '博客删除失败', error: error.message }
    }
})

// 删除所有博客
router.delete('/blog', async (ctx) => {
    try {
        await Blog.deleteMany({})
        ctx.status = 200
        ctx.body = { message: '全部博客删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '全部博客删除失败', error: error.message }
    }
})


/*
* Blog Content API
*/

// 创建博客内容
router.post('/blogcontent', async (ctx) => {
    const newBlogContent = new BlogContent(ctx.request.body)
    try {
        await newBlogContent.save()
        ctx.status = 201
        ctx.body = { message: '博客创建成功', blog: newBlogContent }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '博客创建失败', error: error.message }
    }
})

// 获取博客内容
router.get('/blogcontent/:id', async (ctx) => {
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
})

// 更新博客的浏览量
router.put('/blogcontent/:id', async (ctx) => {
    const { id } = ctx.request.params
    try {
        const blog = await Blog.findById(id)
        if (!blog) {
            ctx.status = 404
            ctx.body = { message: '博客不存在' }
            return
        }
        console.log('ctx.request.body: ', ctx.request.body)
        blog.views += 1 // 增加浏览量
        await blog.save()
        ctx.status = 200
        ctx.body = { message: '浏览量更新成功', views: blog.views }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '浏览量更新失败', error: error.message }
    }   
})

// 删除所有博客内容
router.delete('/blogcontent', async (ctx) => {
    try {
        await BlogContent.deleteMany({})
        ctx.status = 200
        ctx.body = { message: '全部博客内容删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '全部博客内容删除失败', error: error.message }
    }
})

export default router