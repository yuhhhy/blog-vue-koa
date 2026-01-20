<script setup>
import { apiGetBlogList } from '@/api/blog.js'
import { ref, onMounted, nextTick } from 'vue'

const posts = ref([])
const tags = ref([])
const MAX_COLLAPSED_HEIGHT = 150
const tagsWrapper = ref(null)
const isOverflow = ref(false)
const isCollapsed = ref(false)
const contentHeight = ref(0)
const currentMaxHeight = ref(MAX_COLLAPSED_HEIGHT)

const checkOverflow = () => {
    const el = tagsWrapper.value
    if (!el) return
    contentHeight.value = el.scrollHeight
    isOverflow.value = contentHeight.value > MAX_COLLAPSED_HEIGHT
    isCollapsed.value = isOverflow.value
    currentMaxHeight.value = isOverflow.value ? MAX_COLLAPSED_HEIGHT : contentHeight.value
}

const toggleExpand = () => {
    const el = tagsWrapper.value
    if (!el) return
    contentHeight.value = el.scrollHeight
    if (isCollapsed.value) {
        isCollapsed.value = false
        currentMaxHeight.value = contentHeight.value
    } else {
        isCollapsed.value = true
        currentMaxHeight.value = MAX_COLLAPSED_HEIGHT
    }
}

onMounted(() => {
    apiGetBlogList().then(response => {
        posts.value = response
        // 获取所有标签
        tags.value = [...new Set(
            posts.value.flatMap(post => post.tags)
        )]

        nextTick(() => {
            checkOverflow()
        })
    })
})
</script>

<template>
    <div class="sidebar-tags">
        <div class="sidebar-tags-title">标签</div>
        <div 
            ref="tagsWrapper"
            class="sidebar-tags-content"
            :class="{
                'sidebar-tags-content-collapsed': isCollapsed && isOverflow,
                'sidebar-tags-content-expanded': !isCollapsed
            }"
            :style="{ maxHeight: currentMaxHeight + 'px' }"
        >
            <RouterLink
                v-for="tag in tags"
                :key="tag"
                :to="`/archive?tag=${tag}`"
            >
                <span class="tag">
                    {{ tag }}
                </span>
            </RouterLink>
        </div>
        <button
            v-if="isOverflow"
            class="sidebar-tags-toggle-btn"
            type="button"
            @click="toggleExpand"
        >
            {{ isCollapsed ? '展开' : '收起' }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-tags {
    background-color: var(--white);
    color: var(--black);
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    padding: 10px 10px 20px 10px;
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }
    
    .sidebar-tags-title {
        font-weight: bold;
        font-size: 1.1rem;
        margin-left: 10px;
        margin-bottom: 20px;
        margin-top: 10px;
    }
    .sidebar-tags-content {
        display: flex;
        flex-wrap: wrap;
        row-gap: 20px;
        column-gap: 20px;
        padding-left: 10px;
        position: relative;
        transition: max-height 0.25s ease;

        @media screen and (max-width: 768px) {
            padding: 0;
        }

        .tag {
            color: var(--quote-color);
            border-radius: 5px;
            cursor: pointer;
            padding: 4px 4px;

            &:hover {
                color: var(--black);
            }

            .iconfont {
                font-size: 12px;
                margin-right: 5px;
            }
        }
    }

    .sidebar-tags-content-collapsed {
        max-height: 150px;
        overflow: hidden;
    }

    .sidebar-tags-content-collapsed::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 40px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), var(--white));
        pointer-events: none;
    }

    .sidebar-tags-content-expanded {
        max-height: none;
    }

    .sidebar-tags-toggle-btn {
        margin-top: 8px;
        width: 100%;
        padding: 6px 0;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--primary-color, #3b82f6);
        background-color: rgba(59, 130, 246, 0.08);
        transition: background-color 0.2s ease, transform 0.2s ease;

        &:hover {
            background-color: rgba(59, 130, 246, 0.15);
            transform: translateY(-1px);
        }
    }
}
</style>