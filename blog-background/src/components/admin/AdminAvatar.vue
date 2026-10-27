<script setup>
defineOptions({ inheritAttrs: false })
defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: [Number, String], default: 56 }
})
</script>

<template>
  <img
    class="admin-avatar"
    :src="src"
    :alt="alt"
    :width="size"
    :height="size"
    loading="lazy"
    v-bind="$attrs"
  >
</template>

<style scoped>
.admin-avatar {
  display: block;
  flex: none;
  border-radius: 12px;
  object-fit: cover;
  background: var(--md-sys-color-surface-container-highest);
}
</style>
