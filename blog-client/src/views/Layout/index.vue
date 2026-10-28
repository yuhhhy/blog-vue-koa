<script setup>
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { useBlogList } from '@/composables/useBlogList.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'
import HomeCornerReturn from '@/components/HomeCornerReturn.vue'
import HomePage from '@/views/Home/index.vue'

import EmaScene from '@/components/ema/EmaScene.vue'
import { createEmaController } from '@/ema/controller.js'
import { emaContextKey } from '@/ema/context.js'

const ema = createEmaController()
provide(emaContextKey, ema)

const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()
const { fetchBlogList } = useBlogList()
const sceneActive = ref(route.name === 'Home')
const pageBackground = ref(route.meta.backgroundColor || 'var(--white)')
const pageBackgroundShape = ref(route.meta.backgroundShape || '')
const routeTransition = ref('')
const routeTransitionScrollOffset = ref('0px')
const routeTransitionReturnOffset = ref('0px')
const routeTransitionDuration = computed(() => {
    if (routeTransition.value === 'article-archive') return 1320
    return routeTransition.value ? 980 : 0
})
let archiveScrollPosition = 0
let previousBodyMinHeight = ''
let articleTransitionLocked = false
const showCornerReturn = computed(() => ['About', 'Essays', 'Archive', 'Blog'].includes(route.name))
const cornerReturnLabel = computed(() => route.name === 'Blog' ? '返回文章列表' : '返回首页')
const returnFromPage = async () => {
    if (route.name === 'Blog') {
        try {
            // Ensure the archive entries exist before Vue applies the enter classes.
            // Otherwise a direct article visit can insert the list halfway through
            // the transition and make it look as though it appeared instantly.
            await fetchBlogList()
        }
        catch (error) {
            console.error('预加载归档列表失败', error)
        }

        return router.push('/archive')
    }

    return router.push('/')
}
const applyRouteBackground = () => {
    pageBackground.value = route.meta.backgroundColor || 'var(--white)'
    pageBackgroundShape.value = route.meta.backgroundShape || ''
}
const lockArticleTransitionScroll = () => {
    if (articleTransitionLocked) return
    previousBodyMinHeight = document.body.style.minHeight
    document.body.style.minHeight = `${Math.max(document.documentElement.scrollHeight, window.innerHeight)}px`
    document.documentElement.classList.add('is-article-transitioning')
    articleTransitionLocked = true
}
const unlockArticleTransitionScroll = () => {
    if (!articleTransitionLocked) return
    document.documentElement.classList.remove('is-article-transitioning')
    document.body.style.minHeight = previousBodyMinHeight
    previousBodyMinHeight = ''
    articleTransitionLocked = false
}
const finishRouteTransition = async () => {
    const completedTransition = routeTransition.value
    if (completedTransition === 'archive-article') {
        applyRouteBackground()
    }
    routeTransition.value = ''
    await nextTick()
    window.scrollTo(0, completedTransition === 'article-archive' ? archiveScrollPosition : 0)
    routeTransitionScrollOffset.value = '0px'
    routeTransitionReturnOffset.value = '0px'
    unlockArticleTransitionScroll()
}
const setSceneActive = (active) => {
    sceneActive.value = active
    document.documentElement.classList.toggle('is-scene-transitioning', active)
}

watch(() => route.name, (target, source) => {
    if (source === 'Archive' && target === 'Blog') {
        lockArticleTransitionScroll()
        archiveScrollPosition = window.scrollY
        routeTransitionScrollOffset.value = `${window.scrollY}px`
        routeTransition.value = 'archive-article'
        return
    }

    if (source === 'Blog' && target === 'Archive') {
        lockArticleTransitionScroll()
        routeTransitionReturnOffset.value = `${window.scrollY - archiveScrollPosition}px`
        routeTransition.value = 'article-archive'
        applyRouteBackground()
        return
    }

    routeTransition.value = ''
    applyRouteBackground()
}, { flush: 'sync' })

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
    <EmaScene :controller="ema" :preview-active="sceneActive" :route-name="route.name" />
    <HomeCornerReturn
        v-if="showCornerReturn && !sceneActive"
        :aria-label="cornerReturnLabel"
        @click="returnFromPage"
    />
    <div
        class="layout"
        :class="[
            pageBackgroundShape ? `layout--${pageBackgroundShape}` : '',
            {
                'layout--explore': route.name === 'Explore',
                'layout--article-opening': routeTransition === 'archive-article',
                'layout--article-returning': routeTransition === 'article-archive',
                'is-scene-active': sceneActive,
            },
        ]"
        :style="{ backgroundColor: pageBackground }"
        :inert="sceneActive"
        :aria-hidden="sceneActive"
    >
        <div class="layout-page">
            <main class="layout-main">
                <div
                    class="layout-content"
                    :class="{ 'layout-content--explore': route.name === 'Explore' }"
                    :style="{
                        '--route-transition-scroll-offset': routeTransitionScrollOffset,
                        '--route-transition-return-offset': routeTransitionReturnOffset,
                    }"
                    data-route-content
                >
                    <RouterView v-slot="{ Component, route: currentRoute }">
                        <Transition
                            :name="routeTransition"
                            :css="Boolean(routeTransition)"
                            :duration="routeTransitionDuration"
                            @after-enter="finishRouteTransition"
                            @enter-cancelled="finishRouteTransition"
                        >
                            <component
                                :is="Component"
                                v-if="currentRoute.name !== 'Home'"
                                :key="currentRoute.fullPath"
                            />
                        </Transition>
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

