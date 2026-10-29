<script setup>
import { computed, ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { mdiDragVertical, mdiPlus } from '@mdi/js'
import { getLinks, createLink, updateLink, deleteLink } from '@/api/links.js'
import { getTimestampToSeconds } from '@/utils/date.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminAvatar from '@/components/admin/AdminAvatar.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminDialog from '@/components/admin/AdminDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListSort from '@/components/admin/AdminListSort.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { reorderLinksWithinCategory } from '@/utils/linkOrder.js'

const tableData = ref([])
const loading = ref(true)
const dialogFormVisible = ref(false)
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)
const draggingId = ref('')
const dragOverId = ref('')
const sorting = ref(false)
const formErrors = reactive({ name: '', description: '', site: '', avatar: '', sortOrder: '' })
const sortBy = ref('category-order')
const sortOptions = [
  { label: '分类与排序', value: 'category-order' },
  { label: '排序序号', value: 'order-asc' },
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
  avatar: '',
  category: 'friend',
  sortOrder: '0'
})
const categoryLabels = {
  friend: '双向友链',
  recommended: '推荐站点'
}
const categoryRank = {
  friend: 0,
  recommended: 1
}
const compareByOrder = (a, b) => {
  const orderDifference = Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
  return orderDifference || Number(b.id) - Number(a.id)
}
const sortedLinks = computed(() => {
  const links = [...tableData.value]

  if (sortBy.value === 'category-order') {
    return links.sort((a, b) => {
      const categoryDifference = (categoryRank[a.category || 'friend'] ?? 0) - (categoryRank[b.category || 'friend'] ?? 0)
      return categoryDifference || compareByOrder(a, b)
    })
  }
  if (sortBy.value === 'order-asc') return links.sort(compareByOrder)
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

function handleDragStart(event, item) {
  if (sortBy.value !== 'category-order' || sorting.value) {
    event.preventDefault()
    return
  }
  draggingId.value = item.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', item.id)
}

function handleDragOver(item) {
  const dragged = tableData.value.find(link => link.id === draggingId.value)
  if (!dragged || (dragged.category || 'friend') !== (item.category || 'friend')) {
    dragOverId.value = ''
    return
  }
  dragOverId.value = item.id
}

function handleDragEnd() {
  draggingId.value = ''
  dragOverId.value = ''
}

async function handleDrop(item) {
  const updates = reorderLinksWithinCategory(sortedLinks.value, draggingId.value, item.id)
  handleDragEnd()
  if (!updates.length) return

  const previous = new Map(tableData.value.map(link => [link.id, link.sortOrder]))
  updates.forEach((update) => {
    const link = tableData.value.find(candidate => candidate.id === update.id)
    if (link) link.sortOrder = update.sortOrder
  })

  sorting.value = true
  try {
    await Promise.all(updates.map(updateLink))
    showMessage('友链顺序已保存', 'success')
  } catch (error) {
    console.error(error)
    tableData.value.forEach((link) => {
      if (previous.has(link.id)) link.sortOrder = previous.get(link.id)
    })
    await getLinksList()
    showMessage('顺序保存失败，请重试', 'error')
  } finally {
    sorting.value = false
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
  const type = color === 'error' ? 'error' : color === 'success' ? 'success' : 'info'
  ElMessage({ message: text, type })
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
  form.category = row.category || 'friend'
  form.sortOrder = String(row.sortOrder ?? 0)
}

function handleAddLink() {
  clearFormErrors()
  dialogFormVisible.value = true
  form.id = ''
  form.name = ''
  form.description = ''
  form.site = ''
  form.avatar = ''
  form.category = 'friend'
  const friendOrders = tableData.value
    .filter(item => (item.category || 'friend') === 'friend')
    .map(item => Number(item.sortOrder || 0))
  form.sortOrder = String((Math.max(0, ...friendOrders) || 0) + 10)
}

function clearFormErrors() {
  Object.keys(formErrors).forEach(key => { formErrors[key] = '' })
}

async function handleConfirm() {
  formErrors.name = form.name.trim() ? '' : '请输入友链名称'
  formErrors.description = form.description.trim() ? '' : '请输入友链描述'
  formErrors.site = form.site.trim() ? '' : '请输入友链网址'
  formErrors.avatar = form.avatar.trim() ? '' : '请输入头像地址'
  const sortOrder = Number(form.sortOrder)
  formErrors.sortOrder = Number.isInteger(sortOrder) && sortOrder >= 0 ? '' : '请输入大于或等于 0 的整数'
  if (Object.values(formErrors).some(Boolean)) return

  try {
    const payload = { ...form, sortOrder }
    if (form.id) {
      await updateLink(payload)
    } else {
      const now = new Date()
      const newId = getTimestampToSeconds(now)
      payload.id = newId
      await createLink(payload)
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
        <span>{{ sortedLinks.length }} 个友链<span v-if="sortBy === 'category-order'"> · 拖动同类友链调整顺序</span></span>
        <div class="list-toolbar__actions">
          <AdminButton tone="primary" :icon="mdiPlus" @click="handleAddLink">新增友链</AdminButton>
          <AdminListSort v-model="sortBy" :options="sortOptions" />
        </div>
      </div>
      <AdminList :items="sortedLinks" item-key="id" :loading="loading || sorting" :page-size="Math.max(sortedLinks.length, 1)" empty-text="暂无友链">
        <template #item="{ item }">
          <div
            class="link-sort-item"
            :class="{
              'link-sort-item--dragging': draggingId === item.id,
              'link-sort-item--over': dragOverId === item.id,
            }"
            :draggable="sortBy === 'category-order' && !sorting"
            @dragstart="handleDragStart($event, item)"
            @dragover.prevent="handleDragOver(item)"
            @drop.prevent="handleDrop(item)"
            @dragend="handleDragEnd"
          >
          <AdminListItem :headline="item.name" :supporting-text="item.description">
            <template #leading>
              <div class="link-leading">
                <MaterialIcon v-if="sortBy === 'category-order'" :path="mdiDragVertical" class="link-drag-handle" aria-hidden="true" />
                <AdminAvatar :src="item.avatar" :alt="`${item.name} 的头像`" />
              </div>
            </template>
            <template #supporting>
              <span class="link-category-badge">{{ categoryLabels[item.category || 'friend'] }}</span>
              <span class="link-order">排序 {{ item.sortOrder ?? 0 }}</span>
              <span>{{ item.description }}</span>
              <a class="link-address" :href="item.site" target="_blank" rel="noreferrer">{{ item.site }}</a>
            </template>
            <template #actions>
              <AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" />
            </template>
          </AdminListItem>
          </div>
        </template>
      </AdminList>
    </AdminCard>
  </AdminPage>

  <AdminDialog v-model="dialogFormVisible" :title="form.id ? '编辑友链' : '新增友链'" description="填写友链展示信息和访问地址" max-width="560">
    <MaterialTextField v-model="form.name" label="名称" required :error-message="formErrors.name" @update:model-value="formErrors.name = ''" />
    <MaterialTextField v-model="form.description" label="描述" required :error-message="formErrors.description" @update:model-value="formErrors.description = ''" />
    <MaterialTextField v-model="form.site" label="网址" required :error-message="formErrors.site" @update:model-value="formErrors.site = ''" />
    <MaterialTextField v-model="form.avatar" label="头像地址" required :error-message="formErrors.avatar" @update:model-value="formErrors.avatar = ''" />
    <MaterialTextField
      v-model="form.sortOrder"
      label="排序序号"
      type="number"
      min="0"
      step="1"
      required
      supporting-text="序号越小越靠前；推荐站点始终排在双向友链之后"
      :error-message="formErrors.sortOrder"
      @update:model-value="formErrors.sortOrder = ''"
    />
    <label class="link-category-field">
      <span>分类</span>
      <select v-model="form.category">
        <option value="friend">双向友链</option>
        <option value="recommended">推荐站点</option>
      </select>
    </label>
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

.link-sort-item {
  border-radius: 8px;
  transition: opacity 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}

.link-sort-item[draggable="true"] { cursor: grab; }
.link-sort-item[draggable="true"]:active { cursor: grabbing; }
.link-sort-item--dragging { opacity: 0.45; }
.link-sort-item--over {
  transform: translateY(2px);
  box-shadow: 0 -3px 0 var(--md-sys-color-primary);
}

.link-leading { display: flex; align-items: center; gap: 8px; }
.link-drag-handle { color: var(--md-sys-color-on-surface-variant); }

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

.link-category-badge {
  display: inline-flex;
  width: fit-content;
  margin-right: 8px;
  padding: 2px 8px;
  color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
  border-radius: 999px;
  font-size: 12px;
}

.link-order {
  display: inline-flex;
  width: fit-content;
  margin-right: 8px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.link-category-field {
  display: grid;
  gap: 6px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
}

.link-category-field select {
  width: 100%;
  height: 52px;
  padding: 0 14px;
  color: var(--md-sys-color-on-surface);
  background: transparent;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 4px;
  font: inherit;
  font-size: 16px;
}

.link-category-field select:focus {
  border-color: var(--md-sys-color-primary);
  outline: 1px solid var(--md-sys-color-primary);
}

@media (max-width: 760px) {
  .list-toolbar { align-items: flex-start; flex-direction: column; }
  .list-toolbar__actions { width: 100%; flex-wrap: wrap; }
}
</style>
