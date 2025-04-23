<script setup>
import { ref } from 'vue'
import { apiCreateBlog, apiDeleteBlog } from '@/api/index.js';
import { ElMessage } from 'element-plus';

const blogId = ref('')
const blogData = ref({
    title: '新建博客',
    author: '小白',
    wordCount: 0,
    content: '',
    coverImage: '/images/20171227.jpg',
    tags: [],
})

// 创建新的博客
const createNewBlog = () => {

    // 自动计算字数
    blogData.value.wordCount = blogData.value.content.length

    const newBlog = blogData.value

    apiCreateBlog(newBlog)
        .then((data) => {
            console.log('创建成功', data)
            ElMessage.success('创建成功')
        }).catch((error) => {
            console.error(error)
        })
}

// 删除博客
const deleteBlog = (id) => {
    apiDeleteBlog(id)
        .then((data) => {
            console.log('删除成功', data)
        }).catch((error) => {
            console.error(error)
        })
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
                <el-input v-model="blogData.content"></el-input>
            </el-form-item>
            <el-form-item label="博客标签">
                <el-input v-model="blogData.tags"></el-input>
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
}
</style>
