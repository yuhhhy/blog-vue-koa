<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AboutPage from '@/views/About/index.vue'
import EssaysPage from '@/views/Essays/index.vue'
import ArchivePage from '@/views/Archive/index.vue'
import ExplorePage from '@/views/Explore/index.vue'
import {
    createSectionTransitionController,
    sectionByRouteName,
    waitForVisualWork,
} from '@/utils/sectionRouteTransition.js'

const emit = defineEmits(['scene-active'])
const router = useRouter()
const route = useRoute()
const homeSections = ref(null)
const homeTrack = ref(null)
const explorePreviewScrollTop = ref(0)
const sceneVisible = ref(route.name === 'Home')
const exploreTrackOpen = ref(route.name === 'Explore')
const hoveredSection = ref('')
const selectedSection = ref(sectionByRouteName[route.name] || '')
const returningSection = ref('')
const colorRestoringSection = ref('')
const isColorRestoreActive = ref(false)
const animationSettled = ref(Boolean(selectedSection.value))
const isReturnStaged = ref(false)
const titleStyles = ref({})
const colorFrozen = ref(false)
const sectionNames = ['about', 'essays', 'archive']
const colorOpacities = ref(Object.fromEntries(
    sectionNames.map((section) => [section, selectedSection.value === section ? 1 : 0]),
))
const sectionStyle = (section) => ({
    ...titleStyles.value[section],
    '--section-white-opacity': colorOpacities.value[section],
})
const isExploreOpen = computed(() => route.name === 'Explore')
const isPageReturn = computed(() => Boolean(
    selectedSection.value || returningSection.value || sectionByRouteName[route.name],
))
let pressedSection = null

const sectionRoutes = { about: '/about', essays: '/essays', archive: '/archive' }
const openExplore = () => router.push('/explore')
const returnHome = () => router.push('/')
const toggleHome = () => isPageReturn.value ? returnHome() : openExplore()
const closeExplore = () => {
    returnHome()
}

const previewSection = (section) => {
    if (!colorFrozen.value && !selectedSection.value && !returningSection.value && !colorRestoringSection.value) {
        hoveredSection.value = section
        colorOpacities.value[section] = 1
    }
}
const clearPreview = (section) => {
    if (!selectedSection.value && hoveredSection.value === section) {
        hoveredSection.value = ''
        colorOpacities.value[section] = 0
    }
}
const sectionState = (section) => ({
    'is-hovered': !selectedSection.value && !returningSection.value
        && !colorRestoringSection.value && hoveredSection.value === section,
    'is-selected': selectedSection.value === section,
    'is-returning': returningSection.value === section,
    'is-color-restoring': colorRestoringSection.value === section,
    'is-color-restoring-active': colorRestoringSection.value === section && isColorRestoreActive.value,
})

// Capture the pressed panel: clip-paths can move beneath the pointer before
// release. A gesture cannot become a click on a different moving panel.
const pressSection = (section, event) => {
    if (!event.isPrimary || event.button !== 0) return
    pressedSection = { section, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
}
const openSection = (section, event) => {
    if (event?.type === 'click' && event.detail !== 0) {
        const press = pressedSection
        pressedSection = null
        if (!press || press.section !== section
            || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) return
    }
    // Submit the intent immediately. There are no delayed router.push callbacks.
    return router.push(sectionRoutes[section])
}

const setSceneVisible = (visible) => {
    if (visible) {
        emit('scene-active', true)
        sceneVisible.value = true
        return
    }

    // Hide the fixed proxy before restoring document scrolling. Otherwise the
    // native scrollbar can resize the still-visible proxy for one frame.
    sceneVisible.value = false
    nextTick(() => {
        if (!sceneVisible.value) emit('scene-active', false)
    })
}
const nextPaint = (signal) => waitForVisualWork(new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
}), signal)

const waitForGeometry = async (signal) => {
    await waitForVisualWork(nextTick(), signal)
    // getAnimations flushes styles and returns the *current* transitions, including
    // their shortened reverse durations. Aborting work leaves CSS at its live pose.
    const animations = homeSections.value?.getAnimations({ subtree: true }).filter(
        (animation) => ['clip-path', 'transform', 'top', 'left', 'width', 'font-size']
            .includes(animation.transitionProperty),
    ) || []
    await waitForVisualWork(Promise.allSettled(animations.map((a) => a.finished)), signal)
}

