<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { ElImageViewer } from 'element-plus'
import 'element-plus/theme-chalk/el-image-viewer.css'

defineProps({
    images: { type: Array, required: true },
    initialIndex: { type: Number, default: 0 },
    hideMobileArrows: Boolean,
})
defineEmits(['close', 'switch'])
let pinchStartDistance = 0
let pinchLastStepDistance = 0

const getPinchDistance = (touches) =>
    Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
    )

const handlePinchStart = (event) => {
    if (event.touches.length !== 2) return
    pinchStartDistance = getPinchDistance(event.touches)
    pinchLastStepDistance = pinchStartDistance
}

const handlePinchMove = (event) => {
    if (event.touches.length !== 2 || !pinchStartDistance) return
    event.preventDefault()

    const distance = getPinchDistance(event.touches)
    const delta = distance - pinchLastStepDistance
    if (Math.abs(delta) < 18) return

    const viewer = document.querySelector('.el-image-viewer__wrapper')
    if (!viewer) return
    viewer.dispatchEvent(
        new WheelEvent('wheel', {
            deltaY: delta > 0 ? -120 : 120,
            bubbles: true,
            cancelable: true,
        }),
    )
    pinchLastStepDistance = distance
}

const handlePinchEnd = (event) => {
    if (event.touches.length < 2) {
        pinchStartDistance = 0
        pinchLastStepDistance = 0
    }
}

const attachPinchListeners = () => {
    document.addEventListener('touchstart', handlePinchStart, {
        passive: true,
        capture: true,
    })
    document.addEventListener('touchmove', handlePinchMove, {
        passive: false,
        capture: true,
    })
    document.addEventListener('touchend', handlePinchEnd, true)
    document.addEventListener('touchcancel', handlePinchEnd, true)
}

const detachPinchListeners = () => {
    document.removeEventListener('touchstart', handlePinchStart, true)
    document.removeEventListener('touchmove', handlePinchMove, true)
    document.removeEventListener('touchend', handlePinchEnd, true)
    document.removeEventListener('touchcancel', handlePinchEnd, true)
    pinchStartDistance = 0
    pinchLastStepDistance = 0
}

onMounted(attachPinchListeners)
onBeforeUnmount(detachPinchListeners)
</script>

<template>
    <Teleport to="body">
        <div :class="{ 'image-viewer--hide-mobile-arrows': hideMobileArrows }">
            <ElImageViewer
                :url-list="images"
                :initial-index="initialIndex"
                show-progress
                @close="$emit('close')"
                @switch="$emit('switch', $event)"
            />
        </div>
    </Teleport>
</template>

<style>
@media (max-width: 768px) {
    .image-viewer--hide-mobile-arrows .el-image-viewer__prev,
    .image-viewer--hide-mobile-arrows .el-image-viewer__next {
        display: none;
    }
}

@supports (scrollbar-gutter: stable) {
    /* The root already reserves the gutter. Element Plus also subtracts its
       width inline when locking the body, which would compensate twice. */
    body.el-image-viewer-parent--hidden {
        width: 100% !important;
    }
}
</style>
