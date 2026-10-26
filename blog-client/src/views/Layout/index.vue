<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'

const themeStore = useThemeStore()
const route = useRoute()
const pageBackground = computed(() => route.meta.backgroundColor || 'var(--white)')
const pageBackgroundShape = computed(() => route.meta.backgroundShape || '')

onMounted(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(themeStore.theme)

    runAfterPageIdle(() => {
        apiUpdateWebsiteVisit().catch(() => {})
    })
})
</script>

<template>
    <div
        class="layout"
        :class="pageBackgroundShape ? `layout--${pageBackgroundShape}` : ''"
        :style="{ backgroundColor: pageBackground }"
    >
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
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    background-color: var(--white);
}

.layout::before {
    position: fixed;
    z-index: 0;
    inset: 0;
    background-color: #f5f2ec;
    pointer-events: none;
}

.layout--about::before,
.layout--essays::before,
.layout--archive::before {
    content: "";
}

.layout--about::before {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 50%);
}

.layout--essays::before {
    clip-path: polygon(100% 0, 0 50%, 0 50%, 100% 100%);
}

.layout--archive::before {
    clip-path: polygon(0 50%, 100% 100%, 100% 100%, 0 100%);
}

.layout-page {
    position: relative;
    z-index: 1;
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
