<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetPendingComments, apiReviewComment, apiDeleteComment } from '@/api/comment.js'
import { getFormatDateToMinutes } from '@/utils/date.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminDialog from '@/components/admin/AdminDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminPage from '@/components/admin/AdminPage.vue'

const pendingComments = ref([])
const rowActions = [{ key: 'details', label: '查看并审核' }]

onMounted(() => {
    getPendingComments()
})

async function getPendingComments() {
    try {
        const response = await apiGetPendingComments()
        pendingComments.value = response
    } catch (error) {
        ElMessage.error('获取待审核评论失败')
    }
}

/**
 * 评论审核相关
 */
// 控制审核弹框
const reviewDialogVisible = ref(false)
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
    getPendingComments()
}
// 审核不通过
async function reviewNotPassed() {
    await apiReviewComment(currentReview.value.id, false)
    reviewDialogVisible.value = false
    ElMessage.warning('评论审核不通过')
    getPendingComments()
}
// 删除评论
async function deleteComment() {
    await apiDeleteComment(currentReview.value.id)
    reviewDialogVisible.value = false
    ElMessage.success('评论已删除')
    getPendingComments()
}
</script>

<template>
    <AdminPage>
        <AdminCard title="待审评论">
            <div class="list-count">{{ pendingComments.length }} 条待审核评论</div>
            <AdminList :items="pendingComments" item-key="id" empty-text="暂无待审核评论">
                <template #item="{ item }">
                    <AdminListItem :headline="item.username" :supporting-text="item.content">
                        <template #leading><v-avatar :image="item.avatar" size="56" rounded="lg" /></template>
                        <template #overline><AdminListLabel tone="warning">待审核</AdminListLabel></template>
                        <template #supporting><span>{{ item.content }}</span><span class="comment-email">{{ item.email }}</span></template>
                        <template #trailing>{{ getFormatDateToMinutes(item.createTime) }}</template>
                        <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
                    </AdminListItem>
                </template>
            </AdminList>
        </AdminCard>
    </AdminPage>

    <AdminDialog v-model="reviewDialogVisible" title="评论审核" max-width="600">
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
</template>

<style scoped>
.list-count { margin: 0 0 8px 4px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.comment-email { display: block; color: var(--md-sys-color-primary); }
.review-meta, .review-time { color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.review-content { margin: 4px 0; color: var(--md-sys-color-on-surface); line-height: 1.7; white-space: pre-wrap; }
</style>
