<script setup>
import ArticleContent from './components/ArticleContent.vue'
import ArticleLike from './components/ArticleLike.vue'
import ArticleFooter from './components/ArticleFooter.vue'

import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { ref, watch, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute, useRouter } from 'vue-router'
import { apiGetBlogContent, apiUpdateBlogViewCount, getCachedBlogContent } from '@/api/blogContent.js'
import { getFormatDate } from '@/utils/date.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'
import config from '@/config/index.js'

const route = useRoute()
const router = useRouter()
const initialBlogData = getCachedBlogContent(route.params.id)
let htmlContent = ref('') // html格式文章内容
let blogData = ref(initialBlogData || {}) // data/posts.json

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
})

const defaultFenceRender = md.renderer.rules.fence
const defaultImageRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
}

const parseFenceMeta = (meta = '') => {
    return meta.split(/\s+/).filter(Boolean).reduce((result, item) => {
        const [key, ...valueParts] = item.split('=')
        if (!key || !valueParts.length) return result

        result[key] = valueParts.join('=').replace(/^["']|["']$/g, '')
        return result
    }, {})
}

const renderAnimationPlaceholder = (animationProps = {}) => {
    return `<div data-animation data-props="${md.utils.escapeHtml(encodeURIComponent(JSON.stringify(animationProps)))}"></div>`
}

md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx]
    const info = token.info.trim()
    const [blockType, ...meta] = info.split(/\s+/)

    if (blockType === 'animation') {
        return renderAnimationPlaceholder({
            ...parseFenceMeta(meta.join(' ')),
            html: token.content
        })
    }

    if (defaultFenceRender) {
        return defaultFenceRender(tokens, idx, options, env, self)
    }

    return self.renderToken(tokens, idx, options)
}

md.renderer.rules.image = function(tokens, idx, options, env, self) {
    const token = tokens[idx]
    token.attrPush(['loading', 'lazy'])
    return defaultImageRender(tokens, idx, options, env, self)
}

// 渲染文章内容 Markdown -> HTML
const renderBlogContent = () => {
    htmlContent.value = DOMPurify.sanitize(md.render(blogData.value.content || ''), {
        ADD_ATTR: ['data-animation', 'data-props']
    })
}

if (initialBlogData) renderBlogContent()

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
    if (data?.viewCount !== undefined) blogData.value.viewCount = data.viewCount
}

function reportBlogView() {
    runAfterPageIdle(() => {
        updateBlogViewCount()
    })
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      // 重置数据
      htmlContent.value = ''
      blogData.value = {}
      
      // 重新获取数据
      await getBlogContent()
      reportBlogView()
    }
  },
  { immediate: true } // 立即执行一次
)

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
        <div class="blog-surface">
            <header class="blog-heading">
                <p>ARTICLE</p>
                <h1>{{ blogData.title }}</h1>
                <div class="blog-meta">
                    <time :datetime="blogData.createTime">{{ getFormatDate(blogData.createTime) }}</time>
                    <span aria-hidden="true">·</span>
                    <span>{{ blogData.wordCount }} 字</span>
                    <template v-if="blogData.createTime !== blogData.updateTime">
                        <span aria-hidden="true">·</span>
                        <span>更新于 {{ getFormatDate(blogData.updateTime) }}</span>
                    </template>
                </div>
            </header>

            <div class="blog-main">
                <div class="blog-article">
                    <ArticleContent :htmlContent="htmlContent" class="blog-article-item" />
                    <ArticleLike :blogData="blogData" class="blog-article-item" />
                    <ArticleFooter class="blog-article-item" />
                </div>
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
    position: relative;
    min-height: calc(100vh - 75px);
    width: 100%;

    .blog-surface {
        position: relative;
        z-index: 3;
    }

    .blog-heading {
        padding-block: clamp(64px, 10vw, 120px) clamp(42px, 6vw, 72px);
        font-family: var(--font-system-sans);

        > p {
            color: var(--quote-color);
            font-family: inherit;
            font-size: 0.75rem;
            letter-spacing: 0.24em;
            line-height: 1;
        }

        h1 {
            max-width: 860px;
            margin-top: 12px;
            color: var(--black);
            font-size: clamp(1.875rem, 3.8vw, 3.25rem);
            font-weight: 700;
            letter-spacing: 0.04em;
            line-height: 1.25;
            text-wrap: balance;
        }
    }

    .blog-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 24px;
        color: var(--quote-color);
        font-family: var(--font-system-sans);
        font-size: 0.8125rem;
    }

    .blog-main {
        padding-bottom: clamp(48px, 8vw, 96px);
        height: 100%;

        .blog-article {
            min-width: 0;
            overflow-x: hidden;

            .blog-article-item {
                margin-bottom: clamp(32px, 5vw, 56px);
                max-width: 100%;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .blog-container {
        .blog-heading {
            padding-block: 72px 44px;

            h1 {
                font-size: clamp(1.75rem, 8vw, 2.4rem);
            }
        }

        .blog-main {
            padding-bottom: 48px;
        }
    }
}
</style>
