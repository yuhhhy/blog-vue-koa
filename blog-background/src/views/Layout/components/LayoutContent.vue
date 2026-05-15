<script setup>
 
</script>

<template>
    <main class="admin-content">
        <RouterView />
    </main>
</template>

<style scoped>
.admin-content {
    position: relative;
    height: calc(100vh - var(--admin-header-height));
    margin-left: var(--admin-sidebar-width);
    padding: 0;
    overflow: auto;
    background:
        linear-gradient(135deg, rgba(248, 250, 252, 0.7), rgba(225, 234, 246, 0.72)),
        linear-gradient(115deg, rgba(36, 84, 255, 0.08), transparent 42%, rgba(0, 139, 139, 0.08));
}
</style>
