<script setup>
import { reactive } from 'vue'

const form = reactive({
    title: '示例文章标题',
    author: '作者名',
    tags: ['标签1', '标签2'],
    coverImg: ''
})

</script>

<template>
  <el-form 
    :model="form"
    :inline="true" 
    label-width="auto" 
    class="bg-white pt-8 pb-4 pl-8 pr-8">
    <!-- 文章 -->
    <el-form-item 
      prop="title"
      label="文章标题" 
      style="min-width: 500px;"
      class="pl-5"
    >
      <el-input v-model="form.title" placeholder="请输入标题"></el-input>
    </el-form-item>
    <!-- 作者 -->
    <el-form-item 
      prop="author"
      label="作者" 
      style="min-width: 500px;"
      class="pl-5"
    >
      <el-input v-model="form.author" placeholder="作者名称"></el-input>
    </el-form-item>
    <!-- 标签 -->
    <el-form-item
      prop="tags"
      label="文章标签"
      class="pl-5"
      style="min-width: 500px;"
    >
      <el-input-tag v-model="form.tags" placeholder="按Enter键添加标签"/>
    </el-form-item>
    <!-- 封面图片 -->
    <el-form-item 
      porp="coverImg"
      label="封面"
      class="pl-5"
    >
      <el-popover placement="top" width="173">
        <template #reference> <el-button>上传文章封面</el-button></template>
        <el-upload
          action=""
          list-type="picture-card"
          :limit="1"
        >
          <div class="el-upload__text">点击上传</div>
        </el-upload>
        <div class="el-upload__tip" slot="tip">限制上传一张，只能上传jpg/png文件</div>
      </el-popover>
    </el-form-item>
 </el-form>
</template>

<style scoped>
</style>