const waitForTrackTransition = async (signal) => {
    await waitForVisualWork(nextTick(), signal)
    const animation = homeTrack.value?.getAnimations().find(
        (current) => current.transitionProperty === 'transform',
    )
    if (animation) {
        await waitForVisualWork(animation.finished, signal)
        return
    }
    // A transition can be absent when the browser has already settled the
    // class change; still yield a paint before handing off the route content.
    await nextPaint(signal)
}

const syncExplorePreviewScroll = () => {
    explorePreviewScrollTop.value = window.scrollY
}

const alignPageTitle = (section) => {
    const heading = document.querySelector('[data-route-content] .page-heading h1')
    if (!heading || !section) return
    const bounds = heading.getBoundingClientRect()
    titleStyles.value[section] = {
        '--page-title-left': `${bounds.left}px`,
        '--page-title-top': `${bounds.top + window.scrollY}px`,
        '--page-title-size': getComputedStyle(heading).fontSize,
    }
}

const freezeSectionColors = () => {
    for (const section of sectionNames) {
        const panel = homeSections.value?.querySelector(`.home-section--${section}`)
        if (panel) colorOpacities.value[section] = Number(getComputedStyle(panel, '::before').opacity)
    }
    colorFrozen.value = true
}

const finishSectionColors = async (target, source, signal) => {
    colorRestoringSection.value = source || target
    isColorRestoreActive.value = false
    colorFrozen.value = false
    await waitForVisualWork(nextTick(), signal)
    await nextPaint(signal)
    // The caller has awaited all geometric motion. Only now change color.
    isColorRestoreActive.value = true
    for (const section of sectionNames) colorOpacities.value[section] = section === target ? 1 : 0
    await waitForVisualWork(nextTick(), signal)
    const animations = homeSections.value?.getAnimations({ subtree: true }).filter(
        (animation) => animation.transitionProperty === 'opacity',
    ) || []
    await waitForVisualWork(Promise.allSettled(animations.map((a) => a.finished)), signal)
    colorRestoringSection.value = ''
    isColorRestoreActive.value = false
}

const renderRoute = async (targetName, sourceName, signal) => {
    const target = sectionByRouteName[targetName] || ''
    const source = sectionByRouteName[sourceName] || ''
    const targetExplore = targetName === 'Explore'
    const sourceExplore = sourceName === 'Explore'
    const isSceneRoute = (name) => name === 'Home' || name === 'Explore' || sectionByRouteName[name]

    // Preserve even a partially-hovered/fading color while redirecting motion.
    freezeSectionColors()
    hoveredSection.value = ''
    colorRestoringSection.value = ''
    isColorRestoreActive.value = false

    // Full document loads and navigation from unrelated pages land directly.
    if (!isSceneRoute(targetName) || !isSceneRoute(sourceName)) {
        selectedSection.value = target
        returningSection.value = ''
        animationSettled.value = Boolean(target)
        for (const section of sectionNames) colorOpacities.value[section] = section === target ? 1 : 0
        colorFrozen.value = false
        isReturnStaged.value = false
        exploreTrackOpen.value = targetExplore
        setSceneVisible(targetName === 'Home')
        return
    }

    if (!sceneVisible.value) {
        // Restore the last stable section before painting a return. This scene
        // stays mounted, so no KeepAlive activation or pending-return queue exists.
        selectedSection.value = source
        returningSection.value = ''
        animationSettled.value = Boolean(source)
        isReturnStaged.value = true
        exploreTrackOpen.value = sourceExplore
        setSceneVisible(true)
        await waitForVisualWork(nextTick(), signal)
        if (targetExplore || sourceExplore) {
            syncExplorePreviewScroll()
        }
        await nextPaint(signal)
    } else {
        setSceneVisible(true)
        if (targetExplore || sourceExplore) {
            syncExplorePreviewScroll()
        }
    }

    isReturnStaged.value = false
    animationSettled.value = false
    await waitForVisualWork(nextTick(), signal)
    exploreTrackOpen.value = targetExplore
    await waitForVisualWork(nextTick(), signal)
    alignPageTitle(target)

    const previous = selectedSection.value || returningSection.value
    if (previous && previous !== target) {
        returningSection.value = previous
        selectedSection.value = ''
        await waitForGeometry(signal)
        if (!target) {
            returningSection.value = ''
            await Promise.all([
                waitForTrackTransition(signal),
                finishSectionColors('', previous, signal),
            ])
            if (targetName === 'Explore') {
                animationSettled.value = true
                await waitForVisualWork(nextTick(), signal)
                await nextPaint(signal)
                setSceneVisible(false)
            }
            return
        }
        returningSection.value = ''
    }

    if (!target) {
        selectedSection.value = ''
        returningSection.value = ''
        await Promise.all([
            waitForTrackTransition(signal),
            finishSectionColors('', '', signal),
        ])
        if (targetName === 'Explore') {
            animationSettled.value = true
            await waitForVisualWork(nextTick(), signal)
            await nextPaint(signal)
            setSceneVisible(false)
        }
        return
    }

    // Re-selecting the returning section reverses the live CSS transition.
    returningSection.value = ''
    selectedSection.value = target
    // Leaving the home page starts the white overlay with the panel motion.
    // Returning to home keeps the existing end-of-motion color restore above.
    if (target && !previous) {
        const colorTransition = finishSectionColors(target, previous, signal)
        await waitForGeometry(signal)
        await colorTransition
    } else {
        await waitForGeometry(signal)
        await finishSectionColors(target, previous, signal)
    }
    animationSettled.value = true
    await waitForVisualWork(nextTick(), signal)
    await nextPaint(signal)
    // Only this request can hand over to the already-confirmed RouterView.
    setSceneVisible(false)
}

