import Router from '@koa/router'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import KEY from '../config/key.js'
import {
    createMockWebsiteData,
    mockComments,
    mockLinks,
    mockPosts,
    mockUsers,
    mockVisitors,
} from './data.js'

const clone = (value) => structuredClone(value)
const router = new Router({ prefix: '/api' })

const createExcerpt = (content = '', maxLength = 96) => {
    const text = content
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#>*_~|[\](){}-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    const characters = Array.from(text)
    const excerpt = characters.slice(0, maxLength).join('')
    return characters.length > maxLength ? `${excerpt}...` : excerpt || '暂无摘要'
}

const countWords = (content = '') => Array.from(content.replace(/\s+/g, '')).length

const createBlog = (post) => ({
    id: post.id,
    title: post.title,
    coverImage: post.coverImage,
    createTime: post.createTime,
    updateTime: post.updateTime,
    tags: clone(post.tags || []),
    link: post.link || `/blog/${post.id}`,
})

const createContent = (post) => ({
    ...clone(post),
    wordCount: post.wordCount || countWords(post.content),
})

const state = {
    blogs: mockPosts.map(createBlog),
    contents: mockPosts.map(createContent),
    comments: clone(mockComments),
    links: clone(mockLinks),
    users: clone(mockUsers),
    visitors: clone(mockVisitors),
    drafts: [],
    website: createMockWebsiteData(),
}

const findById = (items, id) => items.find((item) => item.id === id)

const notFound = (ctx, message) => {
    ctx.status = 404
    ctx.body = { message }
}

const setNoContent = (ctx) => {
    ctx.status = 204
    ctx.body = null
}

const addDailyCount = (metric) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const key = today.toISOString()
    const daily = state.website[metric].dailyData
    const item = daily.find((entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime())

    if (item) item.count += 1
    else daily.push({ date: key, count: 1 })
    state.website[metric].total += 1
    return clone(state.website[metric])
}

const publicComments = (blogId) => {
    const visible = state.comments.filter((comment) => (
        comment.blogId === blogId
        && (!comment.reviewed || comment.reviewPassed !== false)
    ))

    const buildTree = (parentId = '-1') => visible
        .filter((comment) => comment.parentId === parentId)
        .map((comment) => ({
            ...clone(comment),
            replies: buildTree(comment.id),
        }))

    return buildTree()
}

const getAdjacentBlog = (id, direction) => {
    const sorted = [...state.blogs].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    const index = sorted.findIndex((blog) => blog.id === id)
    if (index < 0) return null
    return direction === 'prev' ? sorted[index - 1] : sorted[index + 1]
}

router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', dataSource: 'mock' }
})

router.get('/blog/bloglist', (ctx) => {
    const contentMap = new Map(state.contents.map((item) => [item.id, item.content]))
    ctx.body = [...state.blogs]
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .map((blog) => ({ ...clone(blog), excerpt: createExcerpt(contentMap.get(blog.id)) }))
})

router.get('/blog/prev/:id', (ctx) => {
    const blog = getAdjacentBlog(ctx.params.id, 'prev')
    ctx.body = blog
        ? { found: true, message: '找到上一篇博客', prevBlog: clone(blog) }
        : { found: false, message: '已经是最新一篇博客' }
})

router.get('/blog/next/:id', (ctx) => {
    const blog = getAdjacentBlog(ctx.params.id, 'next')
    ctx.body = blog
        ? { found: true, message: '找到下一篇博客', nextBlog: clone(blog) }
        : { found: false, message: '已经是最后一篇博客' }
})

router.get('/blog/:id', (ctx) => {
    const blog = findById(state.blogs, ctx.params.id)
    if (!blog) return notFound(ctx, '博客不存在')
    ctx.body = clone(blog)
})

router.post('/blog', (ctx) => {
    const blog = createBlog({ ...ctx.request.body, updateTime: ctx.request.body.updateTime || new Date().toISOString() })
    state.blogs.push(blog)
    ctx.status = 201
    ctx.body = { message: '博客创建成功', blog: clone(blog) }
})

router.put('/blog/:id', (ctx) => {
    const blog = findById(state.blogs, ctx.params.id)
    if (!blog) return notFound(ctx, '博客不存在')
    Object.assign(blog, clone(ctx.request.body), { updateTime: new Date().toISOString() })
    ctx.body = { message: '博客更新成功', blog: clone(blog) }
})

