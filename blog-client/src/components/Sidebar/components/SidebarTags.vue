<script setup>
import { apiGetBlogList } from '@/api/blog.js'
import { ref, onMounted } from 'vue'

const posts = ref([])
const tags = ref([])

onMounted(() => {
    apiGetBlogList().then(response => {
        posts.value = response
        // 获取所有标签
        tags.value = [...new Set(
            posts.value.flatMap(post => post.tags)
        )]
    })
})
</script>

<template>
    <div class="sidebar-tags">
        <div class="sidebar-tags-title">标签</div>
        <div class="sidebar-tags-content">
            <RouterLink v-for="(tag, index) in tags" :to="`/archive?tag=${tag}`">
                <span class="tag">
                    {{ tag }}
                </span>
            </RouterLink>
        </div>
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

        @media screen and (max-width: 768px) {
            padding: 0;
        }

        .tag {
            color: var(--quote-color);
            border-radius: 5px;
            cursor: pointer;
            padding: 4px 10px;

            &:hover {
                color: var(--black);
            }

            .iconfont {
                font-size: 12px;
                margin-right: 5px;
            }
        }
    }
}
</style>