const transitions = createSectionTransitionController(renderRoute, (error) => {
    console.error('Section transition failed', error)
    selectedSection.value = sectionByRouteName[route.name] || ''
    returningSection.value = ''
    isReturnStaged.value = false
    animationSettled.value = Boolean(selectedSection.value)
    colorFrozen.value = false
    for (const section of sectionNames) colorOpacities.value[section] = selectedSection.value === section ? 1 : 0
    setSceneVisible(route.name === 'Home')
})

watch(() => route.name, (target, source) => transitions.run(target, source))
onMounted(() => alignPageTitle(selectedSection.value))
onBeforeUnmount(() => transitions.cancel())
</script>

<template>
    <div v-show="sceneVisible" class="home-viewport" :data-scene-target="route.name">
        <div ref="homeTrack" class="home-track" :class="{ 'is-explore-open': exploreTrackOpen }">
            <section
                class="explore-screen"
                aria-label="探索页"
                :aria-hidden="!isExploreOpen"
                :inert="!isExploreOpen"
            >
                <div
                    class="explore-preview"
                    :style="{ '--explore-preview-scroll-top': `${explorePreviewScrollTop}px` }"
                >
                    <ExplorePage preview />
                </div>
                <button
                    class="screen-toggle screen-toggle--return"
                    type="button"
                    aria-label="返回首页"
                    @click="closeExplore"
                >
                    <svg class="screen-toggle__arrow screen-toggle__arrow--right" viewBox="0 0 24 24" aria-hidden="true">
                        <line class="screen-toggle__shaft" x1="5" y1="12" x2="19" y2="12" />
                        <polyline class="screen-toggle__head" points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </section>
            <main
                ref="homeSections"
                class="home-sections"
                :class="[
                    selectedSection ? `home-sections--${selectedSection}` : '',
                    returningSection ? `home-sections--${returningSection}-returning` : '',
                    {
                        'is-settled': animationSettled,
                        'is-return-staged': isReturnStaged,
                        'is-color-frozen': colorFrozen,
                    },
                ]"
                aria-label="首页分区"
                :aria-hidden="isExploreOpen"
                :inert="isExploreOpen"
            >
                <section
                    class="home-section home-section--about"
                    :class="sectionState('about')"
                    :style="sectionStyle('about')"
                    aria-labelledby="home-about-title"
                    role="link"
                    tabindex="0"
                    @mouseenter="previewSection('about')"
                    @mouseleave="clearPreview('about')"
                    @focus="previewSection('about')"
                    @blur="clearPreview('about')"
                    @pointerdown="pressSection('about', $event)"
                    @pointercancel="pressedSection = null"
                    @click="openSection('about', $event)"
                    @keydown.enter.prevent="openSection('about')"
                    @keydown.space.prevent="openSection('about')"
                >
                    <h1 id="home-about-title">
                        <span>关于</span>
                    </h1>
                    <div class="home-content-preview" aria-hidden="true" inert>
                        <div class="home-content-preview__layout">
                            <AboutPage preview />
                        </div>
                    </div>
                </section>
                <section
                    class="home-section home-section--essays"
                    :class="sectionState('essays')"
                    :style="sectionStyle('essays')"
                    aria-labelledby="home-essays-title"
                    role="link"
                    tabindex="0"
                    @mouseenter="previewSection('essays')"
                    @mouseleave="clearPreview('essays')"
                    @focus="previewSection('essays')"
                    @blur="clearPreview('essays')"
                    @pointerdown="pressSection('essays', $event)"
                    @pointercancel="pressedSection = null"
                    @click="openSection('essays', $event)"
                    @keydown.enter.prevent="openSection('essays')"
                    @keydown.space.prevent="openSection('essays')"
                >
                    <h1 id="home-essays-title">
                        <span>随笔</span>
                    </h1>
                    <div class="home-content-preview" aria-hidden="true" inert>
                        <div class="home-content-preview__layout">
                            <EssaysPage />
                        </div>
                    </div>
                </section>
                <section
                    class="home-section home-section--archive"
                    :class="sectionState('archive')"
                    :style="sectionStyle('archive')"
                    aria-labelledby="home-archive-title"
                    role="link"
                    tabindex="0"
                    @mouseenter="previewSection('archive')"
                    @mouseleave="clearPreview('archive')"
                    @focus="previewSection('archive')"
                    @blur="clearPreview('archive')"
                    @pointerdown="pressSection('archive', $event)"
                    @pointercancel="pressedSection = null"
                    @click="openSection('archive', $event)"
                    @keydown.enter.prevent="openSection('archive')"
                    @keydown.space.prevent="openSection('archive')"
                >
                    <h1 id="home-archive-title">
                        <span>归档</span>
                    </h1>
                    <div class="home-content-preview" aria-hidden="true" inert>
                        <div class="home-content-preview__layout">
                            <ArchivePage />
                        </div>
                    </div>
                </section>
                <button
                    class="screen-toggle screen-toggle--explore"
                    :class="{ 'is-page-return': selectedSection }"
                    type="button"
                    :aria-label="isPageReturn ? '返回首页' : '前往探索页'"
                    @click.stop="toggleHome"
                >
                    <svg class="screen-toggle__arrow screen-toggle__arrow--left" viewBox="0 0 24 24" aria-hidden="true">
                        <line class="screen-toggle__shaft" x1="19" y1="12" x2="5" y2="12" />
                        <polyline class="screen-toggle__head" points="12 5 5 12 12 19" />
                    </svg>
                </button>
            </main>
        </div>
    </div>
