<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiCreateComment, apiUpdateComment } from '@/api/comment.js'
import { getGravatarHash, getGravatar } from '@/utils/avatar';

const emit = defineEmits(['updateComments'])
const route = useRoute()
const props = defineProps({
  // 这一评论的回复数组
  comments: {
    type: Array,
    required: true
  },
  // 是否是一级评论
  hasParent: {
    type: Boolean,
    required: true
  },
  // 这一评论的父级评论ID，如果没有父级则为空串
  parentId: {
    type: String,
    default: ''
  }
})

// 表单收集四个数据：username、email、website、content
const formRef = ref(null)
const form = reactive({
  username: '',
  email: '',
  website: '',
  content: '',
})
// 表单校验规则、校验失败的ElMessage提示信息
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

// 提交表单的校验操作 校验三个数据：username、email、content
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
const doSubmit = async () => {

  const defaultAvatar = '/src/assets/images/user_default.png'
  // 生成评论
  let newComment = { 
      ...form,
      id: Date.now().toString(36),
      blogId: route.params.id || '-1',
      parentId: props.parentId,
      avatar: defaultAvatar,
      createTime: new Date(),
      showForm: false,
      hasParent: props.hasParent,
      replies: []
  }

  // 创建评论
  await apiCreateComment(newComment)

  // 提交完成后清空表单数据
  let userEmail = form.email
  form.username = ''
  form.email = ''
  form.website = ''
  form.content = ''
  // ElMessage提示信息
  ElMessage.success('评论成功！')
  
  // 触发更新评论
  emit('updateComments')

  // 尝试获取Grvatar头像，更新新评论的头像
  const avatarSrc = await getAvatar(userEmail)
  if (avatarSrc) {
    newComment.avatar = avatarSrc
    await apiUpdateComment(newComment)
    // 触发更新评论
    emit('updateComments')
  }
}

async function getAvatar(email) {
  try {
    // 获取 Gravatar 的哈希值
    const hash = await getGravatarHash(email)
    // 异步请求获取头像地址
    const res = await getGravatar(hash)
    return res
  } catch (error) {
    return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
  
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
          placeholder="网站 https://" 
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
        提交
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
          color: var(--light-dark);
          background-color: var(--white);
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
            background: linear-gradient(var(--white), var(--white)) padding-box, 
                        linear-gradient(135deg, #ff33b4, #c8ff00, #00ffff, #4400ff) border-box;
            }
        }
      }
    }

    /* 评论输入框样式 */
    .el-textarea {
      
      :deep(.el-textarea__inner) {
        color: var(--light-dark);
        background-color: var(--white);
        box-shadow:none;  // el-textarea的边框是box-shadow
        border: 2px solid var(--lightgrey);
        font-size: 15px;
        resize: none;  // 禁用手动调整大小

        &:focus {
          border: 2px solid transparent;
          background: linear-gradient(var(--white), var(--white)) padding-box, 
          linear-gradient(135deg, #5bc9f8, #c7e9fb, #00c9a7, #a6defa, #35bef7);
        }
      }
      &::placeholder {
          color: var(--quote-color);
      }
    }

    /* 提交按钮样式 */
      .comment-form-submit {
        width: 70px;
        height: 26px;
        background: var(--light-blue);
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