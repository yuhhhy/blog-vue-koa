<script setup>
import { computed, ref, watch } from 'vue'
import AdminPagination from '@/components/admin/AdminPagination.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  itemKey: { type: [String, Function], default: 'id' },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无内容' },
  page: { type: Number, default: null },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: null },
  itemLabel: { type: String, default: '条记录' }
})

const emit = defineEmits(['update:page'])
const internalPage = ref(1)
const isServerPaginated = computed(() => props.total !== null)
const totalItems = computed(() => isServerPaginated.value ? props.total : props.items.length)
const currentPage = computed(() => props.page ?? internalPage.value)
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / props.pageSize)))
const visibleItems = computed(() => {
  if (isServerPaginated.value) return props.items
  const start = (currentPage.value - 1) * props.pageSize
  return props.items.slice(start, start + props.pageSize)
})

const changePage = (page) => {
  if (props.page === null) internalPage.value = page
  else emit('update:page', page)
}

watch(() => props.items, () => {
  if (!isServerPaginated.value) internalPage.value = 1
})

watch([totalItems, () => props.pageSize], () => {
  if (currentPage.value <= pageCount.value) return
  changePage(pageCount.value)
})

const resolveKey = (item, index, itemKey) => {
  if (typeof itemKey === 'function') return itemKey(item, index)
  return item?.[itemKey] ?? index
}
</script>

<template>
  <div class="admin-list" :aria-busy="loading || undefined">
    <v-progress-linear
      v-if="loading"
      class="admin-list__progress"
      color="primary"
      indeterminate
      height="3"
    />

    <ul v-if="visibleItems.length" class="admin-list__items" role="list">
      <li v-for="(item, index) in visibleItems" :key="resolveKey(item, index, itemKey)">
        <slot name="item" :item="item" :index="index" />
      </li>
    </ul>

    <div v-else-if="!loading" class="admin-list__empty" role="status">
      <slot name="empty">{{ emptyText }}</slot>
    </div>

    <AdminPagination
      :model-value="currentPage"
      :page-size="pageSize"
      :total="totalItems"
      :item-label="itemLabel"
      :disabled="loading"
      @update:model-value="changePage"
    />
  </div>
</template>

<style scoped>
.admin-list {
  position: relative;
  width: 100%;
  min-width: 0;
}

.admin-list__progress {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 16px;
  width: calc(100% - 32px);
  border-radius: 999px;
}

.admin-list__items {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-list__items > li {
  min-width: 0;
}

.admin-list__items > li:first-child :deep(.admin-list-item) {
  border-radius: 16px 16px 4px 4px;
}

.admin-list__items > li:last-child :deep(.admin-list-item) {
  border-radius: 4px 4px 16px 16px;
}

.admin-list__items > li:only-child :deep(.admin-list-item) {
  border-radius: 16px;
}

.admin-list__empty {
  display: grid;
  min-height: 152px;
  place-items: center;
  padding: 24px;
  border-radius: 16px;
  color: var(--admin-text-muted);
  background: var(--md-sys-color-surface-container-low);
  font-size: 14px;
}
</style>
