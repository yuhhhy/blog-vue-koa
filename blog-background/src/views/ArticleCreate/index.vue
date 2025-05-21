<script setup>
import Vditor from './components/Vditor.vue'
import ArticleForm from './components/ArticleForm.vue'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiCreateBlog } from '@/api/blog.js'
import { apiCreateBlogContent } from '@/api/blogContent.js'

const submitData = ref()

const blurHandler = (data) => {
    submitData.value = { ...submitData.value, content: data }
}

const submitHandler = async (datas) => {
    submitData.value = { ...submitData.value, ...datas }
    if (!submitData.value.content || submitData.value.content === '\n') {
        ElMessage.error('文章内容不能为空')
    } else {
        console.log('submitData', submitData.value)
        // 创建时间
        const dateNow = new Date()

        // 创建博客和博客内容
        // const res = await apiCreateBlog({
        //     id: 1,
        //     title: submitData.value.title,
        //     coverImage: '123',
        //     date: dateNow,
        //     tags: submitData.value.tags,
        //     link: submitData.value.link
        // })
        
        ElMessageBox.alert('提交成功', '提示', {
        confirmButtonText: '确定',
        type: 'success'
      })
    }
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