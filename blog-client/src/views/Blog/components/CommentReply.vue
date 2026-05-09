<script setup>
/**
 * 这是一个递归组件！
 */
import CommentForm from './CommentForm.vue'
import { getFormatDate } from '@/utils/date'

// 添加parseEmoji参数接收表情解析函数
const props = defineProps({
  comment: Object,
  parseEmoji: Function  // 接收从父组件传来的解析函数
})

const emit = defineEmits(['replyUpdate'])

// 显示/隐藏回复表单
const toggleReplyForm = (comment) => {
  comment.showForm = !comment.showForm
}

// 统一处理所有更新事件，确保正确向上传递
const handleUpdate = () => {
  emit('replyUpdate')
}
</script>

<template>
<div v-if="comment.replies.length > 0" class="comment-replies">
    <!-- 显示所有二级回复 -->
    <div v-for="reply in comment.replies" :key="reply.id" class="comment-reply">
        <!-- 评论头部信息 -->
        <div class="comment-header">
            <el-avatar :src="reply.avatar" :size="48" />
            <div class="comment-info">
                <a v-if="reply.website" :href="reply.website" target="_blank" class="comment-name" :style="{ color: '#409eff' }">
                {{ reply.username }}
                </a>
                <span v-else class="comment-name">
                {{ reply.username }}
                </span>
                <span class="comment-sep">·</span>
                <span class="comment-time">{{ getFormatDate(reply.createTime) }}</span>
            </div>
        </div>
        
        <!-- 评论内容 - 使用v-html和表情解析函数 -->
        <div class="comment-content" v-html="parseEmoji ? parseEmoji(reply.content) : reply.content"></div>
        
        <!-- 回复按钮 -->
        <div class="comment-footer">
            <el-button link type="primary" class="reply-btn" @click="toggleReplyForm(reply)">
                回复
            </el-button>
        </div>
        
        <!-- 二级评论回复表单 - 修改事件处理器 -->
        <CommentForm 
          v-if="reply.showForm" 
          :comments="reply.replies" 
          :hasParent="true" 
          :parentId="reply.id"
          :blogId="comment.blogId"
          @updateComments="handleUpdate">  <!-- 使用统一的处理函数 -->
        </CommentForm>
          
        <!-- 递归显示更深层级回复 - 修改事件处理器 -->
        <CommentReply 
          v-if="reply.replies && reply.replies.length > 0" 
          :comment="reply"
          :parseEmoji="parseEmoji"
          @replyUpdate="handleUpdate">  <!-- 使用统一的处理函数 -->
        </CommentReply>
    </div>
</div>
</template>

<style lang="scss" scoped>
.comment-replies {
    margin-top: 15px;
    padding-left: 20px;
    border-left: 2px solid var(--reply-border);

    :deep(.el-avatar) {
        width: 40px !important;
        height: 40px !important;
    }

    .comment-reply {
        margin-bottom: 15px;
        
        .comment-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          
          .comment-info {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            padding-top: 5px;
            
            .comment-sep {
              font-size: 0.8rem;
              color: #999;
            }
            
            .comment-time {
              font-size: 0.8rem;
              color: #999;
              cursor: default;
            }
          }
        }
        
        .comment-footer {
          margin: 5px 0 0 58px;
        }
        
        /* 添加表情图片样式 */
        :deep(.comment-emoji) {
          display: inline-block;
          vertical-align: middle;
          width: 24px;
          height: 24px;
          margin: 0 2px;
        }
    }
    
    /* 评论内容样式 */
    .comment-content {
        margin: 10px 0 5px 58px;  /* 缩进与头像对齐 */
        line-height: 1.6;
        word-break: break-word;
    }

    .reply-btn {
        color: var(--blue);
        font-family: var(--font-serif);
        font-size: 0.8rem;
        padding: 0;

        :deep(span) {
            font-family: inherit;
        }
    }
}
</style>
