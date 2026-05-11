import Router from '@koa/router'
import multer from '@koa/multer'
import { getBlogList, getBlogById, createBlog, deleteBlog, deleteAllBlogs, updateBlog, getPrevBlog, getNextBlog } from '../controllers/BlogController.js'
import { createBlogContent, getBlogContent, getBlogContentList, deleteBlogContent, deleteAllBlogContents, UpdateBlogContent, updateBlogViewCount, updateBlogLikeCount } from '../controllers/BlogContentController.js'
import { getWebsiteData, getWebsiteDataCount, updateWebsiteVisit, updateWebsiteView, updateWebsiteComment, updateWebsiteArticle, updateWebsiteLastUpdate, updataWebsitetotalWordCount } from '../controllers/WebsiteDataController.js'
import { getAllComments, getComments, createComment, reviewComment, deleteComment, updateComment, getPendingComments, sendEmailNotification } from '../controllers/CommentController.js'
import { userLogin, getuserList, getUser, createUser, deleteUser, updateUser } from '../controllers/UserController.js'
import { createVisitor, deleteVisitor, getVisitorList } from '../controllers/VisitorController.js'
import { getLinks, createLink, deleteLink, updateLink } from '../controllers/LinksController.js'
import { getImageFiles, deleteImageFile, getMdFiles, deleteMdFile } from "../controllers/FilesController.js"
import { requireAdmin } from '../middlewares/auth.js'
import { storage } from '../config/upload.js'

const router = new Router({ prefix: '/api' })
const upload = multer({ storage })

/**
 * Blog API
 */
// 获取博客列表
router.get('/blog/bloglist', getBlogList)

// 获取单个博客
router.get('/blog/:id', getBlogById)

// 创建新博客
router.post('/blog', requireAdmin, createBlog)

// 删除博客
router.delete('/blog/:id', requireAdmin, deleteBlog)

// 删除所有博客
router.delete('/blog', requireAdmin, deleteAllBlogs)

// 更新博客
router.put('/blog/:id', requireAdmin, updateBlog)

// 获取上一篇博客
router.get('/blog/prev/:id', getPrevBlog)

// 获取下一篇博客
router.get('/blog/next/:id', getNextBlog)

/**
 * Blog Content API
 */
// 创建博客内容
router.post('/blogcontent', requireAdmin, createBlogContent)

// 获取所有博客内容
router.get('/blogcontent', getBlogContentList)

// 获取博客内容
router.get('/blogcontent/:id', getBlogContent)

// 删除一条博客内容
router.delete('/blogcontent/:id', requireAdmin, deleteBlogContent)

// 删除所有博客内容
router.delete('/blogcontent', requireAdmin, deleteAllBlogContents)

// 更新博客内容
router.put('/blogcontent/:id', requireAdmin, UpdateBlogContent)

// 更新博客的浏览量
router.put('/blogcontent/view/:id', updateBlogViewCount)

// 更新博客的点赞量
router.put('/blogcontent/like/:id', updateBlogLikeCount)


/**
 * Website Data API
 */
// 获取网站访问量
router.get('/website', getWebsiteData)

// 获取网站数据（不含dailyData）
router.get('/website/count', getWebsiteDataCount)

// 更新网站访问量
router.put('/website/visit', updateWebsiteVisit)

// 更新网站浏览量
router.put('/website/view', updateWebsiteView)

// 更新网站总评论数
router.put('/website/comment', updateWebsiteComment)

// 更新网站总博客数
router.put('/website/article', requireAdmin, updateWebsiteArticle)

// 更新网站最后更新时间
router.put('/website/lastupdate', requireAdmin, updateWebsiteLastUpdate)

// 更新网站总字数
router.put('/website/totalwordcount', requireAdmin, updataWebsitetotalWordCount)

/**
 * Comment API
 */
// 获取所有评论
router.get('/comment', requireAdmin, getAllComments)

// 获取所有待审核评论
// /comment/:id 路由会捕获所有 /comment/xxx 格式的请求，包括 /comment/pending
// 需要确整路由的注册顺序
router.get('/comment/pending', requireAdmin, getPendingComments)

// 获取一个博客的所有评论
router.get('/comment/:id', getComments)

// 给父评论的邮箱发送邮件通知
router.post('/comment/email', sendEmailNotification)

// 创建新评论
router.post('/comment', createComment)

// 审核一条评论
router.put('/comment/review/:id', requireAdmin, reviewComment)

// 删除一条评论
router.delete('/comment/:id', requireAdmin, deleteComment)

// 更新评论
router.put('/comment/:id', requireAdmin, updateComment)



/**
 * User API
 */
// 用户登录
router.post('/user/login', userLogin)

// 获取用户列表
router.get('/user/list', requireAdmin, getuserList)

// 获取用户
router.get('/user/:id', requireAdmin, getUser)

// 创建用户
router.post('/user', requireAdmin, createUser)

// 删除用户
router.delete('/user/:id', requireAdmin, deleteUser)

// 更新用户
router.put('/user/:id', requireAdmin, updateUser)


/**
 * Visitor API
 */
// 新建访客记录
router.post('/visitor', createVisitor)

// 获取访客列表
router.get('/visitor', requireAdmin, getVisitorList)

// 删除访客记录
router.delete('/visitor/:id', requireAdmin, deleteVisitor)

/**
 * Links API
 */
// 获取所有友链
router.get('/links', getLinks)

// 创建友链
router.post('/links', requireAdmin, createLink)

// 删除友链
router.delete('/links/:id', requireAdmin, deleteLink)

// 更新友链
router.put('/links/:id', requireAdmin, updateLink)

/**
 * Files API
 */
// 获取图片列表
router.get('/files/images', requireAdmin, getImageFiles);

// 删除图片文件
router.delete('/files/images/:filename', requireAdmin, deleteImageFile);

// 获取 Markdown 文件列表
router.get("/files/mds", requireAdmin, getMdFiles);

// 删除 Markdown 文件
router.delete("/files/mds/:filename", requireAdmin, deleteMdFile);

/**
 * Upload API
 */

// 上传单张图片
router.post('/upload/image', requireAdmin, upload.single('file'), async (ctx) => {
    ctx.status = 200
    ctx.body = ctx.request.file
})

// 上传单个Markdown文件
router.post("/upload/md", requireAdmin, upload.single('file'), async (ctx) => {
    ctx.status = 200;
    ctx.body = ctx.request.file;
});

export default router
