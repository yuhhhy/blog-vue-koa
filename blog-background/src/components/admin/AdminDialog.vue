<script setup>
import { mdiClose } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineOptions({ inheritAttrs: false })
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  closeLabel: { type: String, default: '关闭对话框' },
  showClose: { type: Boolean, default: true }
})
const model = defineModel({ type: Boolean, default: false })
</script>
<template>
  <v-dialog v-model="model" v-bind="$attrs" class="admin-dialog-overlay" scrollable>
    <v-card class="admin-dialog" rounded="xl" role="document">
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
      <v-card-text class="admin-dialog__body"><slot /></v-card-text>
      <v-card-actions v-if="$slots.actions" class="admin-dialog__actions">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.admin-dialog {
  max-height: min(88vh, 900px);
  border: 0;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-high);
  box-shadow: 0 8px 12px 6px rgba(29, 27, 32, 0.15), 0 4px 4px rgba(29, 27, 32, 0.3);
}

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
  .admin-dialog { max-height: calc(100dvh - 32px); margin: 16px; border-radius: 24px !important; }
  .admin-dialog__header { padding: 20px 20px 8px; }
  .admin-dialog__body { padding: 12px 20px !important; }
  .admin-dialog__actions { padding: 8px 20px 20px !important; }
}
</style>
