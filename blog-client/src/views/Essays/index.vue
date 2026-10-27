<script setup>
import { onMounted, ref } from 'vue'
import { apiGetEssays } from '@/api/essays.js'

const essays = ref([])
const loading = ref(true)
const loadError = ref(false)

const loadEssays = async () => {
    loading.value = true
    loadError.value = false
    try {
        essays.value = await apiGetEssays()
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

const formatDate = (value) => new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
}).format(new Date(value))

const isDateTitle = (essay) => {
    const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(new Date(essay.createTime))
    const value = (type) => parts.find((part) => part.type === type)?.value
    return essay.title === `${value('year')}年${value('month')}月${value('day')}日随笔`
}

onMounted(loadEssays)
</script>

<template>
    <section class="essays-page" aria-labelledby="essays-title">
        <header class="page-heading">
            <p>ESSAYS</p>
            <h1 id="essays-title">随笔</h1>
        </header>

        <div v-if="loading" class="essay-status">正在加载随笔…</div>
        <div v-else-if="loadError" class="essay-status">
            随笔加载失败，<button type="button" @click="loadEssays">点击重试</button>
        </div>
        <div v-else-if="!essays.length" class="essay-status">暂无随笔</div>
        <div v-else class="essay-list">
            <article v-for="essay in essays" :key="essay.id" class="essay-item">
                <h2>{{ essay.title }}</h2>
                <time v-if="!isDateTitle(essay)" :datetime="essay.createTime">{{ formatDate(essay.createTime) }}</time>
                <p>{{ essay.content }}</p>
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

.essay-list {
    max-width: 760px;
}

.essay-item + .essay-item {
    margin-top: 48px;
    padding-top: 40px;
    border-top: 1px solid rgba(38, 56, 70, 0.38);
}

.essay-item h2 {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.5;
}

.essay-item p {
    margin-top: 24px;
    color: var(--light-dark);
    font-family: var(--font-serif);
    line-height: 1.9;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.essay-item time {
    display: block;
    margin-top: 8px;
    color: var(--quote-color);
    font-size: 0.875rem;
}

.essay-status {
    color: var(--quote-color);
    line-height: 1.8;
}

.essay-status button {
    padding: 0;
    border: 0;
    color: var(--skyblue);
    background: none;
    cursor: pointer;
    font: inherit;
    text-decoration: underline;
}
</style>
