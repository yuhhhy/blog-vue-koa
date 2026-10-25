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
  <v-menu location="bottom end">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon variant="text" size="48" aria-label="更多操作">
        <MaterialIcon :path="mdiDotsVertical" />
      </v-btn>
    </template>
    <v-list class="admin-action-list" rounded="lg" density="comfortable">
      <v-list-item
        v-for="action in actions"
        :key="action.key"
        :class="{ 'admin-action-list__danger': action.danger || action.key === 'delete' }"
        rounded="lg"
        @click="$emit('select', action.key)"
      >
        <template #prepend><MaterialIcon :path="icons[action.key] || icons.details" /></template>
        <v-list-item-title>{{ action.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<style scoped>
.admin-action-list { min-width: 176px; padding: 4px; border: 0; background: var(--admin-surface); box-shadow: var(--admin-shadow-soft); }
.admin-action-list :deep(.v-list-item) { margin-block: 2px; }
.admin-action-list__danger { color: var(--md-sys-color-error); }
.material-icon { width: 20px; height: 20px; }
</style>
