<script setup>
import LayoutNav from './components/LayoutNav.vue';
</script>

<template>
    <div class="layout">
        <div class="layout-page">
            <LayoutNav />
            <main class="layout-main">
                <div class="layout-content">
                    <RouterView />
                </div>
            </main>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout {
    min-height: 100vh;
    background-color: var(--white);
}

.layout-page {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.layout-main {
    flex: 1;
    min-width: 0;
}

.layout-content {
    width: min(100%, 1080px);
    margin: 0 auto;
    padding-inline: clamp(20px, 4vw, 48px);
}

</style>
