<script setup>
 
</script>

<template>
    <main class="admin-content">
        <RouterView />
    </main>
</template>

<style scoped>
.admin-content {
    height: calc(100vh - var(--admin-header-height));
    margin-left: var(--admin-sidebar-width);
    padding: 16px;
    overflow: auto;
    background:
        linear-gradient(180deg, rgba(246, 248, 251, 0.9), rgba(237, 242, 247, 0.94)),
        linear-gradient(90deg, rgba(36, 84, 255, 0.035) 1px, transparent 1px),
        linear-gradient(0deg, rgba(36, 84, 255, 0.032) 1px, transparent 1px);
    background-size: auto, 32px 32px, 32px 32px;
}
</style>
