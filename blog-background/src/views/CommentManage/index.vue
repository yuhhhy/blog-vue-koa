<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetAllComments, apiReviewComment, apiDeleteComment } from '@/api/comment.js'
import { getFormatDateToMinutes } from '@/utils/date.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminDialog from '@/components/admin/AdminDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminPage from '@/components/admin/AdminPage.vue'

const comments = ref([])
const rowActions = [{ key: 'details', label: '查看并管理' }]

onMounted(() => {
  getComments()
})

async function getComments() {
  const allComments = await apiGetAllComments()
  comments.value = allComments
}

/**
 * 父级评论相关函数
 */
// 获取父级评论内容
function getParentContent(parentId) {
  const parentComment = comments.value.find(comment => comment.id === parentId)
  return parentComment
    ? `${parentComment.username}：${parentComment.content}`
    : '父级评论不存在或未加载'
}

// 滚动到父级评论所在整行并高亮显示
function scrollToParent(parentId) {
  const parentRow = document.querySelector(`.row-${parentId}`)
  if (parentRow) {
    parentRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
    parentRow.classList.add('highlight')
    // 3秒后移除高亮
    setTimeout(() => {
      parentRow.classList.remove('highlight')
    }, 3000)
  } else {
    ElMessage.warning('父级评论不存在或未加载')
  }
}

/**
 * 评论回复相关
 */
const replyDialogVisible = ref(false)    // 弹框显示控制变量
const currentReplies = ref([])             // 当前选中的回复数据

// 显示弹框查看回复
function showReplies(replies) {
  // 预先构建一个 Map，以 id 为 key
  const commentMap = new Map(comments.value.map(item => [item.id, item]))
  // 然后直接拿 map 获取对应的回复评论
  const replyComments = replies.map(id => commentMap.get(id)).filter(Boolean)

  currentReplies.value = replyComments
  replyDialogVisible.value = true
}

/**
 * 评论审核相关
 */
// 控制审核弹框
const reviewDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const currentReview = ref(null)
// 处理点击
function handleManage(row) {
  // 打开审核弹框，传入当前评论
  currentReview.value = row
  reviewDialogVisible.value = true
}
const handleRowAction = (action, row) => {
  if (action === 'details') handleManage(row)
}
// 通过审核
async function reviewPassed() {
  await apiReviewComment(currentReview.value.id, true)
  reviewDialogVisible.value = false
  ElMessage.success('评论审核通过')
  getComments()
}
// 审核不通过
async function reviewNotPassed() {
  await apiReviewComment(currentReview.value.id, false)
  reviewDialogVisible.value = false
  ElMessage.warning('评论审核不通过')
  getComments()
}
// 删除评论
async function deleteComment() {
  reviewDialogVisible.value = false
  deleteDialogVisible.value = true
}
async function confirmDeleteComment() {
  await apiDeleteComment(currentReview.value.id)
  deleteDialogVisible.value = false
  ElMessage.success('评论已删除')
  getComments()
}
</script>

<template>
  <AdminPage>
    <AdminCard title="评论管理">
      <div class="list-count">{{ comments.length }} 条评论</div>
      <AdminList :items="comments" item-key="id" empty-text="暂无评论">
        <template #item="{ item }">
          <AdminListItem
            :class="['comment-list-item', `row-${item.id}`]"
            :headline="item.username"
            :supporting-text="item.content"
          >
            <template #leading><v-avatar :image="item.avatar" size="56" rounded="lg" /></template>
            <template #overline>
              <AdminListLabel :tone="item.reviewed ? 'success' : 'warning'">
                {{ item.reviewed ? '已审核' : '待审核' }}
              </AdminListLabel>
              <AdminListLabel
                v-if="item.reviewed"
                :tone="item.reviewPassed ? 'success' : 'danger'"
              >
                {{ item.reviewPassed ? '通过' : '未通过' }}
              </AdminListLabel>
            </template>
            <template #supporting>
              <span class="comment-content">{{ item.content }}</span>
              <span class="comment-email">{{ item.email }}</span>
              <span v-if="item.hasParent || item.replies?.length" class="comment-links">
                <el-tooltip v-if="item.hasParent" :content="getParentContent(item.parentId)" placement="top">
                  <button type="button" @click="scrollToParent(item.parentId)">定位父评论</button>
                </el-tooltip>
                <button v-if="item.replies?.length" type="button" @click="showReplies(item.replies)">
                  查看 {{ item.replies.length }} 条回复
                </button>
              </span>
            </template>
            <template #trailing>{{ getFormatDateToMinutes(item.createTime) }}</template>
            <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
          </AdminListItem>
        </template>
      </AdminList>
    </AdminCard>
  </AdminPage>

  <AdminDialog
    v-model="replyDialogVisible"
    title="评论回复"
    description="查看该评论下的全部回复"
    max-width="720"
  >
    <AdminList :items="currentReplies" item-key="id" empty-text="暂无回复">
      <template #item="{ item }">
        <AdminListItem :headline="item.username" :supporting-text="item.content">
          <template #leading><v-avatar :image="item.avatar" size="56" rounded="lg" /></template>
          <template #trailing>{{ getFormatDateToMinutes(item.createTime) }}</template>
        </AdminListItem>
      </template>
    </AdminList>
    <template #actions><AdminButton variant="text" @click="replyDialogVisible = false">关闭</AdminButton></template>
  </AdminDialog>

  <AdminDialog v-model="reviewDialogVisible" title="评论审核" description="查看评论内容并选择审核结果" max-width="600">
    <div v-if="currentReview">
      <div class="review-meta">{{ currentReview.username }} · {{ currentReview.email }}</div>
      <p class="review-content">{{ currentReview.content }}</p>
      <div class="review-time">{{ getFormatDateToMinutes(currentReview.createTime) }}</div>
    </div>
    <template #actions>
      <AdminButton variant="text" @click="reviewDialogVisible = false">关闭</AdminButton>
      <AdminButton variant="danger-text" @click="deleteComment">删除</AdminButton>
      <AdminButton variant="text" @click="reviewNotPassed">不通过</AdminButton>
      <AdminButton tone="primary" @click="reviewPassed">通过审核</AdminButton>
    </template>
  </AdminDialog>

  <AdminConfirmDialog
    v-model="deleteDialogVisible"
    title="删除评论"
    :message="`确定删除 ${currentReview?.username || ''} 的这条评论吗？此操作无法撤销。`"
    confirm-text="删除"
    danger
    @confirm="confirmDeleteComment"
  />
</template>

<style scoped>
.list-count { margin: 0 0 8px 4px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.comment-list-item { min-height: 128px; transition: background-color 300ms ease, box-shadow 300ms ease; }
.comment-list-item :deep(.admin-list-item__supporting) { display: block; overflow: visible; -webkit-line-clamp: unset; }
.comment-content, .comment-email, .comment-links { display: block; }
.comment-email { color: var(--md-sys-color-primary); }
.comment-links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2px; }
.comment-links button { padding: 0; border: 0; color: var(--md-sys-color-primary); background: transparent; cursor: pointer; font: inherit; font-weight: 650; }
.comment-list-item.highlight { background: var(--admin-warning-soft); box-shadow: inset 3px 0 var(--admin-warning); }
.review-meta, .review-time { color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.review-content { margin: 4px 0; color: var(--md-sys-color-on-surface); line-height: 1.7; white-space: pre-wrap; }
</style>
