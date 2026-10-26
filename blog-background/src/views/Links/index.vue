<script setup>
import { computed, ref, onMounted, reactive } from 'vue'
import { mdiPlus } from '@mdi/js'
import { getLinks, createLink, updateLink, deleteLink } from '@/api/links.js'
import { getTimestampToSeconds } from '@/utils/date.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminDialog from '@/components/admin/AdminDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListSort from '@/components/admin/AdminListSort.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'

const tableData = ref([])
const loading = ref(true)
const dialogFormVisible = ref(false)
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)
const snackbar = reactive({ visible: false, text: '', color: 'primary' })
const formErrors = reactive({ name: '', description: '', site: '', avatar: '' })
const sortBy = ref('recent')
const sortOptions = [
  { label: '最近添加', value: 'recent' },
  { label: '名称 A–Z', value: 'name-asc' },
  { label: '名称 Z–A', value: 'name-desc' }
]
const rowActions = [
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除', danger: true }
]
const form = reactive({
  id: '',
  name: '',
  description: '',
  site: '',
  avatar: ''
})
const sortedLinks = computed(() => {
  const links = [...tableData.value]

  if (sortBy.value === 'name-asc') return links.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  if (sortBy.value === 'name-desc') return links.sort((a, b) => b.name.localeCompare(a.name, 'zh-CN'))
  return links.sort((a, b) => Number(b.id) - Number(a.id))
})

onMounted(() => {
    getLinksList()
})

async function getLinksList() {
  loading.value = true
  try {
    tableData.value = await getLinks()
  } finally {
    loading.value = false
  }
}

function handleDelete(row) {
  pendingDelete.value = row
  deleteDialogVisible.value = true
}

async function confirmDelete() {
  const target = pendingDelete.value
  if (!target) return
  await deleteLink(target.id)
  const index = tableData.value.findIndex(item => item.id === target.id)
  if (index >= 0) tableData.value.splice(index, 1)
  deleteDialogVisible.value = false
  pendingDelete.value = null
  showMessage('友链已删除', 'success')
}

function showMessage(text, color = 'primary') {
  snackbar.text = text
  snackbar.color = color
  snackbar.visible = true
}

function handleRowAction(action, row) {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') handleDelete(row)
}

function handleEdit(row) {
  clearFormErrors()
  dialogFormVisible.value = true
  form.id = row.id
  form.name = row.name
  form.description = row.description
  form.site = row.site
  form.avatar = row.avatar
}

function handleAddLink() {
  clearFormErrors()
  dialogFormVisible.value = true
  form.id = ''
  form.name = ''
  form.description = ''
  form.site = ''
  form.avatar = ''
}

function clearFormErrors() {
  Object.keys(formErrors).forEach(key => { formErrors[key] = '' })
}

async function handleConfirm() {
  formErrors.name = form.name.trim() ? '' : '请输入友链名称'
  formErrors.description = form.description.trim() ? '' : '请输入友链描述'
  formErrors.site = form.site.trim() ? '' : '请输入友链网址'
  formErrors.avatar = form.avatar.trim() ? '' : '请输入头像地址'
  if (Object.values(formErrors).some(Boolean)) return

  try {
    if (form.id) {
      await updateLink(form)
    } else {
      const now = new Date()
      const newId = getTimestampToSeconds(now)
      form.id = newId
      await createLink(form)
    }
    
    showMessage(form.id ? '友链已更新' : '友链已添加', 'success')
    dialogFormVisible.value = false
    getLinksList()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <AdminPage>
    <AdminCard title="友链列表">
      <div class="list-toolbar">
        <span>{{ sortedLinks.length }} 个友链</span>
        <div class="list-toolbar__actions">
          <AdminButton tone="primary" :icon="mdiPlus" @click="handleAddLink">新增友链</AdminButton>
          <AdminListSort v-model="sortBy" :options="sortOptions" />
        </div>
      </div>
      <AdminList :items="sortedLinks" item-key="id" :loading="loading" empty-text="暂无友链">
        <template #item="{ item }">
          <AdminListItem :headline="item.name" :supporting-text="item.description">
            <template #leading>
              <v-avatar :image="item.avatar" size="56" rounded="lg" />
            </template>
            <template #supporting>
              <span>{{ item.description }}</span>
              <a class="link-address" :href="item.site" target="_blank" rel="noreferrer">{{ item.site }}</a>
            </template>
            <template #actions>
              <AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" />
            </template>
          </AdminListItem>
        </template>
      </AdminList>
    </AdminCard>
  </AdminPage>

  <AdminDialog v-model="dialogFormVisible" :title="form.id ? '编辑友链' : '新增友链'" description="填写友链展示信息和访问地址" max-width="560">
    <MaterialTextField v-model="form.name" label="名称" required :error-message="formErrors.name" @update:model-value="formErrors.name = ''" />
    <MaterialTextField v-model="form.description" label="描述" required :error-message="formErrors.description" @update:model-value="formErrors.description = ''" />
    <MaterialTextField v-model="form.site" label="网址" required :error-message="formErrors.site" @update:model-value="formErrors.site = ''" />
    <MaterialTextField v-model="form.avatar" label="头像地址" required :error-message="formErrors.avatar" @update:model-value="formErrors.avatar = ''" />
    <template #actions>
      <AdminButton variant="text" @click="dialogFormVisible = false">取消</AdminButton>
      <AdminButton tone="primary" @click="handleConfirm">{{ form.id ? '保存更改' : '添加友链' }}</AdminButton>
    </template>
  </AdminDialog>

  <AdminConfirmDialog
    v-model="deleteDialogVisible"
    title="删除友链"
    :message="`确定删除“${pendingDelete?.name || ''}”吗？此操作无法撤销。`"
    confirm-text="删除"
    danger
    @confirm="confirmDelete"
  />

  <v-snackbar v-model="snackbar.visible" :color="snackbar.color" rounded="lg" location="top right">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<style scoped>
.list-toolbar {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 13px;
}

.list-toolbar__actions { display: flex; align-items: center; gap: 8px; }

.link-address {
  display: block;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  color: var(--md-sys-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-address:hover { text-decoration: underline; }

@media (max-width: 760px) {
  .list-toolbar { align-items: flex-start; flex-direction: column; }
  .list-toolbar__actions { width: 100%; flex-wrap: wrap; }
}
</style>
