<!-- 前后端不分离代码已经注释掉 -->
<!-- <script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { apiFetchBlogData } from '@/api/index.js'
import MarkdownIt from 'markdown-it'
import Sidebar from '@/components/Sidebar/index.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleContent from './components/ArticleContent.vue'
import ArticleFooter from './components/ArticleFooter.vue'

const route = useRoute()
const blogData = ref(0) // ref() 参数最好是是 0 或 {}，而不是 null或 undefined
const html = ref(0)

// 组件挂载完成后，再渲染数据，实现更快的页面加载
onMounted(async () => {
    await fetchBlogData(route.params.id)
    handleBlogData()
    renderBlogContent()
})

// 获取博客数据
const fetchBlogData = async (blogId) => {
    await apiFetchBlogData(blogId).then((data) => { blogData.value = data})
    console.log(blogData)
}

// 处理博客数据
const handleBlogData = () => {
    blogData.value.date = blogData.value.date.substring(0, 10)
    console.log('handleBlogData')
}

// 渲染博客内容
const renderBlogContent = () => {
    const md = new MarkdownIt() // 使用 Markdown-it 解析器将 Markdown 转换为 HTML
    html.value = md.render(blogData.value.content)
    console.log('renderBlogContent')
}

// 监听变化，重新渲染 HTML
// watch(blogData.value, (newBlogData) => {
//     html.value = md.render(newBlogData.content)
// }, { immediate: true })

// 路由 id 变化时，组件不会重载
// watch(() => route.params.id,
//     (newId) => {
//         // 获取新的博客数据

//     }
// )
</script> -->
<!-- 静态页面代码 -->
<script setup>
import MarkdownIt from 'markdown-it'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import hljs from 'highlight.js'
import 'highlight.js/scss/tokyo-night-dark.scss'
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

import Sidebar from '@/components/Sidebar/index.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleContent from './components/ArticleContent.vue'
import ArticleFooter from './components/ArticleFooter.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
let content = ref('') // markdown格式文章内容
let htmlContent = ref('') // html格式文章内容
let blogData = ref({}) // data/posts.json
let tocHtml = ref('') // toc生成的html

// 获取当前路由博客的相关数据blogData
const searchBlogList = async (blogId) => {
    const response = await fetch('/data/posts.json')
    const blogList = await response.json()
    const blog = blogList.find(item => item.id === blogId)

    if (!blog) {
        router.push('/404')
        return
    }
    return blog
}

// 获取文章内容htmlContent
const fetchBlogContent = async () => {
    const response = await fetch(`/processed_posts/${blogData.value.title}.md`)
    content.value = await response.text()

    // 生成文章HTML、Toc、highlight.js代码高亮
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) { }
            }

            return ''; // 使用额外的默认转义
        }
    }).use(markdownItTocAndAnchor, {
        tocCallback: function (tocMarkdown, tocArray, tocHtmlResult) {
            tocHtml.value = tocHtmlResult
        }
    })

    htmlContent.value = md.render(content.value)
}


onMounted(async () => {
    const blogId = parseInt(route.params.id)
    blogData.value = await searchBlogList(blogId)
    await fetchBlogContent()
})
</script>

<template>
    <div class="blog-container">
        <!-- 博客头部banner区域 -->
        <div class="blog-header">
            <div class="banner" :style="{ backgroundImage: `url(${blogData.coverImage})` }"></div>
            <!-- 遮罩层 -->
            <div class="mask"></div>
            <!-- 相关信息 -->
            <div class="blog-title">{{ blogData.title }}</div>
            <div class="blog-info">
                <div class="blog-date">{{ blogData.date }}</div>
                <div class="blog-author">作者 {{ blogData.author }}</div>
                <div class="blog-word-count">字数 {{ blogData.wordCount }}</div>
            </div>
        </div>

        <!-- 除了头部banner的主体和侧边栏区域 -->
        <div class="blog-main">
            <!-- 博客页面文章主体 -->
            <div class="blog-aritcle">
                <!-- 文章上部分交互区域 -->
                <ArticleHeader></ArticleHeader>
                <!-- 文章主体内容区域 -->
                <ArticleContent :htmlContent="htmlContent"></ArticleContent>
                <!-- 文章底部相关信息和评论区域 -->
                <ArticleFooter></ArticleFooter>
            </div>

            <!-- 博客页面右侧边栏 -->
            <div class="blog-sidebar">
                <Sidebar :tags="blogData.tags" :tocHtml="tocHtml"></Sidebar>
            </div>
        </div>
    </div>
</template>

<style module>
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px 0;
}
</style>

<style lang="scss" scoped>
.blog-container {
    background-color: var(--light);
    margin-top: 64px;
    min-height: calc(100vh - 75px);
    width: 100%;

    .blog-header {
        position: relative;
        color: #fff;

        .banner {
            width: 100%;
            height: 500px;
            background-attachment: fixed;
            background-size: cover;
        }

        .mask {
            width: 100%;
            height: 500px;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.8));
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .blog-title {
            font-size: 3.125rem;
            font-weight: bold;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 120px;
            text-align: center;
            width: 80%;
        }

        .blog-info {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            width: 100%;
            position: absolute;
            bottom: 20px;

            >div {
                height: 30px;
                line-height: 30px;
            }
        }
    }

    .blog-main {
        padding: 40px calc(7vw + 10px);
        display: flex;
        height: 100%;

        .blog-aritcle {
            flex: 1;
            background-color: var(--white);
            border-radius: 15px;
        }

        .blog-sidebar {
            width: 300px;
            min-width: 260px;
            height: auto; // 高度自适应
            min-height: 100%; // 撑开.blog-sidebar
            display: flex;
            flex-direction: column;
        }
    }
}

@media screen and (max-width: 768px) {
    .blog-container {
        background-color: var(--white);

        .blog-header {
            .banner {
                height: 200px;
                background-attachment: scroll; // 移动端取消fixed效果
            }

            .mask {
                height: 200px;
            }

            .blog-title {
                font-size: 1.875rem;
                bottom: 80px;
            }

            .blog-info {
                bottom: 10px;

                >div {
                    height: 20px;
                    line-height: 20px;
                }

            }
        }

        .blog-main {
            padding: 0;
            flex-direction: column;

            .blog-aritcle {
                border-radius: 0;
                margin-right: 0;
                margin-bottom: 20px;
            }

            .blog-sidebar {
                display: none;
            }
        }
    }
}
</style>