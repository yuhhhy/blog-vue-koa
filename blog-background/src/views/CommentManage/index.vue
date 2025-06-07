<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetAllComments, apiReviewComment, apiDeleteComment } from '@/api/comment.js'
import { getFormatDateToMinutes } from '@/utils/date.js'

const comments = ref([])

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
// 赋予评论行className
function tableRowClassName({ row }) {
  return `row-${row.id}`
}

// 获取父级评论内容
function getParentContent(parentId) {
  const parentComment = comments.value.find(comment => comment.id === parentId)
  return `${parentComment.username}：${parentComment.content}`
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
  const replyComments = replies.map(id => commentMap.get(id))

  currentReplies.value = replyComments
  replyDialogVisible.value = true
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
  await apiDeleteComment(currentReview.value.id)
  reviewDialogVisible.value = false
  ElMessage.success('评论已删除')
  getComments()
}
</script>

<template>
  <el-table :data="comments" row-key="id" :row-class-name="tableRowClassName">
    <!-- 头像 -->
    <el-table-column label="头像" width="100">
      <template #default="scope">
        <img
          :src="scope.row.avatar"
          alt="avatar"
          style="width:40px;height:40px;border-radius:50%;object-fit:cover"
        />
      </template>
    </el-table-column>
    <!-- 昵称 -->
    <el-table-column width="150" prop="username">
      <template #header>
        <div class="text-blue-400">昵称</div>
      </template>
    </el-table-column>
    <!-- 邮箱 -->
    <el-table-column width="180" prop="email" label="邮箱">
    </el-table-column>
    <!-- 评论内容 -->
    <el-table-column prop="content" label="评论内容">
    </el-table-column>
    <!-- 评论时间 -->
    <el-table-column label="评论时间" width="150">
      <template #default="scope">
        {{ getFormatDateToMinutes(scope.row.createTime) }}
      </template>
    </el-table-column>
    <!-- 父级评论 -->
    <el-table-column width="80">
      <template #header>
        <div class="text-center">父级评论</div>
      </template>
      <template #default="scope">
        <!-- 有父级评论 -->
        <div v-if="scope.row.hasParent" class="text-center">
          <el-tooltip :content="getParentContent(scope.row.parentId)" placement="top">
            <a
              href="javascript:void(0)"
              @click="scrollToParent(scope.row.parentId)"
              class="text-blue-500"
            >
              查看
            </a>
          </el-tooltip>
        </div>
        <!-- 没有父级评论 -->
        <div v-else class="text-center">
        /
        </div>
      </template>
    </el-table-column>
    <!-- 评论回复 -->
    <el-table-column width="100">
      <template #header>
        <div class="text-center">评论回复</div>
      </template>
      <template #default="scope">
        <div v-if="scope.row.replies && scope.row.replies.length > 0" class="text-center">
          <a
              href="javascript:void(0)"
              @click="showReplies(scope.row.replies)"
              class="text-blue-500"
            >
              查看
            </a>
        </div>
        <div v-else class="text-center">
          /
        </div>
      </template>
    </el-table-column>
    <!-- 评论状态 -->
    <el-table-column width="80" label="评论状态">
      <template #default="scope">
        <!-- 未审核的评论在client端是默认展示的 -->
        <el-tag
          :type="scope.row.reviewed === true ? 'success' : 'warning'"
          disable-transitions
          >{{ scope.row.reviewed === true ? '已审' : '待审' }}</el-tag
        >
        <!-- 对于已经审核的评论，才展示是否通过 -->
        <el-tag v-if="scope.row.reviewed === true"
          :type="scope.row.reviewPassed === true ? 'success' : 'danger'"
          disable-transitions
          class="mt-2"
          >{{ scope.row.reviewPassed === true ? '通过' : '未通过' }}</el-tag
        >
      </template>
    </el-table-column>
    <!-- 评论操作按钮 -->
    <el-table-column fixed="right" label="评论管理" width="80">
      <template #default="scope">
        <el-button type="primary" size="small" @click="handleManage(scope.$index, scope.row)">
          管理
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 评论回复弹窗 -->
  <el-dialog
    v-model="replyDialogVisible"
    title="评论回复"
    width="50%">
    <div v-for="(reply, index) in currentReplies" :key="index" class="mb-3">
      <p><strong>{{ reply.username }}:</strong> {{ reply.content }}</p>
      <p>{{ getFormatDateToMinutes(reply.createTime) }}</p>
      <el-divider></el-divider>
    </div>
    <template #footer>
      <el-button @click="replyDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

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

<style scoped>
</style>

<style>
/* 用于高亮显示父级评论 */
.el-table .highlight {
  transition: 0.5s ease;
  --el-table-tr-bg-color: #fffae6;
}
</style>