<script setup>
import { computed } from 'vue'
import { mdiClose } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  closeLabel: { type: String, default: '关闭对话框' },
  showClose: { type: Boolean, default: true },
  maxWidth: { type: [Number, String], default: 600 }
})
const model = defineModel({ type: Boolean, default: false })
const dialogWidth = computed(() => {
  const width = typeof props.maxWidth === 'number' || /^\d+$/.test(props.maxWidth)
    ? `${props.maxWidth}px`
    : props.maxWidth
  return `min(calc(100vw - 32px), ${width})`
})
</script>
<template>
  <el-dialog
    v-model="model"
    v-bind="$attrs"
    class="admin-dialog"
    :width="dialogWidth"
    :show-close="false"
    append-to-body
    align-center
  >
    <template #header>
      <div class="admin-dialog__header">
        <div class="admin-dialog__heading">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>
        <button
          v-if="showClose"
          class="admin-dialog__close"
          type="button"
          :aria-label="closeLabel"
          @click="model = false"
        >
          <MaterialIcon :path="mdiClose" />
        </button>
      </div>
    </template>
    <div class="admin-dialog__body"><slot /></div>
    <template v-if="$slots.actions" #footer>
      <div class="admin-dialog__actions">
        <slot name="actions" />
      </div>
    </template>
  </el-dialog>
</template>
<style scoped>
:global(.admin-dialog.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: min(88vh, 900px);
  overflow: hidden;
  border: 0;
  border-radius: 28px;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-high);
  box-shadow: 0 8px 12px 6px rgba(29, 27, 32, 0.15), 0 4px 4px rgba(29, 27, 32, 0.3);
}

:global(.admin-dialog .el-dialog__header),
:global(.admin-dialog .el-dialog__body),
:global(.admin-dialog .el-dialog__footer) { margin: 0; padding: 0; }

:global(.admin-dialog .el-dialog__body) { min-height: 0; overflow-y: auto; }

.admin-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 8px;
}

.admin-dialog__heading { min-width: 0; }
.admin-dialog__heading h2 { margin: 0; font-size: 24px; font-weight: 500; letter-spacing: 0; line-height: 32px; }
.admin-dialog__heading p { margin: 4px 0 0; color: var(--md-sys-color-on-surface-variant); font-size: 14px; line-height: 20px; }

.admin-dialog__close {
  display: inline-grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  margin: -8px -8px 0 0;
  border: 0;
  border-radius: 50%;
  color: var(--md-sys-color-on-surface-variant);
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.admin-dialog__close:hover { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent); }
.admin-dialog__close:focus-visible { outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 32%, transparent); outline-offset: 2px; }
.admin-dialog__close :deep(svg) { width: 22px; height: 22px; }

.admin-dialog__body { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; overflow-x: hidden; gap: 16px; padding: 16px 24px !important; color: var(--md-sys-color-on-surface-variant); line-height: 1.5; }
.admin-dialog__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; min-height: 64px; padding: 8px 24px 24px !important; }

@media (max-width: 600px) {
  :global(.admin-dialog.el-dialog) { max-height: calc(100dvh - 32px); border-radius: 24px; }
  .admin-dialog__header { padding: 20px 20px 8px; }
  .admin-dialog__body { padding: 12px 20px !important; }
  .admin-dialog__actions { padding: 8px 20px 20px !important; }
}
</style>
