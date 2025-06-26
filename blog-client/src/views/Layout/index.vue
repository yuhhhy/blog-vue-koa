<script setup>
import LayoutNav from './components/LayoutNav.vue';
import LayoutFooter from './components/LayoutFooter.vue';
</script>

<template>
    <div class="layout">
        <LayoutNav />
        <RouterView />
        <LayoutFooter />
    </div>
</template>

<style lang="scss" scoped>
.layout { 
    background-color: var(--white);
}
</style>