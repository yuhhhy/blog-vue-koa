<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { emaContextKey } from '@/ema/context.js'
import { columnsForWidth, linkKey, safeSite } from '@/ema/interaction.js'
const props = defineProps({ links: { type: Array, required: true }, group: String, preview: Boolean })
const scene = inject(emaContextKey)
const root = ref(null)
const columns = ref(1)
const rows = computed(() => Array.from({ length: Math.ceil(props.links.length / columns.value) }, (_, i) => props.links.slice(i * columns.value, (i + 1) * columns.value)))
let observer, unregister
onMounted(() => {
    observer = new ResizeObserver(([entry]) => { columns.value = columnsForWidth(entry.contentRect.width) })
    observer.observe(root.value)
    unregister = scene?.register({ element: root.value, group: props.group, preview: props.preview, links: () => props.links, columns: () => columns.value })
})
watch(columns, () => scene?.invalidate())
onBeforeUnmount(() => { observer?.disconnect(); unregister?.() })
</script>

<template>
    <div ref="root" class="ema-rack" :style="{ '--ema-columns': columns }">
        <div
            v-for="(row, index) in rows"
            :key="index"
            class="ema-row"
            :data-ema-row="index"
            data-rendered="false"
            aria-busy="true"
        >
            <span class="ema-loading" role="status" aria-live="polite">
                <span class="ema-loading-spinner" aria-hidden="true"></span>
                正在挂起绘马…
            </span>
            <a v-for="link in row" :key="linkKey(link)" class="ema-link" :data-ema-id="linkKey(link)"
                :href="safeSite(link.site) || undefined" target="_blank" rel="noopener noreferrer"
                draggable="false" @dragstart.prevent
                :aria-label="`访问 ${link.name}：${link.description || ''}`">
                <span class="ema-accessible-label">{{ link.name }} · {{ link.description }}</span>
            </a>
        </div>
    </div>
</template>

<style scoped>
.ema-rack { margin: 12px 0 28px; }
.ema-row { position: relative; display: grid; grid-template-columns: repeat(var(--ema-columns), minmax(0, 1fr)); height: 410px; user-select: none; -webkit-user-select: none; }
.ema-loading { position: absolute; z-index: 1; inset: 72px 12px 68px; display: flex; align-items: center; justify-content: center; gap: 10px; color: #6f5b4b; font-family: var(--font-serif); font-size: 0.9rem; letter-spacing: 0.08em; pointer-events: none; transition: opacity 280ms ease, visibility 0s linear 280ms; }
.ema-loading-spinner { width: 18px; height: 18px; border: 2px solid rgba(111, 91, 75, 0.24); border-top-color: #994239; border-radius: 50%; animation: ema-loading-spin 900ms linear infinite; }
.ema-row[data-rendered="true"] .ema-loading { opacity: 0; visibility: hidden; }
.ema-link { position: relative; align-self: start; height: 270px; margin: 72px 12px 0; cursor: grab; -webkit-user-drag: none; user-select: none; -webkit-touch-callout: none; }
.ema-link:active { cursor: grabbing; }
.ema-accessible-label { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.ema-link:focus-visible { outline: 2px solid #994239; border-radius: 4px; outline-offset: 4px; }
.ema-link:focus-visible .ema-accessible-label { width: auto; height: auto; inset: auto 0 0; padding: 5px; clip-path: none; white-space: normal; color: #382c24; background: #faf4e8; font-size: 13px; }

@keyframes ema-loading-spin { to { transform: rotate(1turn); } }

@media (prefers-reduced-motion: reduce) {
    .ema-loading-spinner { animation: none; }
}
</style>
