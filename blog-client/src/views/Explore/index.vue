<script setup>
import LinksPage from '@/views/Links/index.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const returnHome = () => router.push('/')
const props = defineProps({
    preview: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <section class="explore-page" aria-labelledby="explore-title">
        <header class="page-heading">
            <p>EXPLORE</p>
            <h1 id="explore-title">探索</h1>
        </header>
        <section id="links" class="explore-links" aria-label="友链">
            <LinksPage />
        </section>
    </section>
    <button
        v-if="!preview"
        class="explore-return"
        type="button"
        aria-label="返回首页"
        @click="returnHome"
    >
        <svg class="explore-return__arrow" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    </button>
</template>

<style scoped>
.explore-page {
    width: min(100%, 1080px);
    min-height: 100%;
    margin: 0 auto;
    padding: clamp(48px, 8vw, 96px) clamp(20px, 4vw, 48px);
    color: var(--black);
}

.page-heading {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.page-heading p {
    margin: 0;
    color: var(--quote-color);
    font-size: 0.75rem;
    letter-spacing: 0.24em;
    line-height: 1;
}

.page-heading h1 {
    width: max-content;
    margin-top: 8px;
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 4vw, 3.5rem);
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;
    white-space: nowrap;
}

.explore-links :deep(.link-container) {
    min-height: 0;
    background: transparent;
}

.explore-links :deep(.links) {
    padding-top: 0;
}

.explore-links :deep(.link-item) {
    --links-background: rgba(255, 250, 239, 0.16);
    --border-color: rgba(255, 255, 255, 0.52);
    --link-mask-z: 2;
    --link-mask-start: rgba(255, 250, 239, 0.08);
    --link-mask-soft: rgba(255, 250, 239, 0.18);
    --link-mask-middle: rgba(255, 250, 239, 0.32);
    --link-mask-end: rgba(255, 250, 239, 0.4);
    --link-image-z: 1;
    --link-image-opacity: 0.52;
    --link-motion-z: 4;
    background-image: linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.3) 0%,
        rgba(255, 255, 255, 0.06) 48%,
        rgba(218, 230, 234, 0.12) 100%
    );
    box-shadow:
        inset 1px 1px rgba(255, 255, 255, 0.7),
        inset -1px -1px rgba(87, 69, 48, 0.16),
        0 8px 24px rgba(87, 69, 48, 0.1),
        0 2px 5px rgba(87, 69, 48, 0.05);
    backdrop-filter: blur(14px) saturate(1.18);
    -webkit-backdrop-filter: blur(14px) saturate(1.18);
}

/* 磨砂覆盖头像，文字和交互内容仍在上层保持清晰。 */
.explore-links :deep(.link-item::before) {
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
}

.explore-links :deep(.link-item::after) {
    content: "";
    position: absolute;
    z-index: 3;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.22),
        rgba(255, 255, 255, 0.04) 38%,
        transparent 58%
    );
    box-shadow:
        inset 0 1px rgba(255, 255, 255, 0.8),
        inset 1px 0 rgba(255, 255, 255, 0.36),
        inset 0 -1px rgba(87, 69, 48, 0.12);
    pointer-events: none;
}

.explore-return {
    position: fixed;
    z-index: 10;
    top: 50%;
    right: 0;
    display: grid;
    place-items: center;
    width: clamp(42px, 3.5vw, 48px);
    aspect-ratio: 1;
    padding: 0;
    overflow: visible;
    color: #ffffff;
    background: #263846;
    border: 1px solid #263846;
    border-radius: 0;
    cursor: pointer;
    transform: translate(50%, -50%) rotate(45deg);
}

.explore-return__arrow {
    position: absolute;
    top: calc(50% + 7px);
    left: calc(50% - 7px);
    width: 21px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: translate(-50%, -50%) rotate(-45deg);
}

.explore-return__arrow line {
    transform: translateX(16px) scaleX(0);
    transform-origin: right center;
    transition: transform 300ms ease-in-out;
}

.explore-return__arrow polyline {
    transition: transform 300ms ease-in-out;
}

.explore-return:hover .explore-return__arrow line,
.explore-return:focus-visible .explore-return__arrow line {
    transform: translateX(4px) scaleX(1);
}

.explore-return:hover .explore-return__arrow polyline,
.explore-return:focus-visible .explore-return__arrow polyline {
    transform: translateX(4px);
}

.explore-return:focus-visible {
    outline: 2px solid #263846;
    outline-offset: 3px;
}
</style>
