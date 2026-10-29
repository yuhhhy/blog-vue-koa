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
            <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24">
                <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z" />
            </svg>
        </span>
    </button>
</template>

<style scoped>
.theme-toggle {
    position: fixed;
    z-index: 60;
    top: clamp(14px, 2.5vw, 24px);
    right: clamp(14px, 2.5vw, 24px);
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    padding: 0;
    border: 1px solid color-mix(in srgb, var(--section-text) 18%, transparent);
    border-radius: 50%;
    color: var(--section-text);
    background: color-mix(in srgb, var(--section-surface) 78%, transparent);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(12px) saturate(1.15);
    cursor: pointer;
    transition: color 220ms ease, background-color 220ms ease, border-color 220ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.theme-toggle:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
}

.theme-toggle:active { transform: translateY(0) scale(0.94); }

.theme-toggle:focus-visible {
    outline: 2px solid var(--section-text);
    outline-offset: 3px;
}

.theme-toggle__icons {
    position: relative;
    width: 20px;
    height: 20px;
}

.theme-toggle__icon {
    position: absolute;
    inset: 0;
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: opacity 260ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.theme-toggle__icon--sun { opacity: 1; transform: rotate(0) scale(1); }
.theme-toggle__icon--moon { opacity: 0; transform: rotate(-45deg) scale(0.65); }

:global(.dark) .theme-toggle__icon--sun { opacity: 0; transform: rotate(45deg) scale(0.65); }
:global(.dark) .theme-toggle__icon--moon { opacity: 1; transform: rotate(0) scale(1); }

@media (prefers-reduced-motion: reduce) {
    .theme-toggle,
    .theme-toggle__icon { transition-duration: 1ms; }
}
</style>
