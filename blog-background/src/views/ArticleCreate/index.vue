<script setup>
import Vditor from './components/Vditor.vue'
import ArticleForm from './components/ArticleForm.vue'
import countWords from '@/utils/wordCount.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiCreateBlog } from '@/api/blog.js'
import { apiCreateBlogContent } from '@/api/blogContent.js'
import { apiUpdateWebsiteLastUpdate } from '@/api/websiteData.js'

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
    
    ElMessageBox.alert('提交成功', '提示', {
    confirmButtonText: '确定',
    type: 'success'
    })
}

</script>

<template>
    <div class="flex flex-col h-full">
        <Vditor @vblur="blurHandler"/>
        <ArticleForm @articleSubmit="submitHandler" class="flex-1"/>
    </div>
</template>

<style scoped>
 
</style>