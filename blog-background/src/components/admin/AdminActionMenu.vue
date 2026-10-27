<script setup>
import { ref } from 'vue'
import { mdiContentCopy, mdiDeleteOutline, mdiDotsVertical, mdiDownload, mdiEyeOutline, mdiFileEditOutline, mdiImageMultipleOutline, mdiRefresh } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineProps({ actions: { type: Array, required: true } })
const emit = defineEmits(['select'])
const visible = ref(false)

const icons = {
  details: mdiEyeOutline,
  edit: mdiFileEditOutline,
  delete: mdiDeleteOutline,
  download: mdiDownload,
  copy: mdiContentCopy,
  generate: mdiImageMultipleOutline,
  reupload: mdiRefresh
}

const selectAction = (key) => {
  visible.value = false
  emit('select', key)
}
</script>
<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-end"
    :width="176"
    :offset="4"
    trigger="click"
    popper-class="admin-action-menu"
  >
    <template #reference>
      <button class="admin-action-trigger" type="button" aria-label="更多操作" :aria-expanded="visible">
        <MaterialIcon :path="mdiDotsVertical" />
      </button>
    </template>
    <div class="admin-action-list" role="menu">
      <template v-for="(action, index) in actions" :key="action.key">
        <div
          v-if="(action.danger || action.key === 'delete') && index > 0"
          class="admin-action-list__divider"
        />
        <button
          class="admin-action-list__item"
          :class="{ 'admin-action-list__item--danger': action.danger || action.key === 'delete' }"
          role="menuitem"
          type="button"
          @click="selectAction(action.key)"
        >
          <MaterialIcon class="admin-action-list__icon" :path="icons[action.key] || icons.details" />
          <span>{{ action.label }}</span>
        </button>
      </template>
    </div>
  </el-popover>
</template>
<style scoped>
.admin-action-trigger {
  position: relative;
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  color: var(--md-sys-color-on-surface-variant);
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.admin-action-trigger::before {
  position: absolute;
  inset: 0;
  background: currentColor;
  content: '';
  opacity: 0;
  transition: opacity 150ms ease;
}

.admin-action-trigger:hover::before { opacity: 0.08; }
.admin-action-trigger:active::before,
.admin-action-trigger[aria-expanded='true']::before { opacity: 0.12; }
.admin-action-trigger:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 32%, transparent);
  outline-offset: 2px;
}
.admin-action-trigger .material-icon { position: relative; width: 24px; height: 24px; }

.admin-action-list {
  padding: 8px 0;
  color: var(--md-sys-color-on-surface);
}

.admin-action-list__item {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  gap: 16px;
  padding: 0 20px 0 12px;
  border: 0;
  color: var(--md-sys-color-on-surface);
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  cursor: pointer;
}

.admin-action-list__item:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
.admin-action-list__item:active { background: color-mix(in srgb, currentColor 12%, transparent); }
.admin-action-list__icon { width: 20px; height: 20px; color: var(--md-sys-color-on-surface-variant); }

.admin-action-list__item--danger { color: var(--md-sys-color-error); }
.admin-action-list__item--danger .admin-action-list__icon { color: var(--md-sys-color-error); }
.admin-action-list__divider { height: 1px; margin: 8px 0; background: var(--md-sys-color-outline-variant); }

:global(.admin-action-menu.el-popper) {
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 8px;
  background: var(--md-sys-color-surface-container);
  box-shadow: 0 2px 6px 2px rgba(29, 27, 32, 0.15), 0 1px 2px rgba(29, 27, 32, 0.3);
}
</style>
