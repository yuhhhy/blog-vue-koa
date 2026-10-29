<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useThemeStore } from '@/stores/themeStore.js'

const themeStore = useThemeStore()
const pulling = ref(false)
let timer
let releaseTimer

const pullCord = () => {
    if (pulling.value) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pulling.value = true
    timer = window.setTimeout(() => themeStore.toggleTheme(), reduceMotion ? 0 : 180)
    releaseTimer = window.setTimeout(() => { pulling.value = false }, reduceMotion ? 1 : 520)
}

onBeforeUnmount(() => {
    clearTimeout(timer)
    clearTimeout(releaseTimer)
})
</script>

<template>
    <button
        class="theme-pull"
        :class="{ 'theme-pull--active': pulling }"
        type="button"
        :aria-label="themeStore.theme === 'light' ? '拉绳切换为暗色模式' : '拉绳切换为亮色模式'"
        :aria-pressed="themeStore.theme === 'dark'"
        @click="pullCord"
    >
        <span class="theme-pull__cord" aria-hidden="true" />
        <span class="theme-pull__handle" aria-hidden="true">
            <svg v-if="themeStore.theme === 'light'" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg v-else viewBox="0 0 24 24">
                <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
            </svg>
        </span>
    </button>
</template>

<style scoped>
.theme-pull {
    position: fixed;
    z-index: 60;
    top: 0;
    right: clamp(18px, 3vw, 38px);
    width: 42px;
    height: 88px;
    padding: 0;
    border: 0;
    color: var(--control-text);
    background: transparent;
    cursor: pointer;
    filter: drop-shadow(0 3px 7px rgba(0, 0, 0, 0.22));
    transform-origin: top center;
}

.theme-pull__cord {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 52px;
    border-radius: 999px;
    background: var(--control-background);
    transform: translateX(-50%);
}

.theme-pull__handle {
    position: absolute;
    top: 47px;
    left: 50%;
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--control-text) 28%, transparent);
    border-radius: 50%;
    background: var(--control-background);
    transform: translateX(-50%);
    transition: background-color 240ms ease, color 240ms ease;
}

.theme-pull__handle svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.theme-pull--active {
    animation: pull-theme-cord 520ms cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
}

.theme-pull:focus-visible {
    outline: 2px solid var(--section-text);
    outline-offset: -2px;
}

@keyframes pull-theme-cord {
    0%, 100% { transform: translateY(0); }
    42% { transform: translateY(22px); }
    68% { transform: translateY(15px); }
}

@media (prefers-reduced-motion: reduce) {
    .theme-pull--active { animation-duration: 1ms; }
}
</style>
