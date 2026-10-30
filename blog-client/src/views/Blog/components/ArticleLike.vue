<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiUpdateBlogLikeCount } from '@/api/blogContent.js'
import { useLikeStore } from '@/stores/likeStore.js'

const props = defineProps({
    blogData: { type: Object, required: true },
})

const route = useRoute()
const likeStore = useLikeStore()
const isBursting = ref(false)
const isSubmitting = ref(false)
const liked = computed(() => Boolean(likeStore.likedInfo[route.params.id]))
let burstTimer

const handleLike = async () => {
    if (liked.value || isSubmitting.value) return

    isSubmitting.value = true
    try {
        const data = await apiUpdateBlogLikeCount(route.params.id)
        props.blogData.likeCount = data.likeCount
        likeStore.like(route.params.id)
        isBursting.value = false
        requestAnimationFrame(() => {
            isBursting.value = true
            clearTimeout(burstTimer)
            burstTimer = setTimeout(() => { isBursting.value = false }, 900)
        })
    }
    catch (error) {
        console.error('文章点赞失败', error)
    }
    finally {
        isSubmitting.value = false
    }
}

onBeforeUnmount(() => clearTimeout(burstTimer))
</script>

<template>
    <div class="article-like">
        <p>喜欢这篇文章吗？</p>
        <button
            class="like-button"
            :class="{ 'is-liked': liked, 'is-bursting': isBursting }"
            type="button"
            :aria-pressed="liked"
            :disabled="isSubmitting"
            @click="handleLike"
        >
            <span class="like-button__halo" aria-hidden="true"></span>
            <span v-for="index in 8" :key="index" class="like-button__spark" :style="{ '--spark-index': index - 1 }" aria-hidden="true"></span>
            <span class="iconfont icon-like like-button__icon" aria-hidden="true"></span>
            <span class="like-button__label">{{ liked ? '已喜欢' : '点赞' }}</span>
            <span class="like-button__count">{{ blogData.likeCount || 0 }}</span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
.article-like {
    display: grid;
    justify-items: center;
    gap: 14px;
    padding-block: clamp(28px, 5vw, 48px);
    border-top: 1px solid rgba(38, 56, 70, 0.12);
    font-family: var(--font-serif);

    p {
        color: var(--quote-color);
        font-size: 0.875rem;
        letter-spacing: 0.08em;
    }
}

.like-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-width: 138px;
    min-height: 46px;
    padding: 10px 18px;
    overflow: visible;
    color: var(--light-dark);
    background: rgba(255, 255, 255, 0.62);
    border: 1px solid rgba(38, 56, 70, 0.2);
    border-radius: 999px;
    box-shadow: 0 8px 24px rgba(38, 56, 70, 0.08);
    cursor: pointer;
    transition: transform 220ms ease, color 220ms ease, border-color 220ms ease, box-shadow 220ms ease;

    &:hover:not(:disabled) {
        color: #d95765;
        border-color: rgba(217, 87, 101, 0.45);
        box-shadow: 0 12px 30px rgba(217, 87, 101, 0.16);
        transform: translateY(-2px);
    }

    &:focus-visible {
        outline: 2px solid var(--section-text);
        outline-offset: 4px;
    }

    &:disabled {
        cursor: wait;
    }

    &.is-liked {
        color: #d95765;
        border-color: rgba(217, 87, 101, 0.32);
    }
}

.like-button__icon {
    position: relative;
    z-index: 2;
    font-size: 1.2rem;
}

.like-button__label,
.like-button__count {
    position: relative;
    z-index: 2;
    font-size: 0.875rem;
}

.like-button__count {
    min-width: 1ch;
    color: var(--quote-color);
    font-variant-numeric: tabular-nums;
}

.like-button__halo,
.like-button__spark {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 24px;
    pointer-events: none;
}

.like-button__halo {
    width: 42px;
    aspect-ratio: 1;
    border: 2px solid rgba(217, 87, 101, 0.7);
    border-radius: 50%;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
}

.like-button__spark {
    --spark-angle: calc(var(--spark-index) * 45deg);
    width: 5px;
    height: 5px;
    background: hsl(calc(344 + var(--spark-index) * 8) 68% 62%);
    border-radius: 50%;
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--spark-angle)) translateX(0) scale(0);
}

.like-button.is-bursting {
    animation: like-pop 600ms cubic-bezier(0.2, 0.9, 0.25, 1.2);

    .like-button__icon {
        animation: heart-pop 650ms cubic-bezier(0.2, 0.9, 0.25, 1.35);
    }

    .like-button__halo {
        animation: halo-bloom 700ms ease-out;
    }

    .like-button__spark {
        animation: spark-burst 720ms ease-out;
    }
}

@keyframes like-pop {
    35% { transform: translateY(-2px) scale(1.08); }
    70% { transform: scale(0.98); }
}

@keyframes heart-pop {
    35% { transform: rotate(-12deg) scale(1.55); }
    70% { transform: rotate(7deg) scale(0.92); }
}

@keyframes halo-bloom {
    15% { opacity: 0.9; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
}

@keyframes spark-burst {
    20% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--spark-angle)) translateX(14px) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--spark-angle)) translateX(34px) scale(0.2); }
}

@media (prefers-reduced-motion: reduce) {
    .like-button,
    .like-button__icon,
    .like-button__halo,
    .like-button__spark {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
    }
}
</style>
