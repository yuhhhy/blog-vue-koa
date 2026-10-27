<script setup>
defineOptions({ inheritAttrs: false })
defineProps({ title: { type: String, default: '' } })
</script>
<template>
  <section class="admin-card" v-bind="$attrs">
    <div v-if="title || $slots.actions" class="admin-card__header">
      <h2 v-if="title">{{ title }}</h2>
      <slot name="actions" />
    </div>
    <div class="admin-card__body"><slot /></div>
  </section>
</template>
<style scoped>
.admin-card {
  border: 0;
  border-radius: 0 !important;
  background: transparent;
  box-shadow: none !important;
}

.admin-card__header {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 0 12px;
}

h2 {
  margin: 0;
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
}

.admin-card__body { padding: 0; }

@media (max-width: 720px) {
  .admin-card__header { align-items: flex-start; flex-direction: column; gap: 10px; }
}
</style>
