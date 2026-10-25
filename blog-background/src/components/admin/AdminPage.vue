<template>
  <section class="admin-page">
    <div v-if="$slots.actions" class="admin-page__actions"><slot name="actions" /></div>
    <slot />
  </section>
</template>

<style scoped>
.admin-page {
  display: grid;
  width: min(1440px, 100%);
  min-height: 100%;
  margin: 0 auto;
  padding: 28px;
  align-content: start;
  gap: 30px;
  background: var(--admin-bg);
}

.admin-page__actions {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 720px) {
  .admin-page { padding: 16px; }
  .admin-page__actions { flex-wrap: wrap; justify-content: stretch; }
}
</style>
