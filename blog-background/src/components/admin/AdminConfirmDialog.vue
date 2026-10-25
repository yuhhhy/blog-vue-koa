<script setup>
import { mdiAlertOutline } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import AdminButton from './AdminButton.vue'
import AdminDialog from './AdminDialog.vue'

defineProps({
  title: { type: String, default: '确认操作' },
  message: { type: String, required: true },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm'])
const model = defineModel({ type: Boolean, default: false })
</script>

<template>
  <AdminDialog v-model="model" :title="title" max-width="440" :show-close="false">
    <div class="confirm-dialog" :class="{ 'confirm-dialog--danger': danger }">
      <div class="confirm-dialog__icon" aria-hidden="true">
        <MaterialIcon :path="mdiAlertOutline" />
      </div>
      <p>{{ message }}</p>
    </div>
    <template #actions>
      <AdminButton variant="text" :disabled="loading" @click="model = false">{{ cancelText }}</AdminButton>
      <AdminButton :variant="danger ? 'danger-text' : 'text'" :disabled="loading" @click="emit('confirm')">
        {{ loading ? '处理中…' : confirmText }}
      </AdminButton>
    </template>
  </AdminDialog>
</template>

<style scoped>
.confirm-dialog { display: grid; grid-template-columns: 40px 1fr; align-items: start; gap: 16px; }
.confirm-dialog__icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 12px; color: var(--md-sys-color-primary); background: var(--md-sys-color-primary-container); }
.confirm-dialog--danger .confirm-dialog__icon { color: var(--admin-danger); background: var(--admin-danger-soft); }
.confirm-dialog__icon :deep(svg) { width: 22px; height: 22px; }
.confirm-dialog p { margin: 7px 0 0; color: var(--md-sys-color-on-surface-variant); line-height: 1.55; }
</style>
