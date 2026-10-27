<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { mdiOpenInNew } from '@mdi/js'
import { apiGetVisitorList, apiDeleteVisitor } from '@/api/visitor.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminPage from '@/components/admin/AdminPage.vue'

const loading = ref(false)
const visitorList = ref([])
const total = ref(0)
const readOnly = ref(false)
const queryParams = ref({
  page: 1,
  limit: 10
})
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / queryParams.value.limit)))
const rowActions = [{ key: 'delete', label: '删除', danger: true }]
const analyticsUrl = import.meta.env.VITE_ANALYTICS_ADMIN_URL

onMounted(() => {
    getList()
})

const getList = async () => {
  loading.value = true
  try {
    const res = await apiGetVisitorList(queryParams.value)
    visitorList.value = res.visitors
    total.value = res.total || 0
    readOnly.value = res.readOnly === true
    if (queryParams.value.page > pageCount.value) {
      queryParams.value.page = pageCount.value
      await getList()
      return
    }
    visitorList.value.forEach((item) => {
      item.visitTime = new Date(item.visitTime).toLocaleString()
    })
    
  } catch (error) {
    console.error('获取访客列表失败:', error)
  } finally {
    loading.value = false
  }
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
    if (visitorList.value.length === 1 && queryParams.value.page > 1) {
      queryParams.value.page -= 1
    }
    await getList()
    ElMessage.success(res.message)
  } catch (error) {
    
  }
}

const handleRowAction = (action, row) => {
  if (action === 'delete') handleDelete(row)
}

const openAnalytics = () => {
  if (import.meta.env.DEV) {
    ElMessage.info('开发环境未启用流量分析')
    return
  }
  if (!analyticsUrl) {
    ElMessage.warning('尚未配置流量分析后台地址')
    return
  }
  window.open(analyticsUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <AdminPage>
    <template #actions>
      <AdminButton tone="primary" :icon="mdiOpenInNew" @click="openAnalytics">打开流量分析</AdminButton>
    </template>
    <AdminCard title="访客记录">
      <div class="list-count">共 {{ total }} 条记录</div>
      <AdminList
        :items="visitorList"
        item-key="_id"
        :loading="loading"
        :page="queryParams.page"
        :total="total"
        empty-text="暂无访客记录"
        @update:page="handleCurrentChange"
      >
        <template #item="{ item }">
          <AdminListItem :headline="item.address || item.ip || '未知来源'">
            <template #overline>
              <AdminListLabel :tone="item.role === 'admin' ? 'success' : 'info'">{{ item.role || '访客' }}</AdminListLabel>
              <AdminListLabel>{{ item.page || '未知页面' }}</AdminListLabel>
            </template>
            <template #supporting><span>{{ item.ip || '未知 IP' }} · {{ item.browser || '未知设备' }}</span></template>
            <template #trailing><span>{{ item.visitTime }}<br>访问 {{ item.viewNum || 0 }} 次</span></template>
            <template v-if="!readOnly" #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
          </AdminListItem>
        </template>
      </AdminList>
    </AdminCard>
  </AdminPage>
</template>

<style scoped>
.list-count { margin: 0 0 8px 4px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
</style>
