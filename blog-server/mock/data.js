const mockCovers = {
    'vue-koa': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=720&q=82',
    'sage-green': 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&h=720&q=82',
    vite: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&h=720&q=82',
    mongodb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=720&q=82',
    writing: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&h=720&q=82',
}

const cover = (name) => mockCovers[name]

const archiveMockTopics = [
    ['dev-vue-transition', 'Vue 页面切换动画的状态管理', '2026-08-24T08:20:00.000Z', ['Vue', '动画']],
    ['dev-css-clip-path', '用 clip-path 设计有方向感的页面过渡', '2026-07-12T04:40:00.000Z', ['CSS', '动效']],
    ['dev-koa-middleware', 'Koa 中间件的执行顺序与错误处理', '2026-06-03T10:15:00.000Z', ['Koa', '后端']],
    ['dev-image-pipeline', '博客图片压缩与响应式格式实践', '2026-05-18T02:30:00.000Z', ['图片', '性能优化']],
    ['dev-vue-composable', '把页面逻辑整理成可复用的 Composable', '2026-04-07T12:05:00.000Z', ['Vue', '工程化']],
    ['dev-accessibility', '给个人博客补上可访问性细节', '2026-03-21T06:50:00.000Z', ['无障碍', '前端']],
    ['dev-api-design', '从博客接口重构 REST API 的边界', '2026-02-11T09:10:00.000Z', ['API', '架构']],
    ['dev-design-tokens', '用设计变量统一博客的视觉语言', '2026-01-05T03:25:00.000Z', ['CSS', '设计系统']],
    ['dev-year-review-2025', '2025 年度开发与写作复盘', '2025-12-28T13:00:00.000Z', ['复盘', '写作']],
    ['dev-web-fonts', '中文博客字体加载策略', '2025-10-16T07:35:00.000Z', ['字体', '性能优化']],
    ['dev-mongodb-migration', '一次 MongoDB 数据迁移记录', '2025-08-09T01:45:00.000Z', ['MongoDB', '数据']],
    ['dev-vite-chunks', '拆解 Vite 构建产物与分包策略', '2025-06-22T11:20:00.000Z', ['Vite', '工程化']],
    ['dev-comment-system', '从零实现一套树形评论系统', '2025-04-14T05:55:00.000Z', ['评论', '全栈']],
    ['dev-theme-switch', '深浅色主题切换的实现细节', '2025-02-02T09:40:00.000Z', ['主题', 'CSS']],
    ['dev-year-review-2024', '2024 年度个人项目复盘', '2024-12-26T08:00:00.000Z', ['复盘', '个人项目']],
    ['dev-deploy-nginx', '使用 Nginx 部署 Vue 与 Koa 应用', '2024-10-19T03:15:00.000Z', ['部署', 'Nginx']],
    ['dev-error-boundary', '前端异常监控与错误边界', '2024-08-08T12:30:00.000Z', ['监控', '前端']],
    ['dev-auth-jwt', 'JWT 登录鉴权的完整链路', '2024-06-17T06:10:00.000Z', ['JWT', '安全']],
    ['dev-markdown-render', 'Markdown 渲染、安全过滤与代码高亮', '2024-04-06T10:45:00.000Z', ['Markdown', '安全']],
    ['dev-first-post', '为什么决定重新做一个个人博客', '2024-02-10T02:20:00.000Z', ['博客', '随笔']],
]

const archiveCoverNames = ['vue-koa', 'sage-green', 'vite', 'mongodb', 'writing']

const createArchiveMockPost = ([id, title, createTime, tags], index) => ({
    id,
    title,
    author: 'Yuhhhy',
    coverImage: cover(archiveCoverNames[index % archiveCoverNames.length]),
    createTime,
    updateTime: createTime,
    tags,
    viewCount: 96 + index * 17,
    likeCount: 8 + (index * 3) % 29,
    content: `# ${title}

这是一篇用于展示博客归档长列表表现的示例文章。内容保留了真实文章的标题、摘要和正文层级，因此可以正常进入文章详情页检查阅读体验。

## 背景

项目在持续迭代时，文章数量会逐渐增加。归档页需要在不同年份、不同标题长度和较长滚动距离下保持清晰的阅读节奏。

## 实践记录

- 保持列表日期对齐
- 让长标题能够自然换行
- 使用年份划分内容层级
- 确保文章详情与返回操作正常工作

## 小结

先用接近真实规模的数据观察页面，再决定间距、字号和动画细节，会比只看少量示例更可靠。
`,
})

