<script setup>
import CommentForm from './CommentForm.vue'

defineProps(['comment'])

const showReplyForm = (comment) => {
  // 显示回复表单
  comment.isReply = true

  // 隐藏回复表单
  // comment.isReply = false

}
</script>

<template>
<div v-if="comment.replies.length > 0" class="comment-replies">
    <!-- 显示所有二级回复 -->
    <div v-for="reply in comment.replies" :key="reply.id" class="comment-reply">
        <div class="comment-header">
        <el-avatar :src="reply.avatar" :size="48" />
        <div class="comment-info">
            <a
            v-if="reply.website"
            :href="reply.website"
            target="_blank"
            class="comment-name"
            :style="{ color: '#409eff' }"
            >
            {{ reply.username }}
            </a>
            <span v-else class="comment-name">
            {{ reply.username }}
            </span>
            <div class="comment-meta">
            <span class="comment-time">{{ reply.time }}</span>
            <el-button 
                link
                type="primary"
                class="reply-btn"
                @click="showReplyForm(reply)"
            >
                回复
            </el-button>
            </div>
        </div>
        </div>
        <div class="comment-content">
            {{ reply.content }}
        </div>
        <CommentForm v-if="reply.isReply" :comments="reply.replies" :firstLevel="reply.firstLevel"></CommentForm>
        <!-- 递归地显示更深层级回复 -->
        <CommentReply v-if="reply.replies.length > 0" :comment="reply" />
    </div>
</div>
</template>

<style lang="scss" scoped>
.comment-replies {
    margin-top: 15px;
    padding-left: 30px;
    border-left: 2px solid #e5e5e5;

    :deep(.el-avatar) {
        width: 40px !important;
        height: 40px !important;
    }
}
</style>