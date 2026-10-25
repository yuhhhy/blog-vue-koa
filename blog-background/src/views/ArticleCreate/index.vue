<script setup>
import Vditor from './components/Vditor.vue'
import ArticleForm from './components/ArticleForm.vue'
import countWords from '@/utils/wordCount.js'
import { ElMessage } from 'element-plus'
import { apiCreateBlog } from '@/api/blog.js'
import { apiCreateBlogContent } from '@/api/blogContent.js'
import { apiUpdateWebsiteLastUpdate, apiUpdateWebsiteTotalWordCount, apiUpdateWebsiteArticle } from '@/api/websiteData.js'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminPage from '@/components/admin/AdminPage.vue'

// 提交数据
let blog = {}

const blurHandler = (content) => {
    blog = { ...blog, content }
}

// 处理用户的确定提交
const submitHandler = (formData) => {
    // 文章内容不能为空
    if (!blog.content || blog.content === '\n') {
        ElMessage.error('文章内容不能为空')
        return
    }

    blog = { ...blog, ...formData }
    createBlogAndBlogContent()
}

// 创建博客和博客内容
const createBlogAndBlogContent = async () => {

    // 创建时间
    blog.date = new Date()
    // 创建id
    blog.id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`
    // 创建博客字数
    blog.wordCount = countWords(blog.content)

    await apiCreateBlog({
        id: blog.id,
        date: blog.date,
        createTime: blog.date,
        title: blog.title,
        coverImage: blog.coverImg,
        tags: blog.tags,
        link: `/blog/${blog.id}`
    })

    await apiCreateBlogContent({
        id: blog.id,
        title: blog.title,
        author: blog.author,
        coverImage: blog.coverImg,
        date: blog.date,
        createTime: blog.date,
        tags: blog.tags,
        content: blog.content,
        wordCount: blog.wordCount,
        viewCount: 0,
        likeCount: 0
    })

    // 更新最后更新时间
    apiUpdateWebsiteLastUpdate()
    // 更新站点总字数
    apiUpdateWebsiteTotalWordCount()
    // 更新网站总博客数
    apiUpdateWebsiteArticle()
    
    ElMessage.success('文章提交成功')
}

</script>

<template>
    <AdminPage class="article-create-page">
        <AdminCard title="文章正文" class="editor-card"><Vditor @vblur="blurHandler" /></AdminCard>
        <ArticleForm @articleSubmit="submitHandler" />
    </AdminPage>
</template>

<style scoped>
.editor-card { overflow: hidden; }
.editor-card :deep(.vditor) { border: 0; border-radius: var(--admin-radius); background: var(--md-sys-color-surface-container-low); }
.editor-card :deep(.vditor-toolbar) { border-color: #e7e0ec; background: var(--admin-surface-muted); }
@media (max-width: 720px) {
    .editor-card :deep(.vditor-toolbar) { overflow-x: auto; white-space: nowrap; }
    .editor-card :deep(.vditor-content) { min-height: 360px; }
}
</style>
