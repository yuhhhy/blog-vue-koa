<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'
import HomeCornerReturn from '@/components/HomeCornerReturn.vue'
import HomePage from '@/views/Home/index.vue'

const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()
const sceneActive = ref(route.name === 'Home')
const pageBackground = computed(() => route.meta.backgroundColor || 'var(--white)')
const pageBackgroundShape = computed(() => route.meta.backgroundShape || '')
const showHomeReturn = computed(() => ['About', 'Essays', 'Archive'].includes(route.name))
const returnHome = () => router.push('/')
const setSceneActive = (active) => {
    sceneActive.value = active
    document.documentElement.classList.toggle('is-scene-transitioning', active)
}

onMounted(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(themeStore.theme)
    setSceneActive(sceneActive.value)

    runAfterPageIdle(() => {
        apiUpdateWebsiteVisit().catch(() => {})
    })
})
</script>

<template>
    <HomePage @scene-active="setSceneActive" />
    <HomeCornerReturn v-if="showHomeReturn && !sceneActive" @click="returnHome" />
    <div
        class="layout"
        :class="[pageBackgroundShape ? `layout--${pageBackgroundShape}` : '', { 'is-scene-active': sceneActive }]"
        :style="{ backgroundColor: pageBackground }"
        :inert="sceneActive"
        :aria-hidden="sceneActive"
    >
        <div class="layout-page">
            <main class="layout-main">
                <div
                    class="layout-content"
                    :class="{ 'layout-content--explore': route.name === 'Explore' }"
                    data-route-content
                >
                    <RouterView v-slot="{ Component, route: currentRoute }">
                        <component :is="Component" v-if="currentRoute.name !== 'Home'" />
                    </RouterView>
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

.layout.is-scene-active {
    visibility: hidden;
    height: 100dvh;
    overflow: hidden;
}

.layout--about,
.layout--essays,
.layout--archive {
    --white: #ffffff;
    --light: #fafcf9;
    --lightgrey: #ccd9d9;
    --light-dark: #354b56;
    --dark: #263846;
    --black: #263846;
    --quote-color: #526976;
    --border-color: #d3dfdf;
    --blue: #263846;
    --skyblue: #3e7181;
    --b-color: #263846;
    color: var(--black);
    color-scheme: light;
    background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.3), transparent 45%, rgba(71, 55, 55, 0.08));
}

.layout::before {
    position: fixed;
    z-index: 1;
    inset: 0;
    background-color: #fafcf9;
    background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.3), transparent 45%, rgba(71, 55, 55, 0.08));
    pointer-events: none;
}

.layout--about::after,
.layout--essays::after,
.layout--archive::after {
    content: "";
    position: fixed;
    z-index: 1;
    inset: 0;
    background-image: var(--pattern-image);
    background-position: 0 0;
    background-size: 320px 320px;
    background-repeat: repeat;
    opacity: 0.05;
    mix-blend-mode: multiply;
    pointer-events: none;
}

.layout--about {
    --pattern-image: url('/textures/sakura-weave.webp');
}

.layout--essays {
    --pattern-image: url('/textures/cloud-weave.webp');
}

.layout--archive {
    --pattern-image: url('/textures/leaf-weave.webp');
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
    z-index: 2;
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

.layout-content--explore {
    padding-inline: 0;
}

</style>
