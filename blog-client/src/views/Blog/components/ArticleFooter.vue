<script setup>
import { ElButton } from 'element-plus'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFormatDate } from '@/utils/date'
import { apiGetComments } from '@/api/comment'
import CommentForm from './CommentForm.vue'
import CommentReply from './CommentReply.vue'

const route = useRoute()
const comments = ref([])
const formState = ref(true) // 用于控制顶部表单的显示与隐藏

// 显示/隐藏顶部评论表单
const toggleCommentForm = () => {
  formState.value = !formState.value
}

// 显示/隐藏回复表单
const toggleReplyForm = (comment) => {
  comment.showForm = !comment.showForm
}

// 获取评论
const getComments = () => {
  apiGetComments(route.params.id || '-1').then(res => {
    comments.value = res
  })
}

// 自定义updateComments事件回调
const updateComments = () => {
  getComments()
}
// 自定义replyUpdate事件回调
const replyUpdate = () => {
  getComments()
}

onMounted(()=>{
  getComments()
})
</script>

<template>
<div class="article-footer">
  <!-- 顶部评论表单 -->
  <span class="top-form" @click="toggleCommentForm">发表评论</span>
  <!-- parentId = '-1' 表示没有 parent 评论 -->
  <CommentForm 
    v-show="formState" 
    :comments="comments" 
    :hasParent="false" 
    :parentId="'-1'"
    @updateComments="updateComments">
  </CommentForm>
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
            <el-button link type="primary" class="reply-btn" @click="toggleReplyForm(comment)">
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
      <CommentForm 
        v-if="comment.showForm" 
        :comments="comment.replies" 
        :hasParent="true" 
        :parentId="comment.id"
        @updateComments="updateComments">
      </CommentForm>
      <!-- 非一级评论组件 -->
      <CommentReply 
        :comment="comment"
        @replyUpdate="replyUpdate">
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
  
  .top-form {
    color: var(--blue);
    padding-left: 20px;
    cursor: pointer;
  }

  /* 评论列表样式 */
  .comment-list {
    .comment-item {
      padding: 10px 20px;
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
