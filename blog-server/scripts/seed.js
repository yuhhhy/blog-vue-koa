import mongoose from 'mongoose'
import { Blog } from '../models/BlogSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'
import { Links } from '../models/LinksSchema.js'
import { WebsiteData } from '../models/WebsiteDataSchema.js'
import { User } from '../models/UserSchema.js'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog'
const AUTHOR = 'Yuhhhy'
const COVER = 'https://picsum.photos/seed/blog-default/1200/600'

const samplePosts = [
    {
        id: 'post-001',
        title: 'Vue 3 + Koa 全栈博客踩坑记录',
        tags: ['Vue', 'Koa', '全栈'],
        coverImage: 'https://picsum.photos/seed/vue-koa/1200/600',
        content: `# Vue 3 + Koa 全栈博客踩坑记录

本文记录了搭建 Vue 3 + Koa 博客的几个关键节点。

## 1. 路由设计

前端使用 Vue Router 4，后端用 \`@koa/router\` 提供 RESTful 风格的接口。

\`\`\`js
router.get('/api/blog/list', getBlogList)
router.get('/api/blog/:id', getBlogById)
\`\`\`

## 2. 状态管理

使用 Pinia 管理主题、用户登录态。

## 3. 编辑器选型

Markdown 编辑器选用 v-md-editor，配合 markdown-it 渲染。

> 体验下来比 mavon-editor 更轻量，扩展能力也够用。
`,
    },
    {
        id: 'post-002',
        title: '聊聊前端工程化里的 Vite',
        tags: ['Vite', '前端工程化'],
        coverImage: 'https://picsum.photos/seed/vite/1200/600',
        content: `# 聊聊前端工程化里的 Vite

Vite 借助原生 ES Module 实现了 dev server 的秒启，本文从原理和实战两个角度展开。

## 原生 ESM

浏览器解析 \`<script type="module">\` 时按需请求依赖，跳过了打包阶段。

## 生产构建

production 走 Rollup，做 tree-shaking 与 code splitting。

\`\`\`bash
vite build
\`\`\`

## 插件机制

Vite 插件兼容 Rollup 插件，并扩展了 \`configureServer\`、\`transformIndexHtml\` 等钩子。
`,
    },
    {
        id: 'post-003',
        title: 'MongoDB 索引：从原理到实践',
        tags: ['MongoDB', '数据库'],
        coverImage: 'https://picsum.photos/seed/mongo/1200/600',
        content: `# MongoDB 索引：从原理到实践

索引是数据库性能的命脉，本文从 B 树结构开始，讲到复合索引、覆盖查询。

## B 树 vs B+ 树

MongoDB 使用 B 树而非 B+ 树，叶子节点也存数据。

## 复合索引顺序

遵循 ESR 原则：Equality → Sort → Range。

## 覆盖查询

当查询字段全部命中索引时，可直接从索引返回结果，避免回表。
`,
    },
    {
        id: 'post-004',
        title: 'CSS Grid 布局速查',
        tags: ['CSS', '前端'],
        coverImage: 'https://picsum.photos/seed/css-grid/1200/600',
        content: `# CSS Grid 布局速查

二维布局神器，常用属性速查。

## 容器属性

- \`grid-template-columns\`
- \`grid-template-rows\`
- \`gap\`

## 项目属性

- \`grid-column\`
- \`grid-row\`
- \`justify-self\` / \`align-self\`

## 实战场景

后台仪表盘、瀑布流、卡片列表都是 Grid 的舒适区。
`,
    },
    {
        id: 'post-005',
        title: '换电脑后的开发环境恢复清单',
        tags: ['工作流', '杂谈'],
        coverImage: 'https://picsum.photos/seed/setup/1200/600',
        content: `# 换电脑后的开发环境恢复清单

换电脑是一次断舍离，记录一下我的最小配置。

## 命令行

- iTerm2 + zsh + oh-my-zsh
- starship 提示符

## 开发

- VS Code 插件同步
- Node.js 用 fnm 管理
- MongoDB / Redis 用 brew 装

## 数据迁移

旧机器的本地 Mongo 数据没备份，只能重新写 seed 脚本灌一遍。
`,
    },
]

const sampleLinks = [
    {
        id: 'link-001',
        name: 'Vue 官方文档',
        description: '渐进式 JavaScript 框架',
        site: 'https://vuejs.org',
        avatar: 'https://vuejs.org/images/logo.png',
    },
    {
        id: 'link-002',
        name: 'MDN Web Docs',
        description: 'Web 技术权威参考',
        site: 'https://developer.mozilla.org',
        avatar: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
    },
    {
        id: 'link-003',
        name: '阮一峰的网络日志',
        description: '前端老牌博客',
        site: 'https://www.ruanyifeng.com/blog/',
        avatar: 'https://picsum.photos/seed/ruanyifeng/200',
    },
]

const countWords = (str) => str.replace(/\s+/g, '').length

const buildBlog = (post, daysAgo) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
        id: post.id,
        title: post.title,
        coverImage: post.coverImage || COVER,
        createTime: date,
        updateTime: date,
        tags: post.tags,
        link: `/blog/${post.id}`,
    }
}

const buildBlogContent = (post, daysAgo) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
        id: post.id,
        title: post.title,
        author: AUTHOR,
        coverImage: post.coverImage || COVER,
        createTime: date,
        updateTime: date,
        tags: post.tags,
        content: post.content,
        wordCount: countWords(post.content),
        viewCount: Math.floor(Math.random() * 200) + 30,
        likeCount: Math.floor(Math.random() * 30),
    }
}

const seed = async () => {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected:', MONGO_URI)

    await Promise.all([
        Blog.deleteMany({}),
        BlogContent.deleteMany({}),
        Links.deleteMany({}),
        WebsiteData.deleteMany({}),
    ])
    console.log('Cleared Blog / BlogContent / Links / WebsiteData')

    const blogDocs = samplePosts.map((p, i) => buildBlog(p, i * 3))
    const contentDocs = samplePosts.map((p, i) => buildBlogContent(p, i * 3))

    await Blog.insertMany(blogDocs)
    await BlogContent.insertMany(contentDocs)
    await Links.insertMany(sampleLinks)

    const totalWordCount = contentDocs.reduce((sum, c) => sum + c.wordCount, 0)
    await WebsiteData.create({
        visit: { total: 1234, dailyData: [] },
        view: { total: 5678, dailyData: [] },
        comment: { total: 0, dailyData: [] },
        article: { total: samplePosts.length, dailyData: [] },
        totalWordCount,
        updateTime: new Date(),
    })

    const adminExists = await User.findOne({ role: 'admin' })
    if (!adminExists) {
        await User.create({
            userId: 'admin-001',
            username: 'admin',
            password: 'admin123',
            email: 'admin@example.com',
            role: 'admin',
        })
        console.log('Created admin user (admin / admin123)')
    }

    console.log(`Inserted ${blogDocs.length} blogs, ${sampleLinks.length} links`)
    await mongoose.disconnect()
    console.log('Done')
}

seed().catch(async (err) => {
    console.error('Seed failed:', err)
    await mongoose.disconnect()
    process.exit(1)
})
