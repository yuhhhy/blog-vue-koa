<script setup>
import Sidebar from '@/components/Sidebar/index.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleContent from './components/ArticleContent.vue'
import ArticleRecommended from './components/ArticleRecommended.vue'
import ArticleFooter from './components/ArticleFooter.vue'

import MarkdownIt from 'markdown-it'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import { ref, onMounted, watch, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute, useRouter } from 'vue-router'
import { apiGetBlogContent, apiUpdateBlogViewCount } from '@/api/blogContent.js'
import { apiUpdateWebsiteView } from '@/api/websiteData.js'
import { getFormatDate } from '@/utils/date.js'
import config from '@/config/index.js'

const route = useRoute()
const router = useRouter()
let htmlContent = ref('') // html格式文章内容
let blogData = ref({}) // data/posts.json
let tocHtml = ref('') // toc生成的html

// 渲染文章内容 Markdown -> HTML
const renderBlogContent = () => {
    // 生成文章HTML、Toc
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
    })

    // 添加图片懒加载
    const defaultRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
    }
    
    md.renderer.rules.image = function(tokens, idx, options, env, self) {
        const token = tokens[idx]
        token.attrPush(['loading', 'lazy'])
        return defaultRender(tokens, idx, options, env, self)
    }

    md.use(markdownItTocAndAnchor, {
        tocCallback: function (tocMarkdown, tocArray, tocHtmlResult) {
            tocHtml.value = tocHtmlResult
        }
    })

    htmlContent.value = md.render(blogData.value.content)
}

// 获取文章内容
async function getBlogContent() {
    try {
        const data = await apiGetBlogContent(route.params.id)
        blogData.value = data
        renderBlogContent()
    }
    catch (error) {
        console.error('获取博客内容失败', error)
        router.push('/404')
    }
}

async function updateBlogViewCount() {
    const data = await apiUpdateBlogViewCount(route.params.id)
    blogData.value.viewCount = data.viewCount
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      // 重置数据
      htmlContent.value = ''
      blogData.value = {}
      tocHtml.value = ''
      
      // 重新获取数据
      await getBlogContent()
      await updateBlogViewCount()
      await apiUpdateWebsiteView()
    }
  },
  { immediate: true } // 立即执行一次
)

onMounted(() => {
    getBlogContent()
    updateBlogViewCount()
    apiUpdateWebsiteView()
})


// 设置页面头部信息
const pageTitle = computed(() => blogData.value?.title ? `${blogData.value.title} | 一曝十寒` : '博客文章 | 一曝十寒')
const pageDescription = computed(() => {
    if (!blogData.value?.content) return '一曝十寒 - 博客文章'
    return blogData.value.content.replace(/#|\n|`|>|_|\*|\[|\]|\(|\)|!/g, '').slice(0, 150)
})
const pageKeywords = computed(() => {
    if (!blogData.value?.title) return 'yuhhhy, 一曝十寒, 前端, 生活成长, Web, Vue, JavaScript, HTML, CSS'
    
    // 组合标题、标签
    return [
        blogData.value.title,
        ...(blogData.value.tags || [])
    ].filter(Boolean).join(',')
})

useHead({
    title: pageTitle,
    meta: [
        {
            name: 'description',
            content: pageDescription
        },
        {
            name: 'keywords',
            content: pageKeywords
        },
        // Open Graph标签 - 用于社交媒体分享
        {
            property: 'og:title',
            content: pageTitle
        },
        {
            property: 'og:description',
            content: pageDescription
        },
        {
            property: 'og:image',
            content: computed(() => config.baseUrl + blogData.value?.coverImage || '')
        },
        {
            property: 'og:url',
            content: computed(() => window.location.href)
        },
        {
            property: 'og:type',
            content: 'article'
        }
    ]
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
                <span>创建时间 {{ getFormatDate(blogData.createTime) }} </span>
                <div class="blog-author">作者 {{ blogData.author }}</div>
                <div class="blog-word-count">字数 {{ blogData.wordCount }}</div>
            </div>
        </div>

        <!-- 除了头部banner的主体和侧边栏区域 -->
        <div class="blog-main">
            <!-- 博客页面文章主体 -->
            <div class="blog-aritcle">
                <!-- 文章上部分交互区域 -->
                <ArticleHeader :blogData="blogData" class="blog-aritcle-item"></ArticleHeader>
                <!-- 文章主体内容区域 -->
                <ArticleContent :htmlContent="htmlContent" class="blog-aritcle-item"></ArticleContent>
                <!-- 上一篇、下一篇、推荐文章 -->
                <ArticleRecommended class="blog-aritcle-item"></ArticleRecommended>
                <!-- 文章底部相关信息和评论区域 -->
                <ArticleFooter class="blog-aritcle-item"></ArticleFooter>
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
    padding-top: 64px;
    min-height: calc(100vh - 75px);
    width: 100%;

    .blog-header {
        position: relative;
        color: #fff;
        font-family: var(--font-serif);

        .banner {
            width: 100%;
            height: 500px;
            background-attachment: fixed;
            background-size: contain;
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
            bottom: 25px;

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
        max-width: 100vw;      // 限制最大宽度
        // 不能设置 overflow-x: hidden，因为需要 blog-sidebar 的 sticky 需要父元素的 overflow: visible

        .blog-aritcle {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            flex: 1;
            background-color: var(--white);
            border-radius: 15px;
            min-width: 0;          // 允许 flex 项目收缩
            overflow-x: hidden;

            .blog-aritcle-item {
                margin-bottom: 30px;
                max-width: 100%;
            }
        }

        .blog-sidebar {
            width: 300px;
            min-width: 260px;
            height: auto;
            min-height: 100%;
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