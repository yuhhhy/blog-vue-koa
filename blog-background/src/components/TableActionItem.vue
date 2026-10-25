<script setup>
import {
  mdiCommentProcessingOutline,
  mdiContentCopy,
  mdiDeleteOutline,
  mdiDownload,
  mdiEyeOutline,
  mdiFileEditOutline,
  mdiImageMultipleOutline,
  mdiRefresh
} from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

const props = defineProps({
  kind: {
    type: String,
    default: 'details'
  },
  danger: Boolean,
  disabled: Boolean,
  loading: Boolean
})

defineEmits(['click'])

const icons = {
  details: mdiEyeOutline,
  manage: mdiCommentProcessingOutline,
  edit: mdiFileEditOutline,
  delete: mdiDeleteOutline,
  download: mdiDownload,
  copy: mdiContentCopy,
  generate: mdiImageMultipleOutline,
  reupload: mdiRefresh
}
</script>

<template>
  <button
    class="table-action-item"
    :class="{ 'is-danger': danger || kind === 'delete', 'is-loading': loading }"
    type="button"
    role="menuitem"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="table-action-spinner" aria-hidden="true" />
    <MaterialIcon v-else :path="icons[props.kind] || icons.details" />
    <span><slot /></span>
  </button>
</template>

<style scoped>
.table-action-item {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  text-align: left;
  transition: background-color 140ms ease, color 140ms ease;
}

.table-action-item:hover,
.table-action-item:focus-visible {
  background: var(--md-sys-color-surface-container-highest);
  outline: none;
}

.table-action-item.is-danger {
  color: var(--md-sys-color-error);
}

.table-action-item.is-danger:hover,
.table-action-item.is-danger:focus-visible {
  background: var(--admin-danger-soft);
  color: var(--admin-on-danger-container);
}

.table-action-item:disabled {
  cursor: wait;
  opacity: 0.58;
}

.material-icon,
.table-action-spinner {
  width: 20px;
  height: 20px;
  flex: none;
  font-size: 20px;
}

.table-action-spinner {
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: table-action-spin 700ms linear infinite;
}

@keyframes table-action-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