export const mockPosts = [
    {
        id: 'dev-markdown-comments-test',
        title: 'Markdown 与多级评论测试',
        author: 'Yuhhhy',
        coverImage: cover('vue-koa'),
        createTime: '2026-10-28T11:00:00.000Z',
        updateTime: '2026-10-28T11:00:00.000Z',
        tags: ['Markdown', '评论测试', 'UI'],
        viewCount: 0,
        likeCount: 0,
        content: `# 一级标题：Markdown 展示测试

这篇文章用于检查博客正文的 **Markdown 排版**、中文与 English 混排，以及评论区不同层级的显示。这里有 *斜体*、**粗体**、~~删除线~~、\`行内代码\` 和一个[普通链接](https://example.com)。

## 二级标题：段落与列表

普通段落用于观察行距、字重和长文本换行。Lorem ipsum dolor sit amet, consectetur adipiscing elit. 这是一段中英文混排内容，适合检查字体回退和标点间距。

无序列表：

- 第一项
- 第二项，包含 **强调文字**
  - 嵌套项目 A
  - 嵌套项目 B
- 第三项

有序列表：

1. 准备内容
2. 检查显示
3. 提交评论

### 三级标题：引用

> 这是一个引用块，用于检查边线、缩进和文字颜色。
>
> 引用也可以包含 **强调** 和 \`inline code\`。

#### 四级标题：代码块

\`\`\`js
const comment = {
  level: 4,
  text: '中文与 English',
  visible: true,
}

console.log('Markdown rendering test', comment)
\`\`\`

\`\`\`json
{
  "article": "dev-markdown-comments-test",
  "markdown": true,
  "commentLevels": [1, 2, 3, 4]
}
\`\`\`

##### 五级标题：表格与分隔线

| Markdown | 测试内容 | 状态 |
| --- | --- | --- |
| 标题 | H1 到 H6 | 正常 |
| 列表 | 有序、无序、嵌套 | 正常 |
| 代码 | 行内与代码块 | 正常 |

---

###### 六级标题：图片

![代码编辑器桌面](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=720&q=82)

图片之后的文字，用来确认图片与后续段落之间的间距正常。
`,
    },
    {
        id: 'dev-vue-koa',
        title: 'Vue 3 + Koa：从零搭建个人博客',
        author: 'Yuhhhy',
        coverImage: cover('vue-koa'),
        createTime: '2026-10-20T08:30:00.000Z',
        updateTime: '2026-10-22T12:20:00.000Z',
        tags: ['Vue', 'Koa', '全栈'],
        viewCount: 328,
        likeCount: 26,
        content: `# Vue 3 + Koa：从零搭建个人博客

这个博客由 Vue 3、Vite、Koa 和 MongoDB 组成。前台负责阅读体验，后台负责内容管理，服务端提供一组简单清晰的 REST API。

## 为什么选择这套技术栈

Vue 的组合式 API 很适合拆分页面逻辑，Koa 的中间件模型又足够轻量。两者放在一起，既方便学习全栈，也能保持项目结构直观。

\`\`\`js
const app = createApp(App)
app.use(router)
app.mount('#app')
\`\`\`

## 开发环境

开发时最重要的是反馈速度。前端由 Vite 提供热更新，服务端使用 nodemon；没有本地数据库时，则自动启用内存 mock 数据。

> 先让页面跑起来，再逐步打磨真实的数据链路。

## 接下来

- 完善文章搜索
- 优化移动端阅读体验
- 为图片生成响应式尺寸
- 继续调整博客的视觉主题
`,
    },
    {
        id: 'dev-sage-green',
        title: '给博客换一套淡绿色主题',
        author: 'Yuhhhy',
        coverImage: cover('sage-green'),
        createTime: '2026-10-15T03:10:00.000Z',
        updateTime: '2026-10-18T09:40:00.000Z',
        tags: ['CSS', '设计', '主题'],
        viewCount: 214,
        likeCount: 18,
        content: `# 给博客换一套淡绿色主题

绿色很容易显得过于鲜艳，所以这次选择了低饱和的鼠尾草绿。大面积背景保持轻盈，文字和按钮则使用更深的绿色保证可读性。

## 颜色分工

- 页面背景：接近白色的浅绿
- 柔和区块：用于标签、悬停和选中文本
- 主色：用于链接、按钮和当前导航
- 深色模式：适当提高绿色亮度

## 用变量管理主题

\`\`\`scss
:root.light {
  --primary-color: #557a5c;
  --primary-soft: #e4efe1;
  --white: #f8fbf6;
}
\`\`\`

统一变量以后，导航、评论、标签和 Element Plus 控件都可以共享同一套视觉语言。
`,
    },
    {
        id: 'dev-vite-performance',
        title: 'Vite 项目的加载性能优化清单',
        author: 'Yuhhhy',
        coverImage: cover('vite'),
        createTime: '2026-10-09T11:00:00.000Z',
        updateTime: '2026-10-09T11:00:00.000Z',
        tags: ['Vite', '性能优化', '工程化'],
        viewCount: 486,
        likeCount: 41,
        content: `# Vite 项目的加载性能优化清单

性能优化不应该从压缩一个小图标开始，而要先找到真正影响用户体验的资源。

## 构建分析

先生成产物，再观察体积最大的包。字体、编辑器和组件库往往比业务代码更值得关注。

## 常用手段

1. 路由组件按需加载
2. 首屏图片设置明确尺寸
3. 非关键字体在空闲阶段加载
4. 为静态资源生成 gzip 或 brotli 文件
5. 避免重复打包大型依赖

## 衡量结果

不要只看构建体积，也要结合 LCP、CLS 和真实网络环境判断优化是否有效。
`,
    },
    {
        id: 'dev-mongodb-index',
        title: 'MongoDB 索引：从查询习惯开始设计',
        author: 'Yuhhhy',
        coverImage: cover('mongodb'),
        createTime: '2026-09-28T06:45:00.000Z',
        updateTime: '2026-10-02T02:15:00.000Z',
        tags: ['MongoDB', '数据库', '后端'],
        viewCount: 367,
        likeCount: 29,
        content: `# MongoDB 索引：从查询习惯开始设计

索引不是越多越好。每一个索引都会增加写入成本，真正重要的是让索引贴合查询条件与排序方式。

## ESR 原则

复合索引通常按照 Equality、Sort、Range 的顺序排列字段。例如先按文章状态过滤，再按发布时间排序。

## 用 explain 验证

关注扫描文档数量、返回数量和查询阶段。只有数据量足够接近真实环境，测试结果才有参考价值。

## 开发环境的例外

做页面样式时并不需要先准备 MongoDB。使用内存 mock 数据可以把前端工作和数据库状态解耦。
`,
    },
    {
        id: 'dev-writing-notes',
        title: '写作与开发：把零散经验整理成文章',
        author: 'Yuhhhy',
        coverImage: cover('writing'),
        createTime: '2026-09-16T13:25:00.000Z',
        updateTime: '2026-09-16T13:25:00.000Z',
        tags: ['写作', '工作流', '随笔'],
        viewCount: 152,
        likeCount: 15,
        content: `# 写作与开发：把零散经验整理成文章

一篇技术文章不需要覆盖所有知识。只要能把一次问题的背景、判断过程和最终结论说清楚，就已经足够有价值。

## 我的记录方式

平时先记下错误信息和关键命令，问题解决后再补充原因。等零散记录形成一条完整链路，就可以整理成文章。

## 保留个人感受

技术内容也可以有温度。哪些地方最困惑、为什么改变方案、最后有什么遗憾，这些都是读者无法从文档里直接获得的部分。
`,
    },
    ...archiveMockTopics.map(createArchiveMockPost),
]