</template>

<style scoped>
.home-viewport {
    position: fixed;
    z-index: 30;
    inset: 0;
    overflow: hidden;
    background: var(--page-background);
}

.home-track {
    display: flex;
    width: 200%;
    height: 100vh;
    height: 100dvh;
    transform: translateX(-50%);
    transition: transform 950ms cubic-bezier(0.76, 0, 0.24, 1);
    will-change: transform;
}

.home-track.is-explore-open {
    transform: translateX(0);
}

.explore-screen,
.home-sections {
    flex: 0 0 50%;
    width: 50%;
    height: 100vh;
    height: 100dvh;
}

.explore-screen {
    position: relative;
    overflow: hidden;
    color: var(--black);
    background-color: var(--page-explore-background);
    background-image:
        linear-gradient(var(--paper-overlay), var(--paper-overlay)),
        url('../../assets/textures/kraft-paper.webp');
    background-size: cover, 920px 920px;
    background-repeat: no-repeat, repeat;
    overscroll-behavior: contain;
}

.explore-preview {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.explore-preview :deep(.explore-page) {
    transform: translateY(calc(-1 * var(--explore-preview-scroll-top)));
}

.screen-toggle {
    position: absolute;
    z-index: 10;
    top: 50%;
    display: grid;
    place-items: center;
    width: clamp(42px, 3.5vw, 48px);
    aspect-ratio: 1;
    padding: 0;
    overflow: visible;
    color: var(--control-text);
    background: var(--control-background);
    border: 1px solid var(--control-background);
    border-radius: 0;
    cursor: pointer;
}

.screen-toggle--explore {
    left: 0;
    overflow: hidden;
    transform: translate(-50%, -50%) rotate(45deg);
    transition:
        width 900ms cubic-bezier(0.76, 0, 0.24, 1),
        top 900ms cubic-bezier(0.76, 0, 0.24, 1),
        transform 900ms cubic-bezier(0.76, 0, 0.24, 1);
}

.screen-toggle--explore.is-page-return {
    top: 0;
    width: clamp(59.4px, 4.95vw, 67.9px);
    transform: translate(-50%, -50%) rotate(405deg);
    view-transition-name: home-corner-return;
}

.screen-toggle--return {
    right: 0;
    transform: translate(50%, -50%) rotate(45deg);
}

.screen-toggle svg {
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.screen-toggle__arrow {
    position: absolute;
    width: 21px;
    transform: translate(-50%, -50%) rotate(-45deg);
    transition:
        top 900ms cubic-bezier(0.76, 0, 0.24, 1),
        left 900ms cubic-bezier(0.76, 0, 0.24, 1),
        transform 900ms cubic-bezier(0.76, 0, 0.24, 1);
}

.screen-toggle__arrow--left {
    top: calc(50% - 7px);
    left: calc(50% + 7px);
}

.screen-toggle__arrow--right {
    top: calc(50% + 7px);
    left: calc(50% - 7px);
}

.screen-toggle--explore.is-page-return .screen-toggle__arrow--left {
    top: 50%;
    left: 83.333%;
    transform: translate(-50%, -50%);
}

.screen-toggle__shaft,
.screen-toggle__head {
    transition: transform 300ms ease-in-out;
}

.screen-toggle__arrow--right .screen-toggle__shaft {
    transform: translateX(16px) scaleX(0);
    transform-origin: right center;
}

.screen-toggle__arrow--left .screen-toggle__shaft {
    transform: translateX(-16px) scaleX(0);
    transform-origin: left center;
}

.screen-toggle:hover .screen-toggle__arrow--right .screen-toggle__shaft,
.screen-toggle:focus-visible .screen-toggle__arrow--right .screen-toggle__shaft,
.screen-toggle:hover .screen-toggle__arrow--right .screen-toggle__head,
.screen-toggle:focus-visible .screen-toggle__arrow--right .screen-toggle__head {
    transform: translateX(4px) scaleX(1);
}

.screen-toggle:hover .screen-toggle__arrow--left .screen-toggle__shaft,
.screen-toggle:focus-visible .screen-toggle__arrow--left .screen-toggle__shaft,
.screen-toggle:hover .screen-toggle__arrow--left .screen-toggle__head,
.screen-toggle:focus-visible .screen-toggle__arrow--left .screen-toggle__head {
    transform: translateX(-4px) scaleX(1);
}

.screen-toggle:focus-visible {
    outline: 2px solid var(--control-background);
    outline-offset: 3px;
}

.home-sections {
    --about-block: var(--page-about-background);
    --essays-block: var(--page-essays-background);
    --archive-block: var(--page-archive-background);
    --white: var(--section-surface);
    --light: var(--section-surface);
    --black: var(--section-text);
    --dark: var(--section-text);
    --light-dark: var(--section-body);
    --quote-color: var(--section-muted);
    --border-color: var(--section-border);
    --blue: var(--section-text);
    --skyblue: var(--section-link);
    --b-color: var(--section-text);
    --page-title-left: calc(max(0px, 50vw - 540px) + clamp(20px, 4vw, 48px));
    --page-title-top: calc(clamp(48px, 8vw, 96px) + 20px);

    position: relative;
    isolation: isolate;
    top: 0;
    left: 0;
    width: 50%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background-color: var(--essays-block);
}

.home-section {
    position: absolute;
    inset: 0;
    color: var(--section-text);
    background-image: var(--section-gradient);
    cursor: pointer;
    transform: translate(0) rotate(0) scale(1);
    transform-origin: 0 50%;
    transition:
        clip-path 900ms cubic-bezier(0.76, 0, 0.24, 1),
        transform 900ms cubic-bezier(0.76, 0, 0.24, 1),
        opacity 900ms ease,
        background-color 300ms ease,
        filter 300ms ease;
    will-change: clip-path, transform, opacity;
}

.home-section::after {
    content: "";
    position: absolute;
    z-index: 0;
    inset: 0;
    background-image: var(--pattern-image);
    background-position: 0 0;
    background-size: var(--pattern-size, 320px 320px);
    background-repeat: repeat;
    opacity: var(--pattern-opacity);
    mix-blend-mode: var(--pattern-blend-mode);
    pointer-events: none;
}

.home-section.is-hovered {
    filter: none;
}

.home-section.is-hovered > h1 {
    transform: translateY(-50%) scale(1.06);
}

.home-section > h1 {
    position: absolute;
    z-index: 3;
    width: max-content;
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 4vw, 3.5rem);
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;
    white-space: nowrap;
    transform: translateY(-50%);
    transform-origin: left center;
    transition:
        top 900ms cubic-bezier(0.76, 0, 0.24, 1),
        left 900ms cubic-bezier(0.76, 0, 0.24, 1),
        font-size 900ms cubic-bezier(0.76, 0, 0.24, 1),
        transform 900ms cubic-bezier(0.76, 0, 0.24, 1),
        opacity 300ms ease;
}

.home-section::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    background-color: var(--section-surface);
    background-image: var(--section-gradient);
    opacity: var(--section-white-opacity, 0);
    transition: opacity 500ms ease;
    pointer-events: none;
}

