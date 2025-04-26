<script setup>
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import { ref, reactive } from 'vue'

// 假数据
const comments = reactive([
  {
    id: 1,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '用户1',
    email: 'user1@example.com',
    website: 'https://www.example.com',
    content: '这是一条测试评论',
    time: '2023.05.15',
    replies: []
  },
  {
    id: 2,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '用户2',
    email: 'user1@example.com',
    website: '',
    content: '这是测试评论，你好啊！',
    time: '2023.05.15',
    replies: []
  }
])

// 新增评论的表单校验相关
const formRef = ref(null)
const form = reactive({
  username: '',
  email: '',
  website: '',
  content: ''
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
  comments.unshift({
    id: Date.now(),
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    ...form,
    time: new Date().toLocaleString().replace(/\//g, '.').slice(0, 10),
    replies: []
  })
  form.username = ''
  form.email = ''
  form.website = ''
  form.content = ''
}
</script>

<template>
<div class="article-footer">

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

  <div class="comment-list">
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <div class="comment-header">
        <el-avatar :src="comment.avatar" :size="48" />
        <div class="comment-info">
          <a 
            v-if="comment.website" 
            :href="comment.website" 
            target="_blank"
            class="comment-name"
            :style="{ color: '#409eff' }"
          >
            {{ comment.username }}
          </a>
          <span v-else class="comment-name">
            {{ comment.username }}
          </span>
          <div class="comment-meta">
            <span class="comment-time">{{ comment.time }}</span>
            <el-button 
              link
              type="primary"
              class="reply-btn"
            >
              回复
            </el-button>
          </div>
        </div>
      </div>
      <div class="comment-content">
        {{ comment.content }}
      </div>
    </div>
  </div>
</div>
</template>

<!-- 这里必须加scoped，因为深度选择器:deep()要求配合scoped用，以改变ElementPlus原始样式 -->
<style lang="scss" scoped>
.article-footer {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
  border-radius: 8px;
  overflow: hidden;

  /* 评论表单样式 */
  .comment-form {
    margin-top: 10px;
    margin-bottom: 40px;
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
          border: 2px solid #dcdfe6;
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
        border: 2px solid #dcdfe6;
        font-size: 15px;
        resize: none;  // 禁用手动调整大小

        &:focus {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, 
          linear-gradient(135deg, #5bc9f8, #c7e9fb, #00c9a7, #a6defa, #35bef7);
        }
      }
      &::placeholder {
          color: #aeaeae;
      }
    }

    /* 提交按钮样式 */
      .comment-form-submit {
        width: 100px;
        height: 30px;
        background: linear-gradient(135deg, #c850c0, #4158d0);
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

    /* 表单验证错误提示样式 */
    .el-form-item {
      :deep(.el-form-item__error) {
        color: #ff4757;
        font-size: 12px;
        padding: 4px 0;
        animation: shake 0.5s ease;
        background: linear-gradient(to right, #fff0f0, #ffebee);
        border-radius: 4px;
        padding: 5px 10px;
      }
    }
    /* 表单验证错误提示动画 */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
  }

  /* 评论列表样式 */
  .comment-list {
    .comment-item {
      padding: 20px;
      background: #fff;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      
      .comment-header {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        
        .el-avatar {
          width: 48px;
          height: 48px;
        }
        
        .comment-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding-top: 5px;
          
          .comment-name {
            margin-bottom: 5px;
            &:hover {
              text-decoration: underline;
            }
          }
          
          .comment-meta {
            display: flex;
            align-items: center;
            gap: 10px;
            
            .reply-btn {
              color: #409eff;
              font-size: 13px;
              padding: 0;
            }
          }
        }
      }
      .comment-content {
      }
    }
  }
}
</style>
