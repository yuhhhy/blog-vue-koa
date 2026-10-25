<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetVisitorList, apiDeleteVisitor } from '@/api/visitor.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminPage from '@/components/admin/AdminPage.vue'

const loading = ref(false)
const visitorList = ref([])
const total = ref(0)
const queryParams = ref({
  page: 1,
  limit: 10
})
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / queryParams.value.limit)))
const rowActions = [{ key: 'delete', label: '删除', danger: true }]

onMounted(() => {
    getList()
})

const getList = async () => {
  loading.value = true
  try {
    const res = await apiGetVisitorList(queryParams.value)
    visitorList.value = res.visitors
    total.value = res.total || 0
    visitorList.value.forEach((item) => {
      item.visitTime = new Date(item.visitTime).toLocaleString()
    })
    
  } catch (error) {
    console.error('获取访客列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  queryParams.value.limit = val
  queryParams.value.page = 1
  getList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.value.page = val
  getList()
}

// 删除访客记录
const handleDelete = async (row) => {
  try {
    const res = await apiDeleteVisitor(row._id)
    getList()
    ElMessage.success(res.message)
  } catch (error) {
    
  }
}

const handleRowAction = (action, row) => {
  if (action === 'delete') handleDelete(row)
}
</script>

<template>
  <AdminPage>
    <AdminCard title="访客记录">
      <div class="list-count">共 {{ total }} 条记录</div>
      <AdminList :items="visitorList" item-key="_id" :loading="loading" empty-text="暂无访客记录">
        <template #item="{ item }">
          <AdminListItem :headline="item.address || item.ip || '未知来源'">
            <template #overline>
              <AdminListLabel :tone="item.role === 'admin' ? 'success' : 'info'">{{ item.role || '访客' }}</AdminListLabel>
              <AdminListLabel>{{ item.page || '未知页面' }}</AdminListLabel>
            </template>
            <template #supporting><span>{{ item.ip || '未知 IP' }} · {{ item.browser || '未知设备' }}</span></template>
            <template #trailing><span>{{ item.visitTime }}<br>访问 {{ item.viewNum || 0 }} 次</span></template>
            <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
          </AdminListItem>
        </template>
      </AdminList>
      <div class="visitor-pagination">
        <label class="page-size-control">每页
          <select :value="queryParams.limit" @change="handleSizeChange(Number($event.target.value))">
            <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">{{ size }}</option>
          </select>
        </label>
        <v-pagination :model-value="queryParams.page" :length="pageCount" rounded="circle" @update:model-value="handleCurrentChange" />
      </div>
    </AdminCard>
  </AdminPage>
</template>

<style scoped>
.list-count { margin: 0 0 8px 4px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.visitor-pagination { display: flex; align-items: center; justify-content: flex-end; gap: 16px; margin-top: 16px; }
.page-size-control { display: inline-flex; align-items: center; gap: 8px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.page-size-control select { height: 36px; padding: 0 28px 0 12px; border: 0; border-radius: var(--admin-radius); color: var(--admin-text); background: var(--admin-surface-muted); }
@media (max-width: 760px) {
  .visitor-pagination { align-items: stretch; flex-direction: column; }
  .visitor-pagination :deep(.v-pagination__list) { flex-wrap: wrap; justify-content: center; }
}
</style>