.home-sections.is-color-frozen .home-section::before,
.home-sections.is-return-staged .home-section::before {
    transition: none;
}

.home-section::after {
    z-index: 1;
}

.home-section--about::before {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 50%);
}

.home-section--essays::before {
    clip-path: polygon(100% 0, 0 50%, 0 50%, 100% 100%);
}

.home-section--archive::before {
    clip-path: polygon(0 50%, 100% 100%, 100% 100%, 0 100%);
}

.home-section--about {
    --pattern-image: url('../../assets/textures/sakura-weave.webp');
    --pattern-size: 160px 160px;
    background-color: var(--about-block);
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 50%);
}

.home-section--about > h1 {
    top: 10%;
    left: 5%;
}

.home-section--essays {
    --pattern-image: url('../../assets/textures/cloud-weave.webp');
    --pattern-size: 175px 172px;
    background-color: var(--essays-block);
    /* Duplicate the bottom-right vertex, as in the original essays-expand
       keyframe. Its travel along the bottom edge creates the rotating reveal;
       duplicating the left vertex instead makes both edges widen symmetrically. */
    clip-path: polygon(100% 0, 0 50%, 100% 100%, 100% 100%);
}

.home-section--essays > h1 {
    top: 33%;
    left: 48%;
}

.home-section--archive {
    --pattern-image: url('../../assets/textures/leaf-weave.webp');
    --pattern-size: 320px 320px;
    background-color: var(--archive-block);
    clip-path: polygon(0 50%, 100% 100%, 100% 100%, 0 100%);
}

