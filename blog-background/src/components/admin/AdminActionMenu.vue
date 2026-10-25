<script setup>
import { mdiContentCopy, mdiDeleteOutline, mdiDotsVertical, mdiDownload, mdiEyeOutline, mdiFileEditOutline, mdiImageMultipleOutline, mdiRefresh } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineProps({ actions: { type: Array, required: true } })
defineEmits(['select'])

const icons = {
  details: mdiEyeOutline,
  edit: mdiFileEditOutline,
  delete: mdiDeleteOutline,
  download: mdiDownload,
  copy: mdiContentCopy,
  generate: mdiImageMultipleOutline,
  reupload: mdiRefresh
}
</script>
<template>
  <v-menu
    location="bottom end"
    :offset="4"
    transition="scale-transition"
    scroll-strategy="close"
    content-class="admin-action-menu"
  >
    <template #activator="{ props }">
      <button v-bind="props" class="admin-action-trigger" type="button" aria-label="更多操作">
        <MaterialIcon :path="mdiDotsVertical" />
      </button>
    </template>
    <v-list class="admin-action-list" density="compact" role="menu">
      <template v-for="(action, index) in actions" :key="action.key">
        <v-divider
          v-if="(action.danger || action.key === 'delete') && index > 0"
          class="admin-action-list__divider"
        />
        <v-list-item
          class="admin-action-list__item"
          :class="{ 'admin-action-list__item--danger': action.danger || action.key === 'delete' }"
          role="menuitem"
          slim
          @click="$emit('select', action.key)"
        >
          <template #prepend>
            <MaterialIcon class="admin-action-list__icon" :path="icons[action.key] || icons.details" />
          </template>
          <v-list-item-title>{{ action.label }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
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
  min-width: 176px;
  max-width: 280px;
  padding: 8px 0;
  border: 0;
  border-radius: 8px !important;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container) !important;
  box-shadow: 0 2px 6px 2px rgba(29, 27, 32, 0.15), 0 1px 2px rgba(29, 27, 32, 0.3) !important;
}

.admin-action-list__item {
  min-height: 48px !important;
  padding-inline: 12px 20px !important;
  border-radius: 0 !important;
  color: var(--md-sys-color-on-surface);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.admin-action-list__item :deep(.v-list-item__prepend) { width: 36px; }
.admin-action-list__item :deep(.v-list-item__overlay) { color: var(--md-sys-color-on-surface); }
.admin-action-list__item:hover :deep(.v-list-item__overlay) { opacity: 0.08; }
.admin-action-list__item:active :deep(.v-list-item__overlay) { opacity: 0.12; }
.admin-action-list__icon { width: 20px; height: 20px; color: var(--md-sys-color-on-surface-variant); }

.admin-action-list__item--danger { color: var(--md-sys-color-error); }
.admin-action-list__item--danger .admin-action-list__icon { color: var(--md-sys-color-error); }
.admin-action-list__item--danger :deep(.v-list-item__overlay) { color: var(--md-sys-color-error); }
.admin-action-list__divider { margin: 8px 0; border-color: var(--md-sys-color-outline-variant); opacity: 1; }

:global(.admin-action-menu) { transform-origin: top right !important; }
</style>
