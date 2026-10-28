<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogList } from '@/composables/useBlogList.js'
import { apiPrefetchBlogContent } from '@/api/blogContent.js'

const { blogList, fetchBlogList } = useBlogList()
const router = useRouter()
const openingBlogId = ref('')

const warmBlogContent = (blogId) => {
    apiPrefetchBlogContent(blogId).catch(() => {})
}

const openBlog = async (blog) => {
    if (openingBlogId.value) return
    openingBlogId.value = blog.id

    try {
        await apiPrefetchBlogContent(blog.id)
    }
    catch (error) {
        console.error('预加载文章失败', error)
    }

    await router.push(`/blog/${blog.id}`)
    openingBlogId.value = ''
}

const archiveGroups = computed(() => {
    const groups = new Map()

    Array.from(blogList.value)
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .forEach((blog) => {
            const year = new Date(blog.createTime).getFullYear().toString()
            const entries = groups.get(year) || []
            entries.push(blog)
            groups.set(year, entries)
        })

    return [...groups.entries()]
})

const formatDate = (date) => date?.substring(5, 10).replace('-', '.')

onMounted(fetchBlogList)
</script>

<template>
    <section class="archive-page" aria-labelledby="archive-title">
        <header class="page-heading">
            <p>ARCHIVE</p>
            <h1 id="archive-title">归档</h1>
        </header>

        <section v-for="([year, blogs]) in archiveGroups" :key="year" class="archive-year">
            <h2>{{ year }}</h2>
            <ol>
                <li v-for="blog in blogs" :key="blog.id">
                    <time :datetime="blog.createTime">{{ formatDate(blog.createTime) }}</time>
                    <RouterLink
                        :to="`/blog/${blog.id}`"
                        :class="{ 'is-opening': openingBlogId === blog.id }"
                        @pointerenter="warmBlogContent(blog.id)"
                        @focus="warmBlogContent(blog.id)"
                        @click.prevent="openBlog(blog)"
                    >
                        {{ blog.title }}
                    </RouterLink>
                </li>
            </ol>
        </section>
    </section>
</template>

<style scoped>
.archive-page {
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

.archive-year {
    display: grid;
    grid-template-columns: minmax(72px, 120px) minmax(0, 1fr);
    gap: 24px;
}

.archive-year + .archive-year {
    margin-top: 48px;
}

.archive-year h2 {
    font-family: var(--font-serif);
    font-size: 1.5rem;
}

.archive-year ol {
    list-style: none;
}

.archive-year li {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 16px;
}

.archive-year li + li {
    margin-top: 16px;
}

.archive-year time {
    color: var(--quote-color);
    font-variant-numeric: tabular-nums;
}

.archive-year a {
    overflow-wrap: anywhere;
    transition: opacity 160ms ease;
}

.archive-year a.is-opening {
    opacity: 0.55;
}

@media (max-width: 600px) {
    .archive-year {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}
</style>