export const mockEssays = [
    {
        id: 'essay-dev-001',
        title: '十月末的一个普通晚上',
        content: '下班以后沿着熟悉的路慢慢走了一圈。风已经有一点凉，路边的树叶被灯照得很亮。\n\n没有发生特别的事，但还是想把这个晚上记下来。',
        createTime: '2026-10-28T12:36:00.000Z',
        updateTime: '2026-10-28T12:36:00.000Z',
    },
    {
        id: 'essay-dev-002',
        title: '2026年10月27日随笔',
        content: '重新整理了一遍博客的页面。很多细节单独看都很小，放在一起却会影响整个页面的呼吸感。先把能看见的问题一点点改掉。',
        createTime: '2026-10-27T06:08:00.000Z',
        updateTime: '2026-10-27T06:08:00.000Z',
    },
    {
        id: 'essay-dev-003',
        title: '雨停之后',
        content: '雨停以后窗外安静了很多。循环播放着一首很久以前收藏的歌，突然又想起第一次听到它的时候。\n\n有些记忆似乎一直没有消失，只是平时很少被碰到。',
        createTime: '2026-10-24T15:42:00.000Z',
        updateTime: '2026-10-24T15:42:00.000Z',
    },
    {
        id: 'essay-dev-004',
        title: '关于慢一点',
        content: '最近总想一次把所有事情做完，结果反而什么都做不好。也许应该允许自己慢一点，把眼前这一件事认真做完，再去想下一件。',
        createTime: '2026-10-19T03:15:00.000Z',
        updateTime: '2026-10-19T03:15:00.000Z',
    },
    {
        id: 'essay-dev-005',
        title: '2026年10月12日随笔',
        content: '今天把搁置了很久的一个小功能补完了。实现本身没有想象中复杂，真正困难的似乎总是重新开始。',
        createTime: '2026-10-12T09:27:00.000Z',
        updateTime: '2026-10-12T09:27:00.000Z',
    },
]

