<script setup>
defineProps({
  tone: { type: String, default: 'default' }
})
</script>

<template>
  <span class="admin-list-label" :class="`admin-list-label--${tone}`"><slot /></span>
</template>

<style scoped>
.admin-list-label {
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
  white-space: nowrap;
}

.admin-list-label--success {
  color: var(--admin-on-success-container);
  background: var(--admin-success-container);
}

.admin-list-label--warning {
  color: var(--admin-on-warning-container);
  background: var(--admin-warning-soft);
}

.admin-list-label--info {
  color: var(--admin-on-info-container);
  background: var(--admin-info-container);
}
</style>
