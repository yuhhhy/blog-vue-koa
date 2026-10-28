<script setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFormatDateTimeToMinute } from '@/utils/date'
import { apiGetComments } from '@/api/comment'
import CommentReply from './CommentReply.vue'
import CommentEnvironmentIcon from './CommentEnvironmentIcon.vue'
import DOMPurify from 'dompurify' // 用于安全处理HTML内容

const CommentForm = defineAsyncComponent(() => import('./CommentForm.vue'))

// 导入表情包图片
const biliEmojisFiles = import.meta.glob('/src/assets/images/bili-emojis/*.png', { eager: true })

// 创建表情名称到路径的映射
const emojiMap = {}
Object.keys(biliEmojisFiles).forEach(path => {
  const fileName = path.split('/').pop().replace('.png', '')
  emojiMap[fileName] = biliEmojisFiles[path].default || path
})

// 解析评论内容中的表情标记
function parseComment(content) {
  if (!content) return ''

  // 将换行符转换为<br>标签
  let processedContent = content.replace(/\n/g, '<br>')

  // 使用DOMPurify清理HTML，以防止XSS攻击
  let safeContent = DOMPurify.sanitize(processedContent, {
    ALLOWED_TAGS: ['img', 'a', 'div', 'b', 'i', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br'],
    ALLOWED_ATTR: ['style', 'src', 'href', 'alt', 'target']
  })
  
  // 替换表情标记为HTML图片标签
  return safeContent.replace(/\[表情:(.*?)\]/g, (match, name) => {
    const emojiPath = emojiMap[name]
    return emojiPath ? 
      `<img class="comment-emoji" src="${emojiPath}" alt="${name}" />` : 
      match
  })
}

const route = useRoute()
const comments = ref([])
const formState = ref(false) // 用于控制评论表单的显示与隐藏
const props = defineProps({
  pageId: { type: String }
})

// 显示/隐藏顶部评论表单
const toggleCommentForm = () => {
  formState.value = !formState.value
}

// 显示/隐藏回复表单
const toggleReplyForm = (comment) => {
  comment.showForm = !comment.showForm
}

const commentCount = computed(() => {
  const countComments = (items = []) => items.reduce((total, item) => (
    total + 1 + countComments(item.replies || [])
  ), 0)

  return countComments(comments.value)
})

// 获取评论，添加延迟参数
const getComments = (delay = 0) => {
  setTimeout(() => {
    apiGetComments(route.params.id || props.pageId).then(res => {
      comments.value = res
    })
  }, delay)
}

// 自定义updateComments事件回调
const updateComments = () => {
  getComments(500) // 延迟500毫秒获取评论
}

// 自定义replyUpdate事件回调
const replyUpdate = () => {
  getComments(500) // 延迟500毫秒获取评论
}

// 组件加载时获取评论 - 不需要延迟
watch(() => route.params.id || props.pageId, (pageId) => {
  if (pageId) {
    getComments(0)
  }
}, { immediate: true })
</script>

<template>
<div class="article-footer">
  <div class="comment-toolbar">
    <strong>{{ commentCount }} 条评论</strong>
    <button type="button" class="comment-compose-toggle" @click="toggleCommentForm">
      {{ formState ? '收起评论框' : '发表评论' }}
    </button>
  </div>

  <!-- parentId = '-1' 表示没有 parent 评论 -->
  <CommentForm
    v-if="formState"
    class="comment-composer"
    :comments="comments"
    :hasParent="false"
    :parentId="'-1'"
    :blogId="route.params.id || props.pageId"
    @updateComments="updateComments">
  </CommentForm>

  <!-- 一级评论列表 -->
  <div class="comment-list">
    <article v-for="comment in comments" :key="comment.id" class="comment-item">
      <div class="comment-node">
        <div class="comment-avatar-rail">
          <el-avatar :src="comment.avatar" :size="40" shape="square" class="comment-avatar" />
        </div>
        <div class="comment-body">
          <!-- 一级评论头部信息 -->
          <div class="comment-header">
            <div class="comment-author">
              <a v-if="comment.website" :href="comment.website" target="_blank" rel="noopener noreferrer" class="comment-name comment-name--link">
                {{ comment.username }}
              </a>
              <span v-else class="comment-name">
                {{ comment.username }}
              </span>
              <div class="comment-details">
                <span v-if="comment.browser" class="comment-detail-item">
                  <CommentEnvironmentIcon kind="browser" :value="comment.browser" />
                  {{ comment.browser }}
                </span>
                <span v-if="comment.os" class="comment-detail-item">
                  <CommentEnvironmentIcon kind="os" :value="comment.os" />
                  {{ comment.os }}
                </span>
                <time class="comment-detail-item">
                  <CommentEnvironmentIcon kind="time" :value="comment.createTime" :timezone="comment.timezone" />
                  {{ getFormatDateTimeToMinute(comment.createTime, comment.timezone) }}
                </time>
              </div>
            </div>
            <button
              type="button"
              class="reply-btn"
              :aria-expanded="Boolean(comment.showForm)"
              @click="toggleReplyForm(comment)"
            >
              {{ comment.showForm ? '取消回复' : '回复' }}
            </button>
          </div>
          <!-- 一级评论内容 -->
          <div class="comment-content" v-html="parseComment(comment.content)"></div>
          <!-- 一级评论回复表单 -->
          <CommentForm
            v-if="comment.showForm"
            class="inline-reply-form"
            :comments="comment.replies"
            :hasParent="true"
            :parentId="comment.id"
            :replyTo="comment.username"
            :blogId="route.params.id || props.pageId"
            @updateComments="updateComments">
          </CommentForm>
        </div>
      </div>
      <!-- 非一级评论组件 -->
      <CommentReply 
        :isRoot="true"
        :comment="comment"
        :parseEmoji="parseComment"
        @replyUpdate="replyUpdate">
      </CommentReply>
    </article>
  </div>
</div>
</template>

<style lang="scss">
.article-footer {
  --comment-font: var(--font-system-sans);
  font-family: var(--comment-font);
  color: var(--light-dark);
  line-height: 1.5;
  padding: 8px 0 24px;

  .comment-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 0 14px;
    border-bottom: 1px solid var(--border-color);

    strong {
      color: var(--dark);
      font-size: 1rem;
      font-weight: 700;
    }
  }

  .comment-compose-toggle,
  .reply-btn {
    appearance: none;
    border: 0;
    background: transparent;
    font-family: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: color 160ms ease, background-color 160ms ease;
  }

  .comment-compose-toggle {
    padding: 4px 9px;
    border-radius: 4px;
    color: #343536;
    background: transparent;
    font-size: 0.75rem;

    &:hover {
      background: #d7d9da;
    }
  }

  .comment-composer {
    margin: 16px 0 8px;
  }

  /* 评论列表样式 */
  .comment-list {
    margin-top: 6px;

    .comment-item {
      padding: 18px 0 0;

      & + .comment-item {
        margin-top: 32px;
      }

      a {
        color: var(--skyblue);
      }

      .comment-node {
        display: flex;
        position: relative;
        align-items: flex-start;
        gap: 12px;
      }

      .comment-avatar-rail {
        position: relative;
        align-self: stretch;
        flex: 0 0 40px;
        min-height: 40px;
      }

      .comment-avatar {
        position: relative;
        z-index: 2;
        width: 40px;
        height: 40px;
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
        min-height: 25px;
        font-size: 0.82rem;

        .comment-author {
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .comment-name {
          color: var(--light-dark);
          font-size: 1rem;
          font-weight: 400;
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
          line-height: 1.3;

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
          border-radius: 4px;
          color: #343536;
          background: transparent;
          font-size: 0.75rem;

          &:hover {
            background: #d7d9da;
          }
        }
      }

      .comment-content {
        margin-top: 4px;
        color: var(--light-dark);
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.6;
        overflow-wrap: anywhere;
        word-break: break-word;

        .comment-emoji {
          display: inline-block;
          vertical-align: middle;
          width: 24px;
          height: 24px;
          margin: 0 2px;
        }
      }

      .inline-reply-form {
        margin-top: 8px;
      }
    }
  }

  @media (max-width: 640px) {
    .comment-toolbar {
      align-items: center;
    }

    .comment-list .comment-item {
      padding-top: 15px;

      & + .comment-item {
        margin-top: 26px;
      }
    }
  }
}

</style>