export const mockComments = [
    {
        id: 'md-test-comment-1',
        blogId: 'dev-markdown-comments-test',
        parentId: '-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=MarkdownReader',
        username: 'Markdown 读者',
        email: 'markdown-reader@example.com',
        website: 'https://example.com',
        browser: 'Chrome 138.0.0.0',
        os: 'Android 10',
        content: '一级评论：昵称带网址链接。代码块背景和标题层级看起来是否正常？',
        timezone: 'Asia/Shanghai',
        solarLocation: {
            latitude: 22.5431,
            longitude: 114.0579,
            region: '广东省 深圳市',
        },
        createTime: '2026-10-27T17:30:00.000Z',
        showForm: false,
        hasParent: false,
        replies: ['md-test-comment-2'],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'md-test-comment-2',
        blogId: 'dev-markdown-comments-test',
        parentId: 'md-test-comment-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=ReplyOne',
        username: '一级回复',
        email: 'reply-one@example.com',
        browser: 'Safari 18.0',
        os: 'iOS 18.0',
        content: '二级评论：没有网址，昵称应与正文同色、同字重。',
        timezone: 'Asia/Shanghai',
        createTime: '2026-10-27T22:30:00.000Z',
        showForm: false,
        hasParent: true,
        replies: ['md-test-comment-3'],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'md-test-comment-3',
        blogId: 'dev-markdown-comments-test',
        parentId: 'md-test-comment-2',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=ReplyTwo',
        username: '二级回复',
        email: 'reply-two@example.com',
        website: 'https://example.org',
        browser: 'Firefox 132.0',
        os: 'Windows 11',
        content: '三级评论：继续测试递归缩进、连接线和右侧回复按钮。',
        timezone: 'Asia/Shanghai',
        createTime: '2026-10-28T04:30:00.000Z',
        showForm: false,
        hasParent: true,
        replies: ['md-test-comment-4'],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'md-test-comment-4',
        blogId: 'dev-markdown-comments-test',
        parentId: 'md-test-comment-3',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=ReplyThree',
        username: '三级回复',
        email: 'reply-three@example.com',
        browser: 'Edge 130.0',
        os: 'macOS 15.0',
        content: '四级评论：最深这一层仍然可以继续回复。',
        timezone: 'Asia/Shanghai',
        createTime: '2026-10-28T10:30:00.000Z',
        showForm: false,
        hasParent: true,
        replies: [],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'md-test-comment-5',
        blogId: 'dev-markdown-comments-test',
        parentId: '-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Standalone',
        username: '独立评论',
        email: 'standalone@example.com',
        content: '另一条没有回复的一级评论，用于观察评论之间的间距。',
        timezone: 'Asia/Shanghai',
        createTime: '2026-10-28T14:30:00.000Z',
        showForm: false,
        hasParent: false,
        replies: [],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'comment-001',
        blogId: 'dev-vue-koa',
        parentId: '-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=LinJianFeng',
        username: '林间风',
        email: 'reader@example.com',
        website: 'https://example.com',
        content: '这个开发环境的拆分方式很清楚，期待后续的部署文章。[表情:点赞]',
        createTime: '2026-10-21T04:30:00.000Z',
        showForm: false,
        hasParent: false,
        replies: ['comment-002'],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'comment-002',
        blogId: 'dev-vue-koa',
        parentId: 'comment-001',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Yuhhhy',
        username: 'Yuhhhy',
        email: 'author@example.com',
        content: '谢谢！部署和图片处理已经放进选题列表了。',
        createTime: '2026-10-21T06:05:00.000Z',
        showForm: false,
        hasParent: true,
        replies: [],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'comment-003',
        blogId: 'dev-sage-green',
        parentId: '-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=QingTai',
        username: '青苔',
        email: 'moss@example.com',
        content: '鼠尾草绿很耐看，浅色背景也不会影响长文阅读。',
        createTime: '2026-10-18T10:10:00.000Z',
        showForm: false,
        hasParent: false,
        replies: [],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'comment-004',
        blogId: '-1',
        parentId: '-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Reader',
        username: '路过的读者',
        email: 'hello@example.com',
        content: '很喜欢这个博客的文字和留白，祝持续更新。',
        createTime: '2026-10-12T02:00:00.000Z',
        showForm: false,
        hasParent: false,
        replies: [],
        reviewed: true,
        reviewPassed: true,
    },
    {
        id: 'comment-005',
        blogId: 'dev-writing-notes',
        parentId: '-1',
        avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Pending',
        username: '待审核示例',
        email: 'pending@example.com',
        content: '这是一条用于测试后台审核流程的 mock 评论。',
        createTime: '2026-10-25T09:15:00.000Z',
        showForm: false,
        hasParent: false,
        replies: [],
        reviewed: false,
    },
]

