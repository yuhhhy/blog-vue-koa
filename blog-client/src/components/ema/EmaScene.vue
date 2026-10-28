<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
const props = defineProps({ controller: Object, previewActive: Boolean, routeName: String })
const canvas = ref(null)
let runtime, disposed = false, idleId
const activate = () => runtime?.setOwner(props.previewActive ? 'preview' : props.routeName === 'Explore' ? 'page' : null)
onMounted(() => {
    const start = async () => {
        try {
            const { createEmaRuntime } = await import('@/ema/runtime.js')
            if (disposed) return
            const created = await createEmaRuntime(canvas.value, props.controller)
            if (disposed) { created.dispose(); return }
            runtime = created
            props.controller.runtime = runtime
            activate()
            props.controller.ready.value = true
        } catch (error) {
            console.warn('绘马 3D 不可用，使用静态友链。', error)
            props.controller.ready.value = false
        }
    }
    if ('requestIdleCallback' in window) idleId = requestIdleCallback(start, { timeout: 1000 })
    else idleId = setTimeout(start, 200)
})
watch(() => [props.previewActive, props.routeName], activate)
onBeforeUnmount(() => {
    disposed = true
    if ('cancelIdleCallback' in window) cancelIdleCallback(idleId)
    else clearTimeout(idleId)
    runtime?.dispose(); props.controller.runtime = null; props.controller.ready.value = false
})
</script>

<template><canvas ref="canvas" class="ema-canvas" :class="{ 'ema-canvas--preview': previewActive }" aria-hidden="true" /></template>
<style scoped>
.ema-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; }
.ema-canvas--preview { z-index: 31; }
</style>