router.delete('/blog/:id', (ctx) => {
    state.blogs = state.blogs.filter((blog) => blog.id !== ctx.params.id)
    setNoContent(ctx)
})

router.delete('/blog', (ctx) => {
    state.blogs = []
    setNoContent(ctx)
})

router.get('/blogcontent/search-index', (ctx) => {
    ctx.body = state.contents.map(({ id, title, tags, content, createTime }) => ({
        id,
        title,
        tags: clone(tags),
        content,
        createTime,
        link: `/blog/${id}`,
    }))
})

router.get('/blogcontent', (ctx) => {
    ctx.body = [...state.contents]
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .map(clone)
})

router.get('/blogcontent/:id', (ctx) => {
    const content = findById(state.contents, ctx.params.id)
    if (!content) return notFound(ctx, '博客不存在')
    ctx.body = clone(content)
})

router.post('/blogcontent', (ctx) => {
    const content = createContent(ctx.request.body)
    state.contents.push(content)
    ctx.status = 201
    ctx.body = { message: '博客创建成功', blog: clone(content) }
})

router.put('/blogcontent/view/:id', (ctx) => {
    const content = findById(state.contents, ctx.params.id)
    if (!content) return notFound(ctx, '博客不存在')
    content.viewCount = (content.viewCount || 0) + 1
    ctx.body = { message: '浏览量更新成功', viewCount: content.viewCount }
})

router.put('/blogcontent/like/:id', (ctx) => {
    const content = findById(state.contents, ctx.params.id)
    if (!content) return notFound(ctx, '博客不存在')
    content.likeCount = (content.likeCount || 0) + 1
    ctx.body = { message: '点赞量更新成功', likeCount: content.likeCount }
})

router.put('/blogcontent/:id', (ctx) => {
    const content = findById(state.contents, ctx.params.id)
    if (!content) return notFound(ctx, '博客不存在')
    Object.assign(content, clone(ctx.request.body), {
        updateTime: new Date().toISOString(),
        wordCount: countWords(ctx.request.body.content ?? content.content),
    })
    ctx.body = { message: '博客内容更新成功', blogContent: clone(content) }
})

router.delete('/blogcontent/:id', (ctx) => {
    state.contents = state.contents.filter((content) => content.id !== ctx.params.id)
    setNoContent(ctx)
})

router.delete('/blogcontent', (ctx) => {
    state.contents = []
    setNoContent(ctx)
})

router.get('/comment/pending', (ctx) => {
    ctx.body = state.comments.filter((comment) => !comment.reviewed).map(clone)
})

router.get('/comment', (ctx) => {
    ctx.body = state.comments.map(clone)
})

router.get('/comment/:id', (ctx) => {
    ctx.body = publicComments(ctx.params.id)
})

router.post('/comment', (ctx) => {
    const comment = {
        id: ctx.request.body.id || randomUUID(),
        blogId: ctx.request.body.blogId,
        parentId: ctx.request.body.parentId || '-1',
        avatar: ctx.request.body.avatar || 'https://api.dicebear.com/9.x/thumbs/svg?seed=Anonymous',
        username: ctx.request.body.username || '匿名读者',
        email: ctx.request.body.email || 'anonymous@example.com',
        website: ctx.request.body.website || '',
        content: ctx.request.body.content || '',
        createTime: ctx.request.body.createTime || new Date().toISOString(),
        showForm: false,
        hasParent: ctx.request.body.hasParent === true,
        replies: [],
        reviewed: false,
    }
    state.comments.push(comment)
    const parent = findById(state.comments, comment.parentId)
    if (parent) parent.replies.push(comment.id)
    addDailyCount('comment')
    ctx.status = 201
    ctx.body = { message: '评论创建成功', comment: clone(comment) }
})

router.post('/comment/email', (ctx) => {
    ctx.body = { message: '开发环境已跳过邮件发送' }
})

router.put('/comment/review/:id', (ctx) => {
    const comment = findById(state.comments, ctx.params.id)
    if (!comment) return notFound(ctx, '评论不存在')
    comment.reviewed = true
    comment.reviewPassed = ctx.request.body.passed === true
    ctx.body = { message: '审核成功' }
})

router.put('/comment/:id', (ctx) => {
    const comment = findById(state.comments, ctx.params.id)
    if (!comment) return notFound(ctx, '评论不存在')
    Object.assign(comment, clone(ctx.request.body))
    ctx.body = { message: '评论更新成功', comment: clone(comment) }
})

