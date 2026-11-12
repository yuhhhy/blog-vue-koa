<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ImageViewer from '@/components/ImageViewer.vue'

const props = defineProps({ images: { type: Array, required: true } })
const track = ref(null)
const ratios = ref([])
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const viewerIndex = ref(null)
let observer
let activeButton

const updateScroll = () => {
    const element = track.value
    if (!element) return
    canScrollLeft.value = element.scrollLeft > 1
    canScrollRight.value =
        element.scrollWidth - element.clientWidth - element.scrollLeft > 1
}

const move = (direction) => {
    const element = track.value
    element?.scrollBy({
        left: direction * element.clientWidth * 0.8,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
    })
}

const imageLoaded = async (event, index) => {
    const image = event.target
    ratios.value[index] = image.naturalWidth / image.naturalHeight || 4 / 3
    await nextTick()
    updateScroll()
}

const openImage = (event, index) => {
    activeButton = event.currentTarget
    viewerIndex.value = index
}

const closeImage = async () => {
    viewerIndex.value = null
    await nextTick()
    activeButton?.focus({ preventScroll: true })
}

watch(
    () => props.images,
    async () => {
        ratios.value = []
        viewerIndex.value = null
        await nextTick()
        if (track.value) track.value.scrollLeft = 0
        updateScroll()
    },
    { deep: true },
)

onMounted(() => {
    observer = new ResizeObserver(updateScroll)
    observer.observe(track.value)
    updateScroll()
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <div class="essay-images" role="group" aria-label="随笔图片">
        <div
            ref="track"
            class="essay-images__track"
            @scroll.passive="updateScroll"
        >
            <button
                v-for="(image, index) in images"
                :key="`${index}-${image}`"
                type="button"
                class="essay-images__item"
                :style="{ '--image-ratio': ratios[index] || 4 / 3 }"
                :aria-label="`放大查看第 ${index + 1} 张图片，共 ${images.length} 张`"
                @click="openImage($event, index)"
            >
                <img
                    :src="image"
                    :alt="`随笔配图 ${index + 1}`"
                    loading="lazy"
                    decoding="async"
                    @load="imageLoaded($event, index)"
                    @error="updateScroll"
                />
            </button>
        </div>
        <button
            v-show="canScrollLeft"
            type="button"
            class="essay-images__arrow essay-images__arrow--left"
            aria-label="向左查看图片"
            @click="move(-1)"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 5-7 7 7 7" />
            </svg>
        </button>
        <button
            v-show="canScrollRight"
            type="button"
            class="essay-images__arrow essay-images__arrow--right"
            aria-label="向右查看图片"
            @click="move(1)"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 5 7 7-7 7" />
            </svg>
        </button>
        <ImageViewer
            v-if="viewerIndex !== null"
            :images="images"
            :initial-index="viewerIndex"
            @close="closeImage"
        />
    </div>
</template>

<style scoped>
.essay-images {
    --gallery-height: clamp(180px, 30vw, 300px);
    position: relative;
    min-width: 0;
    margin-top: 20px;
}
.essay-images__track {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
}
.essay-images__track::-webkit-scrollbar {
    display: none;
}
.essay-images__item {
    flex: 0 0 auto;
    width: min(calc(var(--gallery-height) * var(--image-ratio)), 85%);
    height: var(--gallery-height);
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 12px;
    background: var(--light-gray, #eee);
    cursor: zoom-in;
}
.essay-images__item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.essay-images__item:focus-visible {
    outline: 3px solid var(--skyblue);
    outline-offset: -3px;
}
.essay-images__arrow {
    position: absolute;
    top: 50%;
    display: grid;
    width: 40px;
    height: 56px;
    padding: 8px;
    transform: translateY(-50%);
    place-items: center;
    border: 0;
    border-radius: 12px;
    color: white;
    background: rgb(0 0 0 / 45%);
    cursor: pointer;
}
.essay-images__arrow:hover {
    background: rgb(0 0 0 / 65%);
}
.essay-images__arrow:focus-visible {
    outline: 3px solid var(--skyblue);
    outline-offset: 2px;
}
.essay-images__arrow--left {
    left: 12px;
}
.essay-images__arrow--right {
    right: 12px;
}
.essay-images__arrow svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
}
</style>
