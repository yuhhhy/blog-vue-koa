<script setup>
import LayoutNav from './components/LayoutNav.vue';
import LayoutSider from './components/LayoutSider.vue';
import LayoutFooter from './components/LayoutFooter.vue';
</script>

<template>
    <div class="layout">
        <LayoutSider />
        <div class="layout-page">
            <LayoutNav />
            <main class="layout-main">
                <RouterView />
            </main>
            <LayoutFooter />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
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

@media (max-width: 1024px) {
    .layout {
        grid-template-columns: 220px minmax(0, 1fr);
    }
}

@media (max-width: 768px) {
    .layout {
        grid-template-columns: 56px minmax(0, 1fr);
    }
}
</style>
