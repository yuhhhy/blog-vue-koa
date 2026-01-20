<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiGetBlogList } from '@/api/blog.js'

const route = useRoute()
const postsDividedBySeason = ref(new Map())

// 获取当前活跃的月份，用于动态样式高亮显示
const activeSeason = computed(() => {
  return route.query.tag
})

function getSeason(date) {
    const month = date.getMonth()
    if (month >= 0 && month <= 2) return 'Quarter 1'
    if (month >= 3 && month <= 5) return 'Quarter 2'
    if (month >= 6 && month <= 8) return 'Quarter 3'
    return 'Quarter 4'
}


onMounted(async () => {
    const posts = await apiGetBlogList()
    const seasonMap = postsDividedBySeason.value
    posts.forEach((post) => {
        const year = new Date(post.createTime).getFullYear()
        const season = getSeason(new Date(post.createTime))
        const seasonInYear = `${year} ${season}`
        if (!seasonMap.has(seasonInYear)) {
            seasonMap.set(seasonInYear, [post])
        } else {
            seasonMap.set(seasonInYear, [...seasonMap.get(seasonInYear), post])
        }
    })
})
// 折叠和展开


</script>

<template>
    <div class="sidebar-archive">
        <div class="sidebar-archive-title">归档目录</div>
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
        <button>展开</button>
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
}
</style>