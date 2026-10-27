<script setup>
import { onMounted } from 'vue'
import { useBlogList } from '@/composables/useBlogList.js'
import { getImageVariantSrcset } from '@/utils/imageVariants.js'

const { blogList, fetchBlogList } = useBlogList()

const handleImageError = (event) => {
    const image = event.currentTarget
    const originalSrc = image.dataset.originalSrc

    if (!originalSrc || image.dataset.fallbackApplied === 'true') return

    image.dataset.fallbackApplied = 'true'
    image.srcset = ''
    image.src = originalSrc
}

onMounted(() => {
    // 获取后台数据
    fetchBlogList();
})
</script>

<template>
    <section class="blog-list" aria-label="博客文章">
        <article v-for="(blog, index) in blogList" :key="blog.id">
            <RouterLink :to="`/blog/${blog.id}`">
                <h2>{{ blog.title }}</h2>
                <p>{{ blog.excerpt }}</p>
                <time :datetime="blog.createTime">{{ blog.createTime.substring(0, 10) }}</time>
                <span v-for="tag in blog.tags" :key="tag"> #{{ tag }}</span>
                <figure>
                    <img
                      :src="blog.coverImage"
                      :srcset="getImageVariantSrcset(blog.coverImage)"
                      sizes="240px"
                      :data-original-src="blog.coverImage"
                      :alt="blog.title"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'auto'"
                      decoding="async"
                      width="240"
                      height="150"
                      @error="handleImageError"
                    >
                </figure>
            </RouterLink>
        </article>
    </section>
</template>

<style scoped>
.blog-list {
    color: var(--black);
}

.blog-list p,
.blog-list time,
.blog-list span {
    color: var(--quote-color);
}
</style>
