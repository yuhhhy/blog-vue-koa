<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
    <footer class="page-toolbar" aria-label="页面工具">
        <div class="page-toolbar__actions">
            <ThemeToggle />
        </div>
    </footer>
</template>

<style scoped>
.page-toolbar {
    position: relative;
    z-index: 3;
    display: flex;
    width: min(100%, 1080px);
    min-height: 72px;
    align-items: center;
    justify-content: flex-end;
    margin: 0 auto;
    padding: 12px var(--page-inline-padding) max(24px, env(safe-area-inset-bottom));
}

.page-toolbar__actions {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
