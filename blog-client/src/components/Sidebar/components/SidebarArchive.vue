<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { apiGetBlogList } from '@/api/blog.js'
import { getSeasonInYearFullname } from '@/utils/season'

const MAX_COLLAPSED_HEIGHT = 100
const route = useRoute()
const postsDividedBySeason = ref(new Map())
const isOverflow = ref(false)
const isCollapsed = ref(false)
const archiveWrapper = ref()
const contentHeight = ref(0)
const currentMaxHeight = ref(MAX_COLLAPSED_HEIGHT)

// 获取当前活跃的月份，用于动态样式高亮显示
const activeSeason = computed(() => {
  return route.query.tag
})

function checkOverflow() {
    const el = archiveWrapper.value
    if (!el) return
    // 内容是否超出高度
    contentHeight.value = el.scrollHeight
    isOverflow.value = contentHeight.value > MAX_COLLAPSED_HEIGHT
    isCollapsed.value = isOverflow.value
    currentMaxHeight.value = isOverflow.value ? MAX_COLLAPSED_HEIGHT : contentHeight.value
}

function toggleExpand() {
    const el = archiveWrapper.value
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

onMounted(async () => {
    const posts = await apiGetBlogList()
    const seasonMap = postsDividedBySeason.value
    posts.forEach((post) => {
        const seasonInYear = getSeasonInYearFullname(post.createTime)
        if (!seasonMap.has(seasonInYear)) {
            seasonMap.set(seasonInYear, [post])
        } else {
            seasonMap.set(seasonInYear, [...seasonMap.get(seasonInYear), post])
        }
    })
    // 刚刚修改了数据并且引起了DOM变化
    // 使用nextTick延迟函数执行
    nextTick(() => {
        checkOverflow()
    })
})
</script>

<template>
    <div class="sidebar-archive">
        <div class="sidebar-archive-title">归档目录</div>
        <div 
            ref="archiveWrapper"
            class="archive-list"
            :class="{
                'archive-list-collapsed': isCollapsed && isOverflow,
                'archive-list-expanded': !isCollapsed
            }"
            :style="{ maxHeight: currentMaxHeight + 'px' }"
        >
            <RouterLink 
                v-for="[createTime, posts] in postsDividedBySeason" 
                :key="createTime" 
                :to="`/archive?tag=${createTime}`"
            >
                <div class="archive-month" :class="{ active: createTime === activeSeason }">
                    <div class="createTime">{{ createTime }}</div>
                    <div class="number">{{ posts.length }}篇</div>
                </div>
            </RouterLink>
        </div>
        <button 
            v-if="isOverflow"
            class="archive-toggle-btn"
            type="button"
            @click="toggleExpand"
        >
            {{ isCollapsed ? '展开' : '收起' }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-archive {
    color: var(--quote-color);
    background-color: var(--white);
    border-radius: 10px;
    width: 100%;
    padding: 16px 20px;
    overflow: hidden;
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }

    .sidebar-archive-title {
        color: var(--black);
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 10px;
    }
    .archive-list {
        position: relative;
        transition: max-height 0.25s ease;
    }
    .archive-list-collapsed {
        max-height: 100px;
        overflow: hidden;
    }
    .archive-list-collapsed::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 40px;
        pointer-events: none;
    }
    .archive-list-expanded {
        max-height: none;
    }
    .archive-month {
        cursor: pointer;
        height: 50px;
        width: 100%;
        padding-left: 10px;
        position: relative;
        display: flex;
        align-items: center;
        border-radius: 7px;
        .number {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 14px;
        }
        &:hover {
            color: var(--black);
        }
        &.active {
            color: var(--black);
        }
    }
    .archive-toggle-btn {
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