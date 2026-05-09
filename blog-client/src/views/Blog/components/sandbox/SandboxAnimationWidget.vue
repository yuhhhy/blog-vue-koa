<script setup>
import { computed } from 'vue'

const props = defineProps({
    html: {
        type: String,
        required: true
    },
    height: {
        type: [String, Number],
        default: 420
    },
    title: {
        type: String,
        default: 'Sandbox animation'
    }
})

const frameHeight = computed(() => {
    const value = String(props.height).trim()
    return /^\d+$/.test(value) ? `${value}px` : value
})

const srcdoc = computed(() => `<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        html, body {
            width: 100%;
            min-height: 100%;
            margin: 0;
            overflow: hidden;
            color: #1f2937;
            background: #ffffff;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        body {
            display: grid;
            place-items: stretch;
        }
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                scroll-behavior: auto !important;
            }
        }
    </style>
</head>
<body>
${props.html}
</body>
</html>`)
</script>

<template>
    <div class="sandbox-animation">
        <iframe
            :title="title"
            :srcdoc="srcdoc"
            sandbox="allow-scripts"
            loading="lazy"
            :style="{ height: frameHeight }"
        ></iframe>
    </div>
</template>

<style scoped lang="scss">
.sandbox-animation {
    margin: 2em 0;
    overflow: hidden;
    border: 1px solid var(--hr-color);
    border-radius: 8px;
    background: var(--white);
}

iframe {
    display: block;
    width: 100%;
    border: 0;
}
</style>
