<script setup>
import { ref } from 'vue'
import { apiCreateBlog, apiDeleteBlog } from '@/api/index.js';
import { ElMessage } from 'element-plus';

const blogId = ref('')
const blogData = ref({
    title: '',
    author: '',
    wordCount: 0,
    content: '',
    coverImage: '/images/20171227.jpg',
    tags: '',
})

// 创建新的博客
const createNewBlog = () => {

    // 处理博客数据
    blogData.value.wordCount = blogData.value.content.length // 计算字数
    blogData.value.tags = blogData.value.tags.split(' ') // 将标签字符串转换为数组
    blogData.value.date = new Date().toISOString().substring(0, 10) // 获取当前日期

    apiCreateBlog(blogData.value).then(() => { ElMessage.success('博客创建成功')} )
}

// 删除博客
const deleteBlog = (id) => {
    apiDeleteBlog(id).then(() => { ElMessage.success('博客删除成功') })
}

</script>

<template>
    <div class="container">
        <h1>Archive page</h1>

        <el-form label-width="80px" class="demo-ruleForm">

            <el-form-item label="博客标题">
                <el-input v-model="blogData.title"></el-input>
            </el-form-item>
            <el-form-item label="博客作者">
                <el-input v-model="blogData.author"></el-input>
            </el-form-item>
            <el-form-item label="博客内容">
                <el-input v-model="blogData.content" type="textarea" placeholder="请输入markdown格式的博客内容"></el-input>
            </el-form-item>
            <el-form-item label="博客标签">
                <el-input v-model="blogData.tags" placeholder="用空格分隔"></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="createNewBlog">创建</el-button>
                <el-button>取消</el-button>
            </el-form-item>
        </el-form>

        <button @click="deleteBlog(blogId)">删除博客</button>
        <input type="text" v-model="blogId" placeholder="请输入博客ID" />
    </div>
</template>

<style lang="scss" scoped>
.container {
    margin-top: 64px;
    font-size: 0.875rem;
}
</style>
