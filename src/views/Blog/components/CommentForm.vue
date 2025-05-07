<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  comments: {
    type: Array,
    required: true
  },
  firstLevel: {
    type: Boolean,
    default: true
  }
})

// 新增评论的表单校验相关
const formRef = ref(null)
const form = reactive({
  username: '',
  email: '',
  website: '',
  content: '',
  isReply: false,
  firstLevel: true,
  replies: []
})
const rules = {
  username: [
    { required: true, message: '请输入昵称', trigger: 'submit' },
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'submit' },
    { type: 'email', message: '请输入正确的电子邮箱', trigger: 'submit' }
  ],
  content: [
    { required: true, message: '请输入评论内容', trigger: 'submit' }
  ]
}

// 提交评论表单校验
const onSubmit = () => {
  formRef.value.validate((valid, fields) => {
    if (!valid) {
      // 根据不同的校验结果，给出不同的提示信息
      if(fields.username && fields.username[0]){
        ElMessage.error(fields.username[0].message)
      } else if(fields.email && fields.email[0]){
        ElMessage.error(fields.email[0].message)
      } else if(fields.content && fields.content[0]){
        ElMessage.error(fields.content[0].message)
      }
      formRef.value.clearValidate() // 不要显示ElFrom的提示信息
      return
    } else {
      doSubmit()
    }
  })
}

// 校验成功后的逻辑
const doSubmit = () => {
    // 生成评论
    const newComment = { 
        id: Date.now(),
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        ...form,
        time: new Date().toLocaleString().replace(/\//g, '.').slice(0, 10),
        replies: []
    }

    // 根据是否是firstLevel一级评论，决定将评论添加到哪个数组中
  if(!props.firstLevel){
    props.comments.unshift(newComment)
  }else{
    props.comments.unshift(newComment)
  }
  
  form.username = ''
  form.email = ''
  form.website = ''
  form.content = ''
}
</script>

<template>
<!-- 评论表单 -->
<el-form :model="form" :rules="rules" ref="formRef" class="comment-form">
    <div class="comment-form-input-row">
      <el-form-item prop="username">
        <el-input
          v-model="form.username" 
          placeholder="昵称*" 
        />
      </el-form-item>
      <el-form-item prop="email">
        <el-input 
          v-model="form.email" 
          placeholder="电子邮箱*" 
        />
      </el-form-item>
      <el-form-item prop="website">
        <el-input
          v-model="form.website" 
          placeholder="网站" 
        />
      </el-form-item>
    </div>
    <el-form-item prop="content">
      <el-input
        v-model="form.content"
        type="textarea"
        :autosize="{ minRows: 3 }"
        placeholder="写下你的评论..."
      />
    </el-form-item>
    <el-form-item>
      <el-button @click="onSubmit" class="comment-form-submit">
        提交评论
      </el-button>
    </el-form-item>
  </el-form>
</template>
<!-- 这里必须加scoped，因为深度选择器:deep()要求配合scoped用，以改变ElementPlus原始样式 -->
<style lang="scss" scoped>
/* 评论表单样式 */
  .comment-form {
    margin-top: 10px;
    margin-bottom: 10px;
    padding: 0 20px;

    /* 表单输入框样式 */
    .comment-form-input-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 15px;
      row-gap: 10px;
      margin-bottom: 15px;
      
      @media (max-width: 1098px) {
        grid-template-columns: 1fr;
      }

      .el-input {
        all: unset;
        width: 100%;
        height: 32px;
        :deep(.el-input__wrapper) {
          all: unset;
        }
        :deep(.el-input__inner) {
          min-height: 32px;
          width: 100%;
          height: 100%;
          border: 2px solid var(--lightgrey);
          border-radius: 4px;
          text-indent: 0.7em;
          transition: all 0.3s ease;
          font-size: 15px;

          &:focus {
            border: 2px solid transparent;
            background: linear-gradient(white, white) padding-box, 
                        linear-gradient(135deg, #ff33b4, #c8ff00, #00ffff, #4400ff) border-box;
            }
        }
      }
    }

    /* 评论输入框样式 */
    .el-textarea {
      margin-bottom: 15px;
      
      :deep(.el-textarea__inner) {
        box-shadow:none;  // el-textarea的边框是box-shadow
        border: 2px solid var(--lightgrey);
        font-size: 15px;
        resize: none;  // 禁用手动调整大小

        &:focus {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, 
          linear-gradient(135deg, #5bc9f8, #c7e9fb, #00c9a7, #a6defa, #35bef7);
        }
      }
      &::placeholder {
          color: var(--quote-color);
      }
    }

    /* 提交按钮样式 */
      .comment-form-submit {
        width: 100px;
        height: 30px;
        background: linear-gradient(135deg, var(--grape), var(--skyblue));
        border: none;
        color: white;
        font-weight: bold;
        &:focus {
          animation: pulse 0.5s;
        }
      }
    /* 提交按钮动画 */
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
  }

</style>