<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const emit = defineEmits(['articleSubmit'])
const formRef = ref(null)
const form = reactive({
    title: '示例文章标题',
    author: '作者名',
    tags: ['标签1', '标签2'],
    coverImgUploaded: false
})
const rules = {
  title: [
    { required: true, message: '请添加文章标题', trigger: 'submit' },
  ],
  author: [
    { required: true, message: '请输入作者名称', trigger: 'submit' },
  ],
  tags: [
    { required: true, message: '请添加标签', trigger: 'submit' },
  ],
  coverImgUploaded: [
    { required: true, message: '请上传封面', trigger: 'submit' },
  ]
}

// 提交文章的全部信息
const handleSubmit = () => {
  formRef.value.validate((valid, fields) => {
    if (!valid) {
      if (fields.title && fields.title[0]) {
        ElMessage.error(fields.title[0].message)
      } else if (fields.author && fields.author[0]) {
        ElMessage.error(fields.author[0].message)
      } else if (fields.tags && fields.tags[0]) {
        ElMessage.error(fields.tags[0].message)
      }
      formRef.value.clearValidate() // 不要显示ElFrom的提示信息
      return
    }
    
    // 验证封面图片是否上传
    if (!form.coverImgUploaded) {
      ElMessage.error('请上传封面图片')
      return
    }
    // 验证通过，显示确认对话框
    ElMessageBox.confirm('确认后写入内容会清空，确定提交文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).then(
      async () => {
        emit('articleSubmit', { ...form })
        form.title = ''
        form.author = ''
        form.tags = []
        form.coverImgUploaded = false
      }).catch(() => {
      })
  })
}

// 图片文件上传成功，返回文件数据
const uploadSuccess = (file) => {
  form.coverImg = '/images/' + file.filename
  form.coverImgUploaded = true
  ElMessage.success("封面上传成功")
}

// 图片文件上传失败
const uploadError = (file) => {
  ElMessage.error("封面上传失败")
}
</script>

<template>
  <el-form 
    :model="form"
    :inline="true"
    label-width="auto" 
    ref="formRef"
    :rules="rules"
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
        <template #reference><el-button>上传文章封面</el-button></template>
        <el-upload
          action="http://localhost:3000/api/upload/image"
          list-type="picture-card"
          :limit="1"
          :on-success="uploadSuccess"
          :on-error="uploadError"
        >
          <div class="el-upload__text">点击上传</div>
        </el-upload>
        <div class="el-upload__tip" slot="tip">限制上传一张，只能上传jpg/png文件</div>
      </el-popover>
    </el-form-item>

    <el-button 
      type="primary"
      class="-mt-4 ml-52"
      @click="handleSubmit">
      提交
    </el-button>
  </el-form>
</template>

<style scoped>
</style>