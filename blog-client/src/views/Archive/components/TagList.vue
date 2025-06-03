<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogList } from '@/composables/useBlogList'


const route = useRoute()
const router = useRouter()
const { fetchBlogList } = useBlogList()
const tags = ref([])

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
})
</script>

<template>
<div class="archive-tags">
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
</template>

<style lang="scss" scoped>
.archive-tags {
    padding: 10px 25px;
    display: flex;
    flex-wrap: wrap;
    row-gap: 20px;
    column-gap: 0;

    @media screen and (max-width: 768px) {
        padding: 0;
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
}
</style>