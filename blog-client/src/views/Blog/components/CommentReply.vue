<script setup>
/**
 * 这是一个递归组件！
 */
import { defineAsyncComponent } from 'vue'
import { getFormatDateTimeToMinute } from '@/utils/date'
import CommentEnvironmentIcon from './CommentEnvironmentIcon.vue'

const CommentForm = defineAsyncComponent(() => import('./CommentForm.vue'))

// 添加parseEmoji参数接收表情解析函数
const props = defineProps({
  comment: Object,
  parseEmoji: Function,  // 接收从父组件传来的解析函数
  isRoot: {
    type: Boolean,
    default: false
  }
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
<div
  v-if="comment.replies.length > 0"
  :class="['comment-replies', { 'comment-replies--root': isRoot }]"
>
    <!-- 显示所有二级回复 -->
    <article v-for="reply in comment.replies" :key="reply.id" class="comment-reply">
        <div class="comment-node">
          <div class="comment-avatar-rail">
            <el-avatar :src="reply.avatar" :size="36" shape="square" class="comment-avatar" />
          </div>
          <div class="comment-body">
            <!-- 评论头部信息 -->
            <div class="comment-header">
              <div class="comment-author">
                <a v-if="reply.website" :href="reply.website" target="_blank" class="comment-name comment-name--link">
                  {{ reply.username }}
                </a>
                <span v-else class="comment-name">
                  {{ reply.username }}
                </span>
                <div class="comment-details">
                  <span v-if="reply.browser" class="comment-detail-item">
                    <CommentEnvironmentIcon kind="browser" :value="reply.browser" />
                    {{ reply.browser }}
                  </span>
                  <span v-if="reply.os" class="comment-detail-item">
                    <CommentEnvironmentIcon kind="os" :value="reply.os" />
                    {{ reply.os }}
                  </span>
                  <time class="comment-detail-item">
                    <CommentEnvironmentIcon kind="time" :value="reply.createTime" :timezone="reply.timezone" />
                    {{ getFormatDateTimeToMinute(reply.createTime, reply.timezone) }}
                  </time>
                </div>
              </div>
                <button
                  type="button"
                  class="reply-btn"
                  :aria-expanded="Boolean(reply.showForm)"
                  @click="toggleReplyForm(reply)"
                >
                    {{ reply.showForm ? '取消回复' : '回复' }}
                </button>
            </div>
            <!-- 评论内容 - 使用v-html和表情解析函数 -->
            <div class="comment-content" v-html="parseEmoji ? parseEmoji(reply.content) : reply.content"></div>
            <!-- 二级评论回复表单 -->
            <CommentForm
              v-if="reply.showForm"
              class="inline-reply-form"
              :comments="reply.replies"
              :hasParent="true"
              :parentId="reply.id"
              :replyTo="reply.username"
              :blogId="comment.blogId"
              @updateComments="handleUpdate">
            </CommentForm>
          </div>
        </div>
        <!-- 递归显示更深层级回复 - 修改事件处理器 -->
        <CommentReply 
          v-if="reply.replies && reply.replies.length > 0" 
          :comment="reply"
          :parseEmoji="parseEmoji"
          @replyUpdate="handleUpdate">  <!-- 使用统一的处理函数 -->
        </CommentReply>
    </article>
</div>
</template>

<style lang="scss" scoped>
.comment-replies {
    --parent-avatar-size: 36px;
    --reply-indent: 23px;
    position: relative;
    margin: 0 0 0 calc(var(--parent-avatar-size) / 2);
    padding-top: 28px;
    padding-left: var(--reply-indent);
    border-left: 2px solid var(--reply-border);
    transition: border-color 160ms ease;

    &.comment-replies--root {
      --parent-avatar-size: 40px;
    }

    .comment-reply {
        & + .comment-reply {
          margin-top: 36px;
        }

        .comment-node {
          display: flex;
          position: relative;
          align-items: flex-start;
          gap: 11px;
        }

        .comment-avatar-rail {
          position: relative;
          align-self: stretch;
          flex: 0 0 36px;
          min-height: 36px;
        }

        .comment-avatar {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border-color);
          border-radius: 7px;
          background: var(--primary-soft);
        }

        .comment-body {
          min-width: 0;
          flex: 1;
        }

        .comment-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 5px;
          min-height: 23px;
          font-size: 0.8rem;

          .comment-author {
            display: flex;
            min-width: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
            line-height: 1;
          }

          .comment-name {
            color: var(--light-dark);
            font-size: 0.98rem;
            font-weight: 400;
            line-height: 1.05;
            text-decoration: none;

          }

          .comment-name--link {
            color: color-mix(in srgb, var(--skyblue) 70%, #1155cc 30%);
          }

          .comment-details {
            display: flex;
            flex-wrap: wrap;
            gap: 0 6px;
            color: var(--light-dark);
            font-size: 0.9rem;
            font-weight: 400;
            line-height: 1.05;

            .comment-detail-item {
              display: inline-flex;
              align-items: center;
              gap: 4px;
            }

            .comment-detail-item + .comment-detail-item::before {
              content: '·';
              margin-right: 6px;
            }
          }

          .reply-btn {
            margin-left: auto;
            padding: 4px 9px;
            border: 0;
            border-radius: 4px;
            color: var(--light-dark);
            background: transparent;
            font-family: var(--comment-font, sans-serif);
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            transition: color 160ms ease, background-color 160ms ease;

            &:hover {
              background: var(--primary-soft-hover);
            }
          }
        }

        /* 添加表情图片样式 */
        :deep(.comment-emoji) {
          display: inline-block;
          vertical-align: middle;
          width: 24px;
          height: 24px;
          margin: 0 2px;
        }

        /* 评论内容样式 */
        .comment-content {
          margin-top: 0;
          color: var(--light-dark);
          font-size: 0.98rem;
          font-weight: 400;
          line-height: 1.45;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .inline-reply-form {
          margin-top: 8px;
        }
    }

    @media (max-width: 640px) {
      --reply-indent: 16px;
    }
}
</style>
