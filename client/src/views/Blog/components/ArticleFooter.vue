<script setup>
import { ElButton } from 'element-plus'
import { reactive, ref } from 'vue'
import CommentForm from './CommentForm.vue'
import CommentReply from './CommentReply.vue'

// 假数据
const comments = reactive([
  {
    id: 1,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '小浣熊饼干',
    email: 'user1@example.com',
    website: 'https://www.example.com',
    content: '这是一条测试评论',
    time: '2025.04.15',
    isReply: false, // 是否显示回复表单
    firstLevel: true, // 是否是一级评论
    replies: [
      {
        id: 3,
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        username: '章鱼小丸子',
        email: 'user3@example.com',
        website: 'https://www.example.com',
        content: '这是一条测试回复',
        time: '2025.04.16',
        isReply: false,
        firstLevel: false,
        replies: [
        {
            id: 4,
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            username: 'Zephurs',
            email: 'user4@example.com',
            website: '',
            content: '这是一条测试回复的回复',
            time: '2025.04.15',
            isReply: false,
            firstLevel: false,
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: 2,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '樱桃小丸子',
    email: 'user1@example.com',
    website: '',
    content: '这是测试评论，你好啊！',
    time: '2025.04.15',
    isReply: false,
    firstLevel: true,
    replies: []
  }
])

const showReplyForm = (comment) => {
  // 显示回复表单
  comment.isReply = true
  // comment.replies.push({})
  // 隐藏回复表单
  // comment.isReply = false
}


</script>

<template>
<div class="article-footer">
  <!-- 顶部的评论表单 -->
  <CommentForm :comments="comments" :firstLevel="true"></CommentForm>
  <!-- 一级评论列表 -->
  <div class="comment-list">
    <!-- 遍历所有一级评论 -->
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <!-- 一级评论头部信息 -->
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
              @click="showReplyForm(comment)"
            >
              回复
            </el-button>
          </div>
        </div>
      </div>
      <!-- 一级评论内容 -->
      <div class="comment-content">
        {{ comment.content }}
      </div>
      <!-- 点击显示的回复表单区域 -->
      <CommentForm v-if="comment.isReply" :comments="comment.replies" :firstLevel="comment.firstLevel"></CommentForm>
      <!-- 非一级评论组件 -->
      <CommentReply :comment="comment">
      </CommentReply>
    </div>
  </div>
</div>
</template>

<style lang="scss">
.article-footer {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: var(--light-dark);
  line-height: 1.6;
  border-radius: 8px;
  overflow: hidden;

  /* 评论列表样式 */
  .comment-list {
    .comment-item {
      padding: 20px;
      background: var(--white);
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      
      .comment-header {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        
        .el-avatar {
          width: 48px;
          height: 48px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
        }
        
        .comment-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding-top: 5px;
          font-size: 14px;

          .comment-name {
            &:hover {
              text-decoration: underline;
            }
          }

          .comment-meta {
            display: flex;
            align-items: center;
            gap: 10px;
            .reply-btn {
              color: var(--blue);
              font-size: 13px;
              padding: 0;
            }
          }
        }
      }
    }
  }
}
</style>
