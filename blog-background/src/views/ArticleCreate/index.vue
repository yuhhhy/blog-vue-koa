<script setup>
import { ref } from 'vue'
import MilkdownEditor from './components/MilkdownEditor.vue'
import ArticleForm from './components/ArticleForm.vue'
import countWords from '@/utils/wordCount.js'
import { ElMessage } from 'element-plus'
import { apiCreateBlog } from '@/api/blog.js'
import { apiCreateBlogContent } from '@/api/blogContent.js'
import { apiUpdateWebsiteLastUpdate, apiUpdateWebsiteTotalWordCount, apiUpdateWebsiteArticle } from '@/api/websiteData.js'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import { useArticleStore } from '@/stores/articleStore.js'

// 提交数据
let blog = {}
const submitting = ref(false)
const editorRef = ref(null)
const articleFormRef = ref(null)
const articleStore = useArticleStore()

const blurHandler = (content) => {
    blog = { ...blog, content }
}

// 处理用户的确定提交
const submitHandler = async (formData) => {
    // 文章内容不能为空
    if (!blog.content?.trim()) {
        ElMessage.error('文章内容不能为空')
        return
    }

    blog = { ...blog, ...formData }
    submitting.value = true
    try {
        await createBlogAndBlogContent()
        articleStore.clearArticleDraft()
        articleFormRef.value?.resetForm()
        editorRef.value?.clearContent()
        blog = {}
        ElMessage.success('文章提交成功')
    } catch {
        ElMessage.error('文章提交失败，已保留全部草稿内容')
    } finally {
        submitting.value = false
    }
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

    // 统计数据更新失败不影响文章本身的创建结果
    await Promise.allSettled([
        apiUpdateWebsiteLastUpdate(),
        apiUpdateWebsiteTotalWordCount(),
        apiUpdateWebsiteArticle(),
    ])
}

</script>

<template>
    <AdminPage class="article-create-page">
        <AdminCard title="文章正文" class="editor-card">
            <MilkdownEditor ref="editorRef" @vblur="blurHandler" />
        </AdminCard>
        <ArticleForm ref="articleFormRef" :submitting="submitting" @articleSubmit="submitHandler" />
    </AdminPage>
</template>

<style scoped>
.editor-card { overflow: visible; }
</style>
