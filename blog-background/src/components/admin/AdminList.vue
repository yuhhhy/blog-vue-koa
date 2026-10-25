<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  itemKey: { type: [String, Function], default: 'id' },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无内容' }
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

    <ul v-if="items.length" class="admin-list__items" role="list">
      <li v-for="(item, index) in items" :key="resolveKey(item, index, itemKey)">
        <slot name="item" :item="item" :index="index" />
      </li>
    </ul>

    <div v-else-if="!loading" class="admin-list__empty" role="status">
      <slot name="empty">{{ emptyText }}</slot>
    </div>
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
