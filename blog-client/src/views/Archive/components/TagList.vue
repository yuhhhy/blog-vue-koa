<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogList } from '@/composables/useBlogList'


const route = useRoute()
const router = useRouter()
const { fetchBlogList } = useBlogList()
const tags = ref([])
const MAX_COLLAPSED_HEIGHT = 74
const tagsWrapper = ref(null)
const isOverflow = ref(false)
const isCollapsed = ref(false)
const contentHeight = ref(0)
const currentMaxHeight = ref(MAX_COLLAPSED_HEIGHT)

// 获取当前活跃标签
const activeTag = computed(() => {
  return route.query.tag
})

// 第一次点击添加params，第二次点击去除params
const toggleTagLink = (tag) => {
  // 如果点击的标签是当前活跃标签，则不进行跳转
    if (route.query.tag && route.query.tag === tag) {
        router.push({
            path: '/archive',
            query: {}
         })
    }
    // 如果没有活跃标签，则跳转到当前标签
    else {
        router.push({
            path: '/archive',
            query: { tag }
         })
    }
}

onMounted(async () => {
    const posts = await fetchBlogList()
    // 获取所有标签
    tags.value = [...new Set(
        posts.flatMap(post => post.tags)
    )]

    nextTick(() => {
        checkOverflow()
    })
})

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
</script>

<template>
<div class="archive-tags">
    <div 
        ref="tagsWrapper"
        class="archive-tags-list"
        :class="{
            'archive-tags-list-collapsed': isCollapsed && isOverflow,
            'archive-tags-list-expanded': !isCollapsed
        }"
        :style="{ maxHeight: currentMaxHeight + 'px' }"
    >
        <div 
            v-for="tag in tags" 
            :key="tag"
            @click="toggleTagLink(tag)"
        >
            <span class="tag" :class="{ active: tag === activeTag }">
                <span class="iconfont">&#xe920;</span>
                {{ tag }}
            </span>
        </div>
    </div>
    <button
        v-if="isOverflow"
        class="archive-tags-toggle-btn"
        type="button"
        @click="toggleExpand"
    >
        {{ isCollapsed ? '展开' : '收起' }}
    </button>
</div>
</template>

<style lang="scss" scoped>
.archive-tags {
    padding: 10px 25px;
    overflow: hidden;

    .archive-tags-list {
        display: flex;
        flex-wrap: wrap;
        row-gap: 20px;
        column-gap: 0;
        position: relative;
        transition: max-height 0.25s ease;
    }

    .tag {
        border: 2px none var(--blue);
        color: var(--blue);
        border-radius: 5px;
        cursor: pointer;
        margin: 30px 10px;
        padding: 4px 10px;
        
        .iconfont {
            font-size: 12px;
            margin-right: 5px;
       }
        
        &.active {
            background-color: var(--blue);
            color: var(--white);
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }

        &:hover {
            background-color: var(--blue);
            color: var(--white);
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
    }

    // @media 一定要放在想要覆盖样式的后面，否则不生效
    @media screen and (max-width: 768px) {
        padding: 0;
        row-gap: 14px;

        .tag {
            margin: 0;
        }
    }
}

.archive-tags-list-collapsed {
    max-height: 74px;
    overflow: hidden;
}

.archive-tags-list-collapsed::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 30px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), var(--white));
    pointer-events: none;
}

.archive-tags-list-expanded {
    max-height: none;
}

.archive-tags-toggle-btn {
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
</style>