router.delete('/comment/:id', (ctx) => {
    const comment = findById(state.comments, ctx.params.id)
    if (!comment) return notFound(ctx, '评论不存在')
    state.comments = state.comments.filter((item) => item.id !== comment.id)
    state.comments.forEach((item) => {
        item.replies = item.replies.filter((id) => id !== comment.id)
    })
    state.website.comment.total = Math.max(0, state.website.comment.total - 1)
    ctx.body = { message: '评论删除成功' }
})

const websiteResponse = (timeRange = 'all') => {
    const lengthByRange = { today: 1, week: 7, month: 30, year: 365 }
    const limit = lengthByRange[timeRange]
    const values = (metric) => {
        const items = limit ? state.website[metric].dailyData.slice(-limit) : state.website[metric].dailyData
        return items.map((item) => item.count)
    }

    return {
        view: { total: state.website.view.total, data: values('view') },
        visit: { total: state.website.visit.total, data: values('visit') },
        comment: { total: state.website.comment.total, data: values('comment') },
        article: { total: state.website.article.total, data: clone(state.website.article.dailyData) },
        updateTime: state.website.updateTime,
        totalWordCount: state.website.totalWordCount,
    }
}

router.get('/website', (ctx) => {
    ctx.body = websiteResponse(ctx.query.timeRange)
})

router.get('/website/count', (ctx) => {
    ctx.body = {
        view: { total: state.website.view.total },
        visit: { total: state.website.visit.total },
        comment: { total: state.website.comment.total },
        article: { total: state.website.article.total },
        updateTime: state.website.updateTime,
        totalWordCount: state.website.totalWordCount,
    }
})

for (const metric of ['visit', 'view', 'comment', 'article']) {
    router.put(`/website/${metric}`, (ctx) => {
        ctx.body = addDailyCount(metric)
    })
}

router.put('/website/lastupdate', (ctx) => {
    state.website.updateTime = new Date().toISOString()
    ctx.body = clone(state.website)
})

router.put('/website/totalwordcount', (ctx) => {
    state.website.totalWordCount = state.contents.reduce((total, item) => total + (item.wordCount || 0), 0)
    ctx.body = clone(state.website)
})

router.get('/links', (ctx) => {
    ctx.body = state.links.map(clone)
})

router.post('/links', (ctx) => {
    const link = clone(ctx.request.body)
    state.links.push(link)
    ctx.status = 201
    ctx.body = clone(link)
})

router.put('/links/:id', (ctx) => {
    const link = findById(state.links, ctx.params.id)
    if (!link) return notFound(ctx, '友链不存在')
    Object.assign(link, clone(ctx.request.body))
    ctx.body = clone(link)
})

router.delete('/links/:id', (ctx) => {
    state.links = state.links.filter((link) => link.id !== ctx.params.id)
    setNoContent(ctx)
})

router.post('/visitor', (ctx) => {
    const visitor = {
        _id: randomUUID(),
        role: ctx.request.body?.role || 'client',
        ip: ctx.ip || '127.0.0.1',
        address: '本地开发环境',
        browser: ctx.get('user-agent') || '未知设备',
        page: ctx.request.body?.page || 'home',
        viewNum: 1,
        visitTime: new Date().toISOString(),
    }
    state.visitors.unshift(visitor)
    ctx.status = 201
    ctx.body = { message: 'Visitor created successfully', visitor: clone(visitor) }
})

router.get('/visitor', (ctx) => {
    const page = Math.max(1, Number(ctx.query.page) || 1)
    const limit = Math.max(1, Number(ctx.query.limit) || 10)
    const start = (page - 1) * limit
    ctx.body = {
        message: 'Visitor list retrieved successfully',
        visitors: state.visitors.slice(start, start + limit).map(clone),
        total: state.visitors.length,
        page,
        limit,
    }
})

router.delete('/visitor/:id', (ctx) => {
    const visitor = state.visitors.find((item) => item._id === ctx.params.id)
    if (!visitor) return notFound(ctx, '访客记录不存在')
    state.visitors = state.visitors.filter((item) => item._id !== ctx.params.id)
    ctx.body = { message: '访客记录删除成功', deletedVisitor: clone(visitor) }
})

