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
    height: 100vh;
    margin-left: var(--admin-sidebar-width);
    padding: 0;
    overflow: auto;
    background: var(--admin-bg);
}
</style>
