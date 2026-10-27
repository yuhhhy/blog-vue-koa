<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import AboutPage from '@/views/About/index.vue'
import EssaysPage from '@/views/Essays/index.vue'
import ArchivePage from '@/views/Archive/index.vue'

const router = useRouter()
const homeSections = ref(null)
const hoveredSection = ref('')
const selectedSection = ref('')
const animationSettled = ref(false)

const sectionRoutes = {
    about: '/about',
    essays: '/essays',
    archive: '/archive',
}

const previewSection = (section) => {
    if (!selectedSection.value) hoveredSection.value = section
}

const clearPreview = (section) => {
    if (!selectedSection.value && hoveredSection.value === section) hoveredSection.value = ''
}

const sectionState = (section) => ({
    'is-hovered': !selectedSection.value && hoveredSection.value === section,
    'is-selected': selectedSection.value === section,
})

const waitForNextPaint = () => new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
})

const waitForPanelAnimation = (section, reduceMotion) => {
    if (reduceMotion) return Promise.resolve()

    const panel = homeSections.value?.querySelector(`.home-section--${section}`)
    if (!panel) return Promise.resolve()

    const eventName = section === 'essays' ? 'animationend' : 'transitionend'

    return new Promise((resolve) => {
        let timeoutId

        const finish = () => {
            window.clearTimeout(timeoutId)
            panel.removeEventListener(eventName, handleEnd)
            resolve()
        }

        const handleEnd = (event) => {
            if (event.target !== panel) return
            if (eventName === 'transitionend' && event.propertyName !== 'clip-path') return
            finish()
        }

        panel.addEventListener(eventName, handleEnd)
        timeoutId = window.setTimeout(finish, 1100)
    })
}

const navigateToSection = async (section) => {
    const navigate = async () => {
        await router.push(sectionRoutes[section])
        await nextTick()
    }

    if (!document.startViewTransition) {
        await navigate()
        return
    }

    document.documentElement.dataset.routeTransition = section

    try {
        const transition = document.startViewTransition(navigate)
        await transition.finished
    } finally {
        delete document.documentElement.dataset.routeTransition
    }
}

const openSection = async (section) => {
    if (selectedSection.value) return

    selectedSection.value = section
    hoveredSection.value = section
    await nextTick()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await waitForPanelAnimation(section, reduceMotion)
    animationSettled.value = true
    await nextTick()
    await waitForNextPaint()
    await navigateToSection(section)
}
</script>

<template>
    <main
        ref="homeSections"
        class="home-sections"
        :class="[
            selectedSection ? `home-sections--${selectedSection}` : '',
            { 'is-settled': animationSettled },
        ]"
        aria-label="首页分区"
    >
        <section
            class="home-section home-section--about"
            :class="sectionState('about')"
            aria-labelledby="home-about-title"
            role="link"
            tabindex="0"
            @mouseenter="previewSection('about')"
            @mouseleave="clearPreview('about')"
            @focus="previewSection('about')"
            @blur="clearPreview('about')"
            @click="openSection('about')"
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
            aria-labelledby="home-essays-title"
            role="link"
            tabindex="0"
            @mouseenter="previewSection('essays')"
            @mouseleave="clearPreview('essays')"
            @focus="previewSection('essays')"
            @blur="clearPreview('essays')"
            @click="openSection('essays')"
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
            aria-labelledby="home-archive-title"
            role="link"
            tabindex="0"
            @mouseenter="previewSection('archive')"
            @mouseleave="clearPreview('archive')"
            @focus="previewSection('archive')"
            @blur="clearPreview('archive')"
            @click="openSection('archive')"
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
    </main>
</template>

<style scoped>
.home-sections {
    --about-block: #f3d2dd;
    --essays-block: #c8e4f3;
    --archive-block: #d9e9cb;
    --black: #263846;
    --dark: #263846;
    --light-dark: #354b56;
    --quote-color: #526976;
    --blue: #263846;
    --skyblue: #3e7181;
    --b-color: #263846;
    --page-title-left: calc(max(0px, 50vw - 540px) + clamp(20px, 4vw, 48px));
    --page-title-top: calc(clamp(48px, 8vw, 96px) + 20px);

    position: fixed;
    isolation: isolate;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background-color: var(--essays-block);
}

.home-section {
    position: absolute;
    inset: 0;
    color: #263846;
    background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.3), transparent 45%, rgba(71, 55, 55, 0.08));
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
    background-size: 320px 320px;
    background-repeat: repeat;
    opacity: 0.05;
    mix-blend-mode: multiply;
    pointer-events: none;
}

.home-section.is-hovered {
    background-color: #fafcf9;
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

.home-section.is-selected::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    background-color: #fafcf9;
    background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.3), transparent 45%, rgba(71, 55, 55, 0.08));
    pointer-events: none;
}

.home-section.is-selected::after {
    z-index: 1;
}

.home-section--about.is-selected::before {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 50%);
}

.home-section--essays.is-selected::before {
    clip-path: polygon(100% 0, 0 50%, 0 50%, 100% 100%);
}

.home-section--archive.is-selected::before {
    clip-path: polygon(0 50%, 100% 100%, 100% 100%, 0 100%);
}

.home-section--about {
    --pattern-image: url('/textures/sakura-weave.webp');
    background-color: var(--about-block);
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 50%);
}

.home-section--about > h1 {
    top: 10%;
    left: 5%;
}

.home-section--essays {
    --pattern-image: url('/textures/cloud-weave.webp');
    background-color: var(--essays-block);
    clip-path: polygon(100% 0, 0 50%, 0 50%, 100% 100%);
}

.home-section--essays > h1 {
    top: 33%;
    left: 48%;
}

.home-section--archive {
    --pattern-image: url('/textures/leaf-weave.webp');
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
    transform: translate(0, 0);
    view-transition-name: section-title;
}

.home-section--about.is-selected > h1 {
    top: 60px;
}

.home-sections--about .home-section--about {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.home-sections--about .home-section--essays {
    clip-path: polygon(100% 100%, 0 100%, 0 100%, 100% 100%);
}

.home-sections--about .home-section--archive {
    clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
}

.home-sections--essays .home-section--about {
    z-index: 1;
    animation: essays-about-follow 900ms cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

.home-sections--essays .home-section--essays {
    z-index: 2;
    animation: essays-expand 900ms cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

.home-sections--essays .home-section--archive {
    z-index: 1;
    animation: essays-archive-follow 900ms cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

.home-sections--archive .home-section--about {
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
}

.home-sections--archive .home-section--essays {
    clip-path: polygon(100% 0, 0 0, 0 0, 100% 0);
}

.home-sections--archive .home-section--archive {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.home-sections[class*="home-sections--"] .home-section:not(.is-selected) > h1 {
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
    padding-inline: clamp(20px, 4vw, 48px);
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

@keyframes essays-about-follow {
    from {
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 50%);
    }

    to {
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
    }
}

@keyframes essays-expand {
    from {
        clip-path: polygon(100% 0, 0 50%, 100% 100%, 100% 100%);
    }

    to {
        clip-path: polygon(100% 0, 0 0, 0 100%, 100% 100%);
    }
}

@keyframes essays-archive-follow {
    from {
        clip-path: polygon(0 50%, 100% 100%, 100% 100%, 0 100%);
    }

    to {
        clip-path: polygon(0 0, 0 100%, 100% 100%, 0 100%);
    }
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
    .home-sections,
    .home-section,
    .home-section > h1,
    .home-content-preview {
        transition-duration: 1ms;
        animation-duration: 1ms;
    }
}
</style>
