<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetPendingComments, apiReviewComment, apiDeleteComment } from '@/api/comment.js'
import { getFormatDateToMinutes } from '@/utils/date.js'

const pendingComments = ref([])

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
function handleManage(index, row) {
    // 打开审核弹框，传入当前评论
    currentReview.value = row
    reviewDialogVisible.value = true
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
    <el-table :data="pendingComments" row-key="id" max-height="743px">
        <!-- 头像 -->
        <el-table-column label="头像" width="120">
            <template #default="scope">
                <img :src="scope.row.avatar" alt="avatar"
                    style="width:40px;height:40px;border-radius:50%;object-fit:cover" />
            </template>
        </el-table-column>
        <!-- 昵称 -->
        <el-table-column width="160" prop="username">
            <template #header>
                <div class="text-blue-400">昵称</div>
            </template>
        </el-table-column>
        <!-- 邮箱 -->
        <el-table-column width="220" prop="email" label="邮箱">
        </el-table-column>
        <!-- 评论内容 -->
        <el-table-column prop="content" label="评论内容">
        </el-table-column>
        <!-- 评论时间 -->
        <el-table-column label="评论时间" width="200">
            <template #default="scope">
                {{ getFormatDateToMinutes(scope.row.createTime) }}
            </template>
        </el-table-column>
        <!-- 评论状态 -->
        <el-table-column width="160" label="评论状态">
            <template #default="scope">
                <el-tag type="warning" disable-transitions>待审</el-tag>
            </template>
        </el-table-column>
        <!-- 评论操作按钮 -->
        <el-table-column fixed="right" label="评论管理" width="120">
            <template #default="scope">
                <el-button type="primary" size="small" @click="handleManage(scope.$index, scope.row)">
                    管理
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 评论审核弹框 -->
    <el-dialog v-model="reviewDialogVisible" title="评论审核" width="40%">
        <div v-if="currentReview">
            <p><strong>用户：</strong> {{ currentReview.username }}</p>
            <p><strong>邮箱：</strong> {{ currentReview.email }}</p>
            <p><strong>评论内容：</strong> {{ currentReview.content }}</p>
            <p><strong>评论时间：</strong> {{ getFormatDateToMinutes(currentReview.createTime) }}</p>
            <el-divider></el-divider>
            <div class="text-right">
                <el-button type="success" @click="reviewPassed">通过审核</el-button>
                <el-button type="warning" @click="reviewNotPassed">不通过</el-button>
                <el-button type="danger" @click="deleteComment">删除</el-button>
            </div>
        </div>
        <template #footer>
            <el-button @click="reviewDialogVisible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<style scoped></style>