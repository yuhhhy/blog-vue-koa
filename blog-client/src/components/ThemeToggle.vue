<script setup>
import { useThemeStore } from '@/stores/themeStore.js'

const themeStore = useThemeStore()
</script>

<template>
    <button
        class="theme-toggle"
        type="button"
        :title="themeStore.theme === 'light' ? '切换为暗色模式' : '切换为亮色模式'"
        :aria-label="themeStore.theme === 'light' ? '切换为暗色模式' : '切换为亮色模式'"
        :aria-pressed="themeStore.theme === 'dark'"
        @click="themeStore.toggleTheme"
    >
        <span class="theme-toggle__icons" aria-hidden="true">
            <span class="iconfont icon-sun theme-toggle__icon theme-toggle__icon--sun" />
            <span class="iconfont icon-moon theme-toggle__icon theme-toggle__icon--moon" />
        </span>
    </button>
</template>

<style scoped>
.theme-toggle {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    padding: 0;
    border: 0;
    color: var(--section-text);
    background: transparent;
    cursor: pointer;
    opacity: 0.78;
    transition: color 220ms ease, opacity 180ms ease, transform 180ms ease;
}

.theme-toggle:hover {
    opacity: 1;
    transform: translateY(-1px);
}

.theme-toggle:active { transform: translateY(0) scale(0.94); }

.theme-toggle:focus-visible {
    outline: 2px solid var(--section-text);
    outline-offset: 1px;
}

.theme-toggle__icons {
    position: relative;
    display: block;
    width: 22px;
    height: 22px;
    overflow: hidden;
}

.theme-toggle__icon {
    position: absolute;
    inset: 0;
    display: grid;
    width: 22px;
    height: 22px;
    place-items: center;
    font-size: 20px;
    line-height: 1;
    transition: opacity 220ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.theme-toggle__icon--sun { opacity: 1; transform: rotate(0) translateY(0); }
.theme-toggle__icon--moon { opacity: 0; transform: rotate(-28deg) translateY(125%); }

:global(.dark .theme-toggle__icon--sun) { opacity: 0; transform: rotate(28deg) translateY(-125%); }
:global(.dark .theme-toggle__icon--moon) { opacity: 1; transform: rotate(0) translateY(0); }

@media (prefers-reduced-motion: reduce) {
    .theme-toggle,
    .theme-toggle__icon { transition-duration: 1ms; }
}
</style>
