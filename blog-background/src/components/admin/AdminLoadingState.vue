<script setup>
defineProps({
  label: { type: String, default: '内容加载中' }
})
</script>

<template>
  <div class="admin-loading-state" role="status" :aria-label="label">
    <span class="admin-loading-state__spinner"></span>
  </div>
</template>

<style scoped>
.admin-loading-state {
  display: grid;
  place-items: center;
  pointer-events: none;
  background: var(--admin-surface);
}

.admin-loading-state__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--admin-primary-soft);
  border-top-color: var(--admin-primary);
  border-radius: 50%;
  animation: admin-loading-spin 700ms linear infinite;
}

@keyframes admin-loading-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .admin-loading-state__spinner { animation-duration: 1400ms; }
}
</style>
