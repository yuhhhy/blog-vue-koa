import Router from '@koa/router'
import { getBlogList, getBlogById, getBlogByTitle, createBlog, deleteBlog, deleteAllBlogs, updateBlog } from '../controllers/BlogController.js'
import { createBlogContent, getBlogContent, getBlogContentList, deleteBlogContent, deleteAllBlogContents, UpdateBlogContent, updateBlogViewCount, updateBlogLikeCount } from '../controllers/BlogContentController.js'
import { getWebsiteData, updateWebsiteVisit, updateWebsiteView, updateWebsiteLastUpdate } from '../controllers/WebsiteDataController.js'
import { getComments, createComment, deleteComment, deleteAllComments } from '../controllers/CommentController.js'
import { userLogin, getuserList, getUser, createUser, deleteUser, updateUser } from '../controllers/UserController.js'
import { createVisitor, deleteVisitor, getVisitorList } from '../controllers/VisitorController.js'
import { uploadImage } from '../controllers/UploadController.js'

const router = new Router({ prefix: '/api' })

/**
 * Blog API
 */
// 获取博客列表
router.get('/blog/bloglist', getBlogList)

// 获取单个博客
router.get('/blog/:id', getBlogById)

// 通过标题获取博客
router.get('/blog/title/:title', getBlogByTitle)

// 创建新博客
router.post('/blog', createBlog)

// 删除博客
router.delete('/blog/:id', deleteBlog)

// 删除所有博客
router.delete('/blog', deleteAllBlogs)

// 更新博客
router.put('/blog/:id', updateBlog)

/**
 * Blog Content API
 */
// 创建博客内容
router.post('/blogcontent', createBlogContent)

// 获取所有博客内容
router.get('/blogcontent', getBlogContentList)

// 获取博客内容
router.get('/blogcontent/:id', getBlogContent)

// 删除一条博客内容
router.delete('/blogcontent/:id', deleteBlogContent)

// 删除所有博客内容
router.delete('/blogcontent', deleteAllBlogContents)

// 更新博客内容
router.put('/blogcontent/:id', UpdateBlogContent)

// 更新博客的浏览量
router.put('/blogcontent/view/:id', updateBlogViewCount)

// 更新博客的点赞量
router.put('/blogcontent/like/:id', updateBlogLikeCount)


/**
 * Website Data API
 */
// 获取网站访问量
router.get('/website', getWebsiteData)

// 更新网站访问量
router.put('/website/visit', updateWebsiteVisit)

// 更新网站浏览量
router.put('/website/view', updateWebsiteView)

// 更新网站最后更新时间
router.put('/website/lastupdate', updateWebsiteLastUpdate)


/**
 * Comment API
 */
// 获取一个博客的所有评论
router.get('/comment/:id', getComments)

// 创建新评论
router.post('/comment', createComment)

// 删除一条评论
router.delete('/comment/:id', deleteComment)

// 删除所有评论
router.delete('/comment', deleteAllComments)


/**
 * User API
 */
// 用户登录
router.post('/user/login', userLogin)

// 获取用户列表
router.get('/user/list', getuserList)

// 获取用户
router.get('/user/:id', getUser)

// 创建用户
router.post('/user', createUser)

// 删除用户
router.delete('/user/:id', deleteUser)

// 更新用户
router.put('/user/:id', updateUser)


/**
 * Visitor API
 */
// 新建访客记录
router.post('/visitor', createVisitor)

// 获取访客列表
router.get('/visitor', getVisitorList)

// 删除访客记录
router.delete('/visitor/:id', deleteVisitor)

/**
 * Upload API
 */
// 上传单张图片
router.post('/upload/image', uploadImage)


export default router