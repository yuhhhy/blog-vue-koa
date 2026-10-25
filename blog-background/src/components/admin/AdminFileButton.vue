<script setup>
import { ref } from 'vue'
import { mdiUpload } from '@mdi/js'
import AdminButton from './AdminButton.vue'
defineOptions({ inheritAttrs: false })
defineProps({
  accept: { type: String, default: '' },
  multiple: Boolean,
  label: { type: String, default: '选择文件' },
  tone: { type: String, default: 'primary' },
  variant: { type: String, default: '' }
})
const emit = defineEmits(['select'])
const input = ref(null)
function handleChange(event) {
  const files = Array.from(event.target.files || [])
  if (files.length) emit('select', files)
  event.target.value = ''
}
</script>
<template>
  <span class="admin-file-button">
    <input ref="input" type="file" :accept="accept" :multiple="multiple" @change="handleChange" />
    <AdminButton :tone="tone" :variant="variant" :icon="mdiUpload" v-bind="$attrs" @click="input?.click()"><slot>{{ label }}</slot></AdminButton>
  </span>
</template>
<style scoped>.admin-file-button { display: inline-flex; } input { display: none; }</style>
