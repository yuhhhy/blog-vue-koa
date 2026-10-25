<script setup>
import { computed, ref, onMounted, reactive } from 'vue'
import { apiGetUserList, apiDeleteUser, apiUpdateUser } from '@/api/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminDialog from '@/components/admin/AdminDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminListSort from '@/components/admin/AdminListSort.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'

const tableData = ref([])
const loading = ref(false)
const dialogFormVisible = ref(false)
const sortBy = ref('name-asc')
const sortOptions = [
  { label: '用户名 A–Z', value: 'name-asc' },
  { label: '用户名 Z–A', value: 'name-desc' },
  { label: '管理员优先', value: 'admin-first' }
]
const rowActions = [
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除', danger: true }
]
const formErrors = reactive({ username: '', password: '', email: '' })
const form = reactive({
  userId: '',
  username: '',
  password: '',
  email: ''
})

const sortedUsers = computed(() => {
  const users = [...tableData.value]
  if (sortBy.value === 'name-desc') return users.sort((a, b) => b.username.localeCompare(a.username, 'zh-CN'))
  if (sortBy.value === 'admin-first') return users.sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin'))
  return users.sort((a, b) => a.username.localeCompare(b.username, 'zh-CN'))
})

const fetchUsers = async () => {
  loading.value = true
  try {
    tableData.value = await apiGetUserList()
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

function handleDelete(row) {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(
    async () => {
      await apiDeleteUser(row.userId)
      const index = tableData.value.findIndex(item => item.userId === row.userId)
      if (index >= 0) tableData.value.splice(index, 1)
      ElMessage.success('用户已删除')
    }
  ).catch(() => {
  })
}

function handleEdit(row) {
  Object.keys(formErrors).forEach(key => { formErrors[key] = '' })
  dialogFormVisible.value = true
  form.userId = row.userId
  form.username = row.username
  form.password = row.password
  form.email = row.email
}

function handleConfirm() {
  formErrors.username = form.username.trim() ? '' : '请输入用户名'
  formErrors.password = form.password ? '' : '请输入密码'
  formErrors.email = form.email.trim() ? '' : '请输入邮箱地址'
  if (Object.values(formErrors).some(Boolean)) return
  apiUpdateUser(form).then(() => {
    ElMessage.success('用户信息已更新')
    fetchUsers()
  }).catch((err) => {
    console.error(err)
  })
  dialogFormVisible.value = false
}

const handleRowAction = (action, row) => {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') handleDelete(row)
}

</script>

<template>
  <AdminPage>
    <AdminCard title="用户列表">
      <div class="list-toolbar">
        <span>{{ sortedUsers.length }} 个用户</span>
        <AdminListSort v-model="sortBy" :options="sortOptions" />
      </div>
      <AdminList :items="sortedUsers" item-key="userId" :loading="loading" empty-text="暂无用户">
        <template #item="{ item }">
          <AdminListItem :headline="item.username" :supporting-text="item.email">
            <template #overline><AdminListLabel :tone="item.role === 'admin' ? 'success' : 'info'">{{ item.role === 'admin' ? '管理员' : '普通用户' }}</AdminListLabel></template>
            <template #trailing><span>ID<br>{{ item.userId }}</span></template>
            <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
          </AdminListItem>
        </template>
      </AdminList>
    </AdminCard>
  </AdminPage>

  <AdminDialog v-model="dialogFormVisible" title="更改用户信息" max-width="520">
    <div class="user-edit-form">
      <MaterialTextField v-model="form.username" label="用户名" required :error-message="formErrors.username" @update:model-value="formErrors.username = ''" />
      <MaterialTextField v-model="form.password" label="密码" type="password" revealable required :clearable="false" :error-message="formErrors.password" @update:model-value="formErrors.password = ''" />
      <MaterialTextField v-model="form.email" label="邮箱" type="email" required :error-message="formErrors.email" @update:model-value="formErrors.email = ''" />
    </div>
    <template #actions>
      <AdminButton variant="text" @click="dialogFormVisible = false">取消</AdminButton>
      <AdminButton variant="text" @click="handleConfirm">确认</AdminButton>
    </template>
  </AdminDialog>
</template>

<style scoped>
.list-toolbar { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.user-edit-form { display: grid; gap: 16px; }
@media (max-width: 760px) { .list-toolbar { align-items: flex-start; flex-direction: column; } }
</style>
