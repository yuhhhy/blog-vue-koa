<script setup>
import { ElButton } from 'element-plus'
import { reactive } from 'vue'
import CommentForm from './CommentForm.vue'
import CommentReply from './CommentReply.vue'
import { getFormatDate } from '@/utils/date';

// 假数据
const comments = reactive([
  {
    id: 'makmow24',
    // avatar: `https://0.gravatar.com/avatar/${getGravatarHash('281423846@qq.com')}`,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '小浣熊饼干',
    email: 'user1@example.com',
    website: 'https://www.example.com',
    content: '这是一条测试评论',
    createTime: new Date('2025-04-14T03:24:00'),
    showForm: false, // 是否显示回复表单
    hasParent: false, // 是否有父级评论
    replies: [
      {
        id: 'makmow26',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        username: '章鱼小丸子',
        email: 'user3@example.com',
        website: 'https://www.example.com',
        content: '这是一条测试回复',
        createTime: new Date('2025-04-16T03:24:00'),
        showForm: false,
        hasParent: true,
        replies: [
        {
            id: 'makmow27',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            username: 'Zephurs',
            email: 'user4@example.com',
            website: '',
            content: '这是一条测试回复的回复',
            createTime: new Date('2025-04-17T03:24:00'),
            showForm: false,
            hasParent: true,
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: 'makmow25',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    username: '樱桃小丸子',
    email: 'user1@example.com',
    website: '',
    content: '这是测试评论，你好啊！',
    createTime: new Date('2025-04-15'),
    showForm: false,
    hasParent: false,
    replies: []
  }
])

const showReplyForm = (comment) => {
  // 显示回复表单
  comment.showForm = true
  // comment.replies.push({})
  // 隐藏回复表单
  // comment.showForm = false
}

</script>

<template>
<div class="article-footer">
  <!-- 顶部评论表单 -->
  <CommentForm :comments="comments" :hasParent="false" :parentId="'0'"></CommentForm>
  <!-- 一级评论列表 -->
  <div class="comment-list">
    <!-- 遍历所有一级评论 -->
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <!-- 一级评论头部信息 -->
      <div class="comment-header">
        <el-avatar :src="comment.avatar" :size="48" />
        <div class="comment-info">
          <a v-if="comment.website" :href="comment.website" target="_blank" class="comment-name" :style="{ color: '#409eff' }">
            {{ comment.username }}
          </a>
          <span v-else class="comment-name">
            {{ comment.username }}
          </span>
          <div class="comment-meta">
            <span class="comment-time">{{ getFormatDate(comment.createTime) }}</span>
            <el-button link type="primary" class="reply-btn" @click="showReplyForm(comment)">
              回复
            </el-button>
          </div>
        </div>
      </div>
      <!-- 一级评论内容 -->
      <div class="comment-content">
        {{ comment.content }}
      </div>
      <!-- 一级评论回复表单 -->
      <CommentForm v-if="comment.showForm" :comments="comment.replies" :hasParent="true" :parentId="comment.id"></CommentForm>
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
