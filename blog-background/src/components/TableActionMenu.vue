<script setup>
import { nextTick, ref } from 'vue'
import { mdiDotsVertical } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineProps({
  label: {
    type: String,
    default: '更多操作'
  }
})

const visible = ref(false)

function handleActionClick(event) {
  if (!event.target.closest('.table-action-item')) return

  nextTick(() => {
    visible.value = false
  })
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-end"
    trigger="click"
    :width="176"
    :show-arrow="false"
    popper-class="table-action-popover"
  >
    <template #reference>
      <button class="table-action-trigger" type="button" :aria-label="label" :title="label">
        <MaterialIcon :path="mdiDotsVertical" />
      </button>
    </template>

    <div class="table-action-list" role="menu" @click="handleActionClick">
      <slot />
    </div>
  </el-popover>
</template>

<style scoped>
.table-action-trigger {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  font-size: 22px;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.table-action-trigger:hover,
.table-action-trigger:focus-visible {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  outline: none;
}

.table-action-trigger:active {
  transform: scale(0.92);
}

.table-action-list {
  display: grid;
  gap: 2px;
  padding: 4px;
}
</style>

<style>
.el-popper.table-action-popover {
  padding: 4px !important;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant) !important;
  border-radius: 16px !important;
  background: var(--md-sys-color-surface-container) !important;
  box-shadow: var(--admin-shadow) !important;
}
</style>
