<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'

const themeStore = useThemeStore()
const route = useRoute()
const pageBackground = computed(() => route.meta.backgroundColor || 'var(--white)')

onMounted(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(themeStore.theme)

    runAfterPageIdle(() => {
        apiUpdateWebsiteVisit().catch(() => {})
    })
})
</script>

<template>
    <div class="layout" :style="{ backgroundColor: pageBackground }">
        <div class="layout-page">
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
