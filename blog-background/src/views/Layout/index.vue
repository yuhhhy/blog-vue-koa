<script setup>
import LayoutSideNav from './components/LayoutSideNav.vue'
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutContent from './components/LayoutContent.vue'
</script>

<template>
  <div class="admin-shell">
    <LayoutSideNav />
    <LayoutHeader />
    <LayoutContent />
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  color: var(--admin-text);
}
</style>