.layout--explore {
    background-color: #e7d3ad;
    background-image:
        linear-gradient(rgba(255, 249, 232, 0.5), rgba(255, 249, 232, 0.5)),
        url('/textures/kraft-paper.jpg');
    background-size: cover, 920px 920px;
    background-repeat: no-repeat, repeat;
}

.layout--about,
.layout--essays,
.layout--archive,
.layout--blog {
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
    transition: clip-path 900ms cubic-bezier(0.76, 0, 0.24, 1);
    will-change: clip-path;
}

.layout--article-returning::before {
    transition-duration: 1250ms;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.layout--about::after,
.layout--essays::after,
.layout--archive::after,
.layout--blog::after {
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

.layout--blog {
    --pattern-image: url('/textures/leaf-weave.webp');
}

.layout--about::before,
.layout--essays::before,
.layout--archive::before,
.layout--blog::before {
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

.layout--blog::before,
.layout--article-opening::before {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
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
    position: relative;
    width: min(100%, 1080px);
    margin: 0 auto;
    padding-inline: clamp(20px, 4vw, 48px);
}

.layout-content--explore {
    padding-inline: 0;
}

</style>

<style lang="scss">
.archive-article-leave-active {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    transform-origin: left bottom;
    transition: opacity 520ms ease, transform 900ms cubic-bezier(0.76, 0, 0.24, 1);
    will-change: opacity, transform;
}

.archive-article-leave-to {
    opacity: 0;
    transform: translate(26vw, -20vh) rotate(-6deg);
}

.archive-article-enter-from {
    .blog-surface {
        opacity: 0;
        transform: translate(-18vw, calc(24vh + var(--route-transition-scroll-offset, 0px))) rotate(6deg);
    }
}

.archive-article-enter-active {
    backface-visibility: hidden;

    .blog-surface {
        backface-visibility: hidden;
        transform-origin: left bottom;
        transition:
            opacity 650ms 80ms ease,
            transform 900ms 80ms cubic-bezier(0.76, 0, 0.24, 1);
        will-change: opacity, transform;
    }
}

.archive-article-enter-to {
    .blog-surface {
        opacity: 1;
        transform: translate(0, var(--route-transition-scroll-offset, 0px)) rotate(0);
    }
}

.article-archive-leave-active {
    // Blog.vue gives its root a scoped `position: relative`; force the leaving
    // page out of document flow so the archive can animate at the viewport top.
    position: absolute !important;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    transform-origin: left bottom;
    transition:
        opacity 340ms ease,
        transform 900ms cubic-bezier(0.76, 0, 0.24, 1);
    will-change: opacity, transform;
}

.article-archive-leave-to {
    opacity: 0;
    transform: translate(-18vw, 24vh) rotate(6deg);
}

.article-archive-enter-active {
    position: relative;
    z-index: 3;
    backface-visibility: hidden;
    transform: translateY(var(--route-transition-return-offset, 0px));
}

.article-archive-enter-from .page-heading,
.article-archive-enter-from .archive-year {
    opacity: 0;
    transform: translate3d(18vw, -8vh, 0) rotate(-3deg);
}

.article-archive-enter-active .page-heading,
.article-archive-enter-active .archive-year {
    transform-origin: left center;
    transition:
        opacity 1050ms ease,
        transform 1250ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
}

.article-archive-enter-active .archive-year {
    transition-delay: 0ms, 0ms;
}

.article-archive-enter-to .page-heading,
.article-archive-enter-to .archive-year {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotate(0);
}

@media (prefers-reduced-motion: reduce) {
    .layout::before,
    .archive-article-leave-active,
    .archive-article-enter-active .blog-surface,
    .article-archive-leave-active,
    .article-archive-enter-active,
    .article-archive-enter-active .page-heading,
    .article-archive-enter-active .archive-year {
        animation-duration: 1ms !important;
        animation-delay: 0ms !important;
        transition-duration: 1ms !important;
        transition-delay: 0ms !important;
    }
}
</style>
