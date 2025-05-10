import Router from '@koa/router'
import { getBlogList, getBlogById, createBlog, deleteBlog, deleteAllBlogs } from '../controllers/BlogController.js'
import { createBlogContent, getBlogContent, deleteAllBlogContents, updateBlogViewCount, updateBlogLikeCount } from '../controllers/BlogContentController.js'
import { getWebsiteData, updateWebsiteVisit, updateWebsiteView, updateWebsiteLastUpdate } from '../controllers/WebsiteDataController.js'

const router = new Router({ prefix: '/api' })
/*
* Blog API
*/
// 获取博客列表
router.get('/blog/bloglist', getBlogList)

// 获取单个博客
router.get('/blog/:id', getBlogById)

// 创建新博客
router.post('/blog', createBlog)

// 删除博客
router.delete('/blog/:id', deleteBlog)

// 删除所有博客
router.delete('/blog', deleteAllBlogs)

/*
* Blog Content API
*/
// 创建博客内容
router.post('/blogcontent', createBlogContent)

// 获取博客内容
router.get('/blogcontent/:id', getBlogContent)

// 删除所有博客内容
router.delete('/blogcontent', deleteAllBlogContents)

// 更新博客的浏览量
router.put('/blogcontent/view/:id', updateBlogViewCount)

// 更新博客的点赞量
router.put('/blogcontent/like/:id', updateBlogLikeCount)


/*
* Website Visit API
*/
// 获取网站访问量
router.get('/website', getWebsiteData)

// 更新网站访问量
router.put('/website/visit', updateWebsiteVisit)

// 更新网站浏览量
router.put('/website/view', updateWebsiteView)

// 更新网站最后更新时间
router.put('/website/lastupdate', updateWebsiteLastUpdate)

export default router