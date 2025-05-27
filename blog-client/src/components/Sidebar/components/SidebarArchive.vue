<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiGetBlogList } from '@/api/blog.js'

const route = useRoute()
const postsDividedByMonth = ref({})

// 获取当前活跃的月份，用于动态样式高亮显示
const activeMonth = computed(() => {
  return route.params.tagName
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
            :to="`/archive/${createTime}`"
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
    color: var(--blue);

    background-color: var(--white);
    border-radius: 10px;
    width: 100%;
    padding: 16px 20px;
    overflow: hidden;
    &:hover {
        box-shadow: 0 0 6px var(--light-blue);
        transition: 0.4s;
    }
    .sidebar-archive-title {
        color: var(--black);
        font-weight: bold;
        font-size: 1.2rem;
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
        border-radius: 10px;

        .number {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 14px;
        }

        &:hover {
            background-color: var(--light-blue);
            border: 1px solid var(--border-color);
            color: white;

            .number {
                color: white;
            }
        }
    
        &.active {
            background-color: var(--blue);
            color: white;            
            .number {
                color: white;
            }
        }
    }
}
</style>