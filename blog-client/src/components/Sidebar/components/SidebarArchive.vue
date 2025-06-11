<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiGetBlogList } from '@/api/blog.js'

const route = useRoute()
const postsDividedByMonth = ref({})

// 获取当前活跃的月份，用于动态样式高亮显示
const activeMonth = computed(() => {
  return route.query.tag
})

onMounted(async () => {
    apiGetBlogList().then(response => {
        const posts = response
        
        // 按月份分组
        postsDividedByMonth.value = posts.reduce((acc, post) => {
            const createTime = post.createTime.split('-').slice(0, 2).join('-')
            if (!acc[createTime]) {
                acc[createTime] = []
            }
            acc[createTime].push(post)
            return acc
        }, {})
    })
})
</script>

<template>
    <div class="sidebar-archive">
        <div class="sidebar-archive-title">归档目录</div>
        <RouterLink 
            v-for="(posts, createTime) in postsDividedByMonth" 
            :key="createTime" 
            :to="`/archive?tag=${createTime}`"
        >
            <div class="archive-month" :class="{ active: createTime === activeMonth }">
                <div class="createTime">{{ createTime.split('-')[0] }}年 {{ createTime.split('-')[1] }}月</div>
                <div class="number">{{ posts.length }}篇</div>
            </div>
        </RouterLink>
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