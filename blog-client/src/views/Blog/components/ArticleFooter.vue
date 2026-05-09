<script setup>
import { ElButton } from 'element-plus'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFormatDate } from '@/utils/date'
import { apiGetComments } from '@/api/comment'
import CommentForm from './CommentForm.vue'
import CommentReply from './CommentReply.vue'
import DOMPurify from 'dompurify' // 用于安全处理HTML内容

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
watch(() => route.params.id, (newId) => {
  if (newId) {
    getComments(0)
  }
}, { immediate: true })

onMounted(() => {
  getComments(0) // 初次加载不需要延迟
})
</script>

<template>
<div class="article-footer">
  <!-- 一级评论列表 -->
  <div class="comment-list">
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <!-- 一级评论头部信息 -->
      <div class="comment-header">
        <el-avatar :src="comment.avatar" :size="48" />
        <div class="comment-info">
          <span v-if="comment.website">
            <a :href="comment.website" target="_blank" class="comment-name">
              {{ comment.username }}
            </a>
          </span>
          <span v-else class="comment-name">
            {{ comment.username }}
          </span>
          <span class="comment-sep">·</span>
          <span class="comment-time">{{ getFormatDate(comment.createTime) }}</span>
        </div>
      </div>
      <!-- 一级评论内容 -->
      <div class="comment-content" v-html="parseComment(comment.content)"></div>
      <!-- 回复按钮 -->
      <div class="comment-footer">
        <el-button link type="primary" class="reply-btn" @click="toggleReplyForm(comment)">
          回复
        </el-button>
      </div>
      <!-- 一级评论回复表单 -->
      <CommentForm 
        v-if="comment.showForm" 
        :comments="comment.replies" 
        :hasParent="true" 
        :parentId="comment.id"
        :blogId="route.params.id || props.pageId"
        @updateComments="updateComments">
      </CommentForm>
      <!-- 非一级评论组件 -->
      <CommentReply 
        :comment="comment"
        :parseEmoji="parseComment"
        @replyUpdate="replyUpdate">
      </CommentReply>
    </div>
  </div>
  <!-- 底部评论表单 -->
  <span class="top-form" v-if="formState" @click="toggleCommentForm">收起</span>
  <span class="top-form" v-else @click="toggleCommentForm">发表评论</span>
  <!-- parentId = '-1' 表示没有 parent 评论 -->
  <CommentForm
    v-show="formState"
    :comments="comments"
    :hasParent="false"
    :parentId="'-1'"
    :blogId="route.params.id || props.pageId"
    @updateComments="updateComments">
  </CommentForm>
</div>
</template>

<style lang="scss">
.article-footer {
  font-family: var(--font-serif);
  color: var(--light-dark);
  line-height: 1.6;
  padding: 0 30px 10px 30px;
  
  .top-form {
    color: var(--blue);
    cursor: pointer;
  }

  /* 评论列表样式 */
  .comment-list {
    .comment-item {
      padding: 15px 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      a {
        color: var(--skyblue);
      }
      
      .comment-header {
        display: flex;
        gap: 15px;
        
        .el-avatar {
          width: 48px;
          height: 48px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
        }
        
        .comment-info {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          padding-top: 5px;

          a.comment-name{
            &:hover {
              text-decoration: underline;
            }
          }

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
        margin: 5px 0 0 63px;
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

      .comment-content {
        margin: 10px 0 10px 63px;
        line-height: 1.6;
        word-break: break-word;

        a {
          &:hover {
            text-decoration: underline;
            &::after {
              content: '（这是个外链哟）';
              color: var(--skyblue);
            }
          }
        }
        .comment-emoji {
          display: inline-block;
          vertical-align: middle;
          width: 24px;
          height: 24px;
          margin: 0 2px;
        }
      }
    }
  }
}
@media screen and (max-width: 768px) {
  .article-footer {
    padding: 0 15px 10px 15px;
  }
}
</style>
