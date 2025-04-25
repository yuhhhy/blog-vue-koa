<script setup>
import { ref, reactive } from 'vue'

// 假数据
const comments = [
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
]

const newComment = reactive({
  username: '',
  email: '',
  website: '',
  content: ''
})

const submitComment = () => {
  if (!newComment.username || !newComment.email) {
    return
  }

  comments.unshift({
    id: Date.now(),
    avatar: `https://i.pravatar.cc/150?u=${newComment.email}`,
    ...newComment,
    time: new Date().toLocaleString(),
    replies: []
  })
  newComment = reactive({ username: '', email: '', website: '', content: '' })
}
</script>

<template>
<div class="article-footer">
  <div class="comment-form">
    <div class="comment-form-input-row">
      <input 
        v-model="newComment.username" 
        placeholder="昵称*" 
        class="input-item"
      />
      <el-input 
        v-model="newComment.email" 
        placeholder="电子邮箱*" 
        class="input-item"
      />
      <input 
        v-model="newComment.website" 
        placeholder="网站" 
        class="input-item"
      />
    </div>
    <el-input
      v-model="newComment.content"
      type="textarea"
      :autosize="{ minRows: 3 }"
      placeholder="写下你的评论..."
      class="comment-form-textarea"
    />
    <el-button 
      @click="submitComment" 
      class="comment-form-submit" 
    >
      提交评论
    </el-button>
  </div>

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

<style lang="scss">
.article-footer {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
  border-radius: 8px;
  overflow: hidden;

  .comment-form {
    margin-bottom: 40px;
    padding: 0 20px;

    .comment-form-input-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 25px;
      row-gap: 15px;
      margin-bottom: 15px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .input-item {
        min-height: 32px;
            width: 100%;
            height: 100%;
            border: 2px solid #dcdfe6;
            border-radius: 4px;
            outline: none;
            transition: all 0.3s ease;
            text-indent: 0.7em;
            color: #757575;
            font-size: 16px;

        &:focus {
            border: 2px solid transparent;
            background: linear-gradient(white, white) padding-box, 
            linear-gradient(135deg, #ff33b4, #c8ff00, #00ffff, #4400ff) border-box;
        }
        &::placeholder {
            color: #aeaeae;
            opacity: 1;
        }

        :deep(.el-input__wrapper) {
            all: unset;
        }
      }
    }
    
    .comment-form-textarea {
        :deep(.el-textarea__inner) {
            all: unset;
        }

      margin-bottom: 15px;
    }
    
    .comment-form-submit {
      float: right;
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
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  }
  
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