.home-section--archive > h1 {
    top: 68%;
    left: 10%;
}

.home-section.is-selected > h1 {
    top: var(--page-title-top);
    left: var(--page-title-left);
    color: var(--dark);
    font-size: var(--page-title-size, clamp(1.75rem, 4vw, 3.5rem));
    transform: translate(0, 0);
    view-transition-name: section-title;
}

.home-section--about.is-selected > h1 {
    top: var(--page-title-top, 60px);
}

.home-sections--about .home-section--about {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.home-sections--about .home-section--essays {
    clip-path: polygon(100% 100%, 0 100%, 100% 100%, 100% 100%);
}

.home-sections--about .home-section--archive {
    clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
}

.home-sections--essays .home-section--about {
    z-index: 1;
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
}

.home-sections--essays .home-section--essays {
    z-index: 2;
    clip-path: polygon(100% 0, 0 0, 0 100%, 100% 100%);
}

.home-sections--essays .home-section--archive {
    z-index: 1;
    clip-path: polygon(0 0, 0 100%, 100% 100%, 0 100%);
}

.home-sections--essays-returning .home-section--essays {
    z-index: 2;
}

.home-sections--essays-returning .home-section--about,
.home-sections--essays-returning .home-section--archive {
    z-index: 1;
}

.home-sections--essays.is-return-staged .home-section--about {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
}

.home-sections--essays.is-return-staged .home-section--essays {
    clip-path: polygon(100% 0, 0 0, 0 100%, 100% 100%);
}

.home-sections--essays.is-return-staged .home-section--archive {
    clip-path: polygon(0 0, 0 100%, 100% 100%, 0 100%);
}

.home-sections.is-return-staged .home-section {
    animation: none;
    transition: none;
}

.home-sections.is-return-staged .home-section > h1,
.home-sections.is-return-staged .home-content-preview,
.home-sections.is-return-staged .screen-toggle,
.home-sections.is-return-staged .screen-toggle__arrow {
    transition: none;
}

.home-sections--archive .home-section--about {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
}

.home-sections--archive .home-section--essays {
    clip-path: polygon(100% 0, 0 0, 100% 0, 100% 0);
}

.home-sections--archive .home-section--archive {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.home-sections[class*="home-sections--"]:not([class*="-returning"]) .home-section:not(.is-selected) > h1 {
    opacity: 0;
}

.home-sections.is-settled .home-section:not(.is-selected) {
    visibility: hidden;
}

.home-content-preview {
    --preview-from-x: 0px;
    --preview-from-y: 0px;

    position: absolute;
    z-index: 2;
    inset: 0;
    pointer-events: none;
    cursor: default;
    transform: translate(var(--preview-from-x), var(--preview-from-y));
    transition: transform 900ms cubic-bezier(0.76, 0, 0.24, 1);
}

.home-section.is-selected .home-content-preview {
    transform: translate(0, 0);
}

.home-content-preview__layout {
    width: min(100%, 1080px);
    margin: 0 auto;
    padding-inline: var(--page-inline-padding);
}

.home-section--about .home-content-preview {
    --preview-from-x: calc(5vw - var(--page-title-left));
    --preview-from-y: calc(18vh - 173px);
}

.home-section--essays .home-content-preview {
    --preview-from-x: calc(48vw - var(--page-title-left));
    --preview-from-y: calc(36vh - 185px);
}

.home-section--archive .home-content-preview {
    --preview-from-x: calc(10vw - var(--page-title-left));
    --preview-from-y: calc(74vh - 185px);
}

.home-content-preview :deep(.page-heading) {
    visibility: hidden;
}

.home-content-preview :deep(.page-heading h1) {
    view-transition-name: none;
}

@media (max-width: 600px) {
    .home-section > h1 {
        font-size: clamp(1.5rem, 7vw, 2.25rem);
    }

    .home-section--about > h1 {
        top: 9%;
        left: 5%;
    }

    .home-section--essays > h1 {
        top: 33%;
        left: 47%;
    }

    .home-section--archive > h1 {
        top: 68%;
        left: 9%;
    }

    .home-section--about .home-content-preview {
        --preview-from-x: calc(5vw - var(--page-title-left));
        --preview-from-y: calc(21vh - 173px);
    }

    .home-section--essays .home-content-preview {
        --preview-from-x: calc(47vw - var(--page-title-left));
        --preview-from-y: calc(44vh - 185px);
    }

    .home-section--archive .home-content-preview {
        --preview-from-x: calc(9vw - var(--page-title-left));
        --preview-from-y: calc(83vh - 185px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .home-track,
    .screen-toggle,
    .screen-toggle__shaft,
    .screen-toggle__head {
        transition-duration: 1ms;
        animation-duration: 1ms;
    }

    .home-sections,
    .home-section,
    .home-section::before,
    .home-section > h1,
    .home-content-preview {
        transition-duration: 1ms;
        animation-duration: 1ms;
    }
}
</style>
