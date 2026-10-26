<script setup>
import { onMounted } from 'vue'
import { useBlogList } from '@/composables/useBlogList.js'

const { blogList, fetchBlogList } = useBlogList()

onMounted(fetchBlogList)
</script>

<template>
    <section class="essays-page" aria-labelledby="essays-title">
        <header class="page-heading">
            <p>ESSAYS</p>
            <h1 id="essays-title">随笔</h1>
        </header>

        <div class="essay-list">
            <article v-for="blog in blogList" :key="blog.id" class="essay-item">
                <RouterLink :to="`/blog/${blog.id}`">
                    <h2>{{ blog.title }}</h2>
                    <p>{{ blog.excerpt }}</p>
                    <time :datetime="blog.createTime">{{ blog.createTime.substring(0, 10) }}</time>
                </RouterLink>
            </article>
        </div>
    </section>
</template>

<style scoped>
.essays-page {
    padding-block: clamp(48px, 8vw, 96px);
    color: var(--black);
}

.page-heading {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.page-heading p {
    color: var(--quote-color);
    font-size: 0.75rem;
    letter-spacing: 0.24em;
    line-height: 1;
}

.page-heading h1 {
    width: max-content;
    margin-top: 8px;
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 4vw, 3.5rem);
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1;
    white-space: nowrap;
    view-transition-name: section-title;
}

.essay-item + .essay-item {
    margin-top: 32px;
}

.essay-item a {
    display: block;
}

.essay-item h2,
.essay-item p {
    max-width: 760px;
}

.essay-item h2 {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.5;
}

.essay-item p {
    overflow: hidden;
    color: var(--quote-color);
    line-height: 1.7;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.essay-item time {
    color: var(--quote-color);
    font-size: 0.875rem;
}
</style>
