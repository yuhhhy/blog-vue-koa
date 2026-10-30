import Router from '@koa/router'
import multer from '@koa/multer'
import { getBlogList, getBlogById, createBlog, deleteBlog, deleteAllBlogs, updateBlog } from '../controllers/BlogController.js'
import { createBlogContent, getBlogContent, getBlogContentList, deleteBlogContent, deleteAllBlogContents, UpdateBlogContent, updateBlogViewCount, updateBlogLikeCount } from '../controllers/BlogContentController.js'
import { createArticleDraft, deleteArticleDraft, getArticleDraft, getArticleDrafts, publishArticleDraft, updateArticleDraft } from '../controllers/ArticleDraftController.js'
import { getWebsiteData, getWebsiteDataCount, updateWebsiteVisit, updateWebsiteView, updateWebsiteComment, updateWebsiteArticle, updateWebsiteLastUpdate, updataWebsitetotalWordCount } from '../controllers/WebsiteDataController.js'
import { getAllComments, getComments, createComment, reviewComment, deleteComment, updateComment, getPendingComments, sendEmailNotification } from '../controllers/CommentController.js'
import { userLogin, getuserList, getUser, createUser, deleteUser, updateUser } from '../controllers/UserController.js'
import { createVisitor, deleteVisitor, getVisitorList } from '../controllers/VisitorController.js'
import { getLinks, createLink, deleteLink, updateLink, getLinkAvatar } from '../controllers/LinksController.js'
import { getImageFiles, deleteImageFile, reuploadImageFile, generateImageFileVariants } from "../controllers/FilesController.js"
import { deleteLargeFile, downloadLargeFile, getLargeFiles, getLargeUploadStatus, initLargeUpload, mergeLargeFile, uploadLargeChunk, verifyLargeFile } from '../controllers/LargeFilesController.js'
import { requireAdmin } from '../middlewares/auth.js'
import { storage } from '../config/upload.js'
import { convertImageToAvif, generateImageVariants } from '../utils/imageVariants.js'
import { checkReadiness } from '../utils/readiness.js'
import { getEssays, createEssay, updateEssay, deleteEssay } from '../controllers/EssayController.js'
import { createEssayDraft, deleteEssayDraft, getEssayDraft, getEssayDrafts, updateEssayDraft } from '../controllers/EssayDraftController.js'

const router = new Router({ prefix: '/api' })
const upload = multer({ storage })
const largeChunkUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
})

// 部署健康检查：只确认 Node 进程和路由能正常响应。
router.get('/health', (ctx) => {
    ctx.status = 200
    ctx.body = { status: 'ok' }
})

// 部署就绪检查：确认数据源已连接，且静态资源目录可读写。
router.get('/ready', async (ctx) => {
    const readiness = await checkReadiness()

    ctx.status = readiness.ready ? 200 : 503
    ctx.body = {
        status: readiness.ready ? 'ready' : 'not_ready',
        dataSource: readiness.dataSource,
        checks: readiness.checks,
    }
})

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
 * Article Draft API
 */
router.get('/drafts', requireAdmin, getArticleDrafts)
router.post('/drafts', requireAdmin, createArticleDraft)
router.get('/drafts/:id', requireAdmin, getArticleDraft)
router.put('/drafts/:id', requireAdmin, updateArticleDraft)
router.delete('/drafts/:id', requireAdmin, deleteArticleDraft)
router.post('/drafts/:id/publish', requireAdmin, publishArticleDraft)

/**
 * Essay API
 */
router.get('/essays', getEssays)
router.post('/essays', requireAdmin, createEssay)
router.put('/essays/:id', requireAdmin, updateEssay)
router.delete('/essays/:id', requireAdmin, deleteEssay)
router.get('/essay-drafts', requireAdmin, getEssayDrafts)
router.post('/essay-drafts', requireAdmin, createEssayDraft)
router.get('/essay-drafts/:id', requireAdmin, getEssayDraft)
router.put('/essay-drafts/:id', requireAdmin, updateEssayDraft)
router.delete('/essay-drafts/:id', requireAdmin, deleteEssayDraft)


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
router.get('/links/:id/avatar', getLinkAvatar)

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

// 重传图片，保持文件名和访问地址不变
router.put('/files/images/:filename(.+)', requireAdmin, upload.single('file'), reuploadImageFile);

// 为指定图片生成缩略图
router.post('/files/images/:filename(.+)/variants', requireAdmin, generateImageFileVariants);

// 删除图片文件
router.delete('/files/images/:filename(.+)', requireAdmin, deleteImageFile);

// 获取大文件列表
router.get('/files/large', requireAdmin, getLargeFiles);

// 删除大文件
router.delete('/files/large/:type/:filename', requireAdmin, deleteLargeFile);

// 下载大文件
router.get('/files/large/:type/:filename/download', requireAdmin, downloadLargeFile);

/**
 * Upload API
 */

// 上传单张图片
router.post('/upload/image', requireAdmin, upload.single('file'), async (ctx) => {
    const file = ctx.request.file

    if (file?.mimetype?.startsWith('image/')) {
        const shouldConvertToAvif = ctx.request.body?.convertToAvif === 'true'

        if (shouldConvertToAvif) {
            const convertedFile = await convertImageToAvif(file.path, file.filename)
            file.path = convertedFile.path
            file.filename = convertedFile.filename
            file.originalname = convertedFile.filename
            file.mimetype = 'image/avif'
        }

        await generateImageVariants(file.path, file.filename, file.destination)
    }

    ctx.status = 200
    ctx.body = file
})

// 查询大文件分片上传状态
router.get('/upload/large/status', requireAdmin, getLargeUploadStatus);

// 校验大文件是否已上传
router.get('/upload/large/verify', requireAdmin, verifyLargeFile);

// 初始化大文件上传，返回秒传和断点续传信息
router.post('/upload/large/init', requireAdmin, initLargeUpload);

// 上传大文件分片
router.post('/upload/large/chunk', requireAdmin, largeChunkUpload.single('file'), uploadLargeChunk);

// 合并大文件分片
router.post('/upload/large/merge', requireAdmin, mergeLargeFile);

export default router