export const mockLinks = [
    {
        id: '20250701222025',
        name: '石樱灯笼',
        description: '灵魂沉为石樱，灯笼映出暗影 一介社畜，妄自菲薄。',
        site: 'https://www.catscarlet.com/',
        avatar: 'https://www.catscarlet.com/avatar/qmcd-0008x350.jpg',
        category: 'recommended',
    },
    {
        id: '20261028200821',
        name: '枸杞加水',
        description: '分享知识与生活',
        site: 'https://blog.fiveth.cc/',
        avatar: 'https://blog.gochi.cn/logo/icon.ico',
        category: 'recommended',
    },
    {
        id: '20261028210000',
        name: "I don't wanna go",
        description: "WELCOME TO idontwannago's site",
        site: 'https://www.idontwannago.top/',
        avatar: 'https://www.idontwannago.top/img/fluid.png',
        category: 'recommended',
    },
    {
        id: '20261028211556',
        name: '25020jason1728',
        description: '抖音个人主页',
        site: 'https://v.douyin.com/h-Lzt62UbIQ/',
        avatar: 'https://www.douyin.com/favicon.ico',
        category: 'recommended',
    },
    {
        id: '1001',
        name: 'Vue.js',
        description: '渐进式 JavaScript 框架',
        site: 'https://vuejs.org/',
        avatar: 'https://vuejs.org/logo.svg',
    },
    {
        id: '1002',
        name: 'MDN Web Docs',
        description: '面向 Web 开发者的权威参考资料',
        site: 'https://developer.mozilla.org/',
        avatar: 'https://developer.mozilla.org/favicon-192x192.png',
    },
    {
        id: '1003',
        name: 'Vite',
        description: '下一代前端构建工具',
        site: 'https://vite.dev/',
        avatar: 'https://vite.dev/logo.svg',
    },
]

export const mockUsers = [
    {
        userId: 'dev-admin',
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
    },
    {
        userId: 'dev-editor',
        username: 'editor',
        password: 'editor123',
        email: 'editor@example.com',
        role: 'user',
    },
]

export const mockVisitors = [
    {
        _id: 'visitor-001',
        role: 'client',
        ip: '127.0.0.1',
        address: '本地开发环境',
        browser: 'Chrome / macOS',
        page: 'home',
        viewNum: 4,
        visitTime: '2026-10-26T02:20:00.000Z',
    },
    {
        _id: 'visitor-002',
        role: 'client',
        ip: '192.168.1.8',
        address: '局域网访客',
        browser: 'Safari / iOS',
        page: 'blog',
        viewNum: 2,
        visitTime: '2026-10-25T12:05:00.000Z',
    },
]

export const createMockWebsiteData = () => {
    const dailyData = (values) => values.map((count, index) => {
        const date = new Date('2026-10-20T00:00:00.000Z')
        date.setUTCDate(date.getUTCDate() + index)
        return { date: date.toISOString(), count }
    })

    return {
        view: { total: 1547, dailyData: dailyData([42, 51, 47, 63, 58, 71, 76]) },
        visit: { total: 628, dailyData: dailyData([16, 21, 18, 25, 22, 29, 31]) },
        comment: { total: mockComments.length, dailyData: dailyData([0, 2, 0, 1, 0, 1, 1]) },
        article: {
            total: mockPosts.length,
            dailyData: mockPosts.map((post) => ({ date: post.createTime, count: 1 })),
        },
        updateTime: mockPosts[0].updateTime,
        totalWordCount: mockPosts.reduce((total, post) => total + Array.from(post.content).length, 0),
    }
}