router.post('/user/login', (ctx) => {
    const username = String(ctx.request.body?.username || 'admin')
    const user = state.users.find((item) => item.username === username) || state.users[0]
    const token = jwt.sign({
        username: user.username,
        userid: user.userId,
        email: user.email,
        role: 'admin',
    }, KEY, { expiresIn: '30d' })

    ctx.body = {
        code: 200,
        message: '登录成功',
        data: {
            username: user.username,
            userId: user.userId,
            email: user.email,
            role: 'admin',
            token,
        },
    }
})

router.get('/user/list', (ctx) => {
    ctx.body = state.users.map(clone)
})

router.get('/user/:id', (ctx) => {
    const user = state.users.find((item) => item.userId === ctx.params.id)
    if (!user) return notFound(ctx, '用户不存在')
    ctx.body = clone(user)
})

router.post('/user', (ctx) => {
    const user = { ...clone(ctx.request.body), role: ctx.request.body.role || 'user' }
    state.users.push(user)
    ctx.status = 201
    ctx.body = { message: '用户创建成功', data: clone(user) }
})

router.put('/user/:id', (ctx) => {
    const user = state.users.find((item) => item.userId === ctx.params.id)
    if (!user) return notFound(ctx, '用户不存在')
    Object.assign(user, clone(ctx.request.body))
    ctx.body = { code: 200, message: '用户更新成功', data: clone(user) }
})

router.delete('/user/:id', (ctx) => {
    state.users = state.users.filter((item) => item.userId !== ctx.params.id)
    setNoContent(ctx)
})

router.get('/drafts', (ctx) => {
    ctx.body = [...state.drafts]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map(clone)
})

router.get('/drafts/:id', (ctx) => {
    const draft = findById(state.drafts, ctx.params.id)
    if (!draft) return notFound(ctx, '草稿不存在')
    ctx.body = clone(draft)
})

router.post('/drafts', (ctx) => {
    const now = new Date().toISOString()
    const draft = {
        id: randomUUID(),
        title: '',
        author: '',
        coverImage: '',
        tags: [],
        content: '',
        wordCount: 0,
        version: 1,
        publishing: false,
        createdAt: now,
        updatedAt: now,
        ...clone(ctx.request.body),
    }
    draft.wordCount = countWords(draft.content)
    state.drafts.push(draft)
    ctx.status = 201
    ctx.body = clone(draft)
})

router.put('/drafts/:id', (ctx) => {
    const draft = findById(state.drafts, ctx.params.id)
    if (!draft) return notFound(ctx, '草稿不存在')
    const requestedVersion = Number(ctx.request.body.version)
    if (!ctx.request.body.force && requestedVersion !== draft.version) {
        ctx.status = 409
        ctx.body = { message: '云端草稿已有更新', draft: clone(draft) }
        return
    }
    Object.assign(draft, clone(ctx.request.body), {
        wordCount: countWords(ctx.request.body.content ?? draft.content),
        version: draft.version + 1,
        updatedAt: new Date().toISOString(),
    })
    ctx.body = clone(draft)
})

router.delete('/drafts/:id', (ctx) => {
    const exists = findById(state.drafts, ctx.params.id)
    if (!exists) return notFound(ctx, '草稿不存在')
    state.drafts = state.drafts.filter((draft) => draft.id !== ctx.params.id)
    setNoContent(ctx)
})

router.post('/drafts/:id/publish', (ctx) => {
    const draft = findById(state.drafts, ctx.params.id)
    if (!draft) return notFound(ctx, '草稿不存在')
    if (Number(ctx.request.body.version) !== draft.version) {
        ctx.status = 409
        ctx.body = { message: '云端草稿已有更新', draft: clone(draft) }
        return
    }

    const missingFields = ['title', 'author', 'coverImage', 'content']
        .filter((field) => !String(draft[field] || '').trim())
    if (!draft.tags?.length) missingFields.push('tags')
    if (missingFields.length) {
        ctx.status = 422
        ctx.body = { message: '草稿字段不完整', missingFields }
        return
    }

    const now = new Date().toISOString()
    const content = createContent({ ...draft, createTime: now, updateTime: now })
    state.contents.push(content)
    state.blogs.push(createBlog(content))
    state.drafts = state.drafts.filter((item) => item.id !== draft.id)
    state.website.article.total += 1
    state.website.article.dailyData.push({ date: now, count: 1 })
    state.website.totalWordCount += content.wordCount
    state.website.updateTime = now
    ctx.status = 201
    ctx.body = { message: '文章发布成功', id: draft.id }
})

export default router
