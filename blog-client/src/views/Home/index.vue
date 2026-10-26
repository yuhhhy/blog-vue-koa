<script setup>
import { onMounted } from 'vue'
import { useBlogList } from '@/composables/useBlogList.js'

const { blogList, fetchBlogList } = useBlogList()

onMounted(() => {
    // 获取后台数据
    fetchBlogList();
})
</script>

<template>
    <section class="blog-list" aria-label="博客文章">
        <article v-for="blog in blogList" :key="blog.id" class="blog-card">
            <RouterLink class="blog-card__link" :to="`/blog/${blog.id}`">
                <h2>{{ blog.title }}</h2>
                <p>{{ blog.excerpt }}</p>
                <time :datetime="blog.createTime">{{ blog.createTime.substring(0, 10) }}</time>
            </RouterLink>
        </article>
    </section>
</template>

<style scoped>
.blog-list {
    width: min(100%, 1080px);
    margin: 0 auto;
    padding: clamp(32px, 6vw, 72px) clamp(20px, 4vw, 48px);
    color: var(--black);
}

.blog-card {
    min-width: 0;
}

.blog-card + .blog-card {
    margin-top: 24px;
}

.blog-card__link {
    display: block;
    width: 100%;
    min-width: 0;
    font-size: 1rem;
    text-align: left;
}

.blog-card h2 {
    max-width: 100%;
    font: inherit;
    font-weight: 700;
    line-height: 1.4;
    overflow-wrap: anywhere;
}

.blog-list p,
.blog-list time {
    color: var(--quote-color);
}

.blog-list p {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    line-height: 1.7;
    text-overflow: ellipsis;
    white-space: nowrap;
}

</style>
