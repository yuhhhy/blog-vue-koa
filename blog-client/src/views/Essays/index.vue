<script setup>
import { onMounted } from 'vue'
import { useEssays } from '@/composables/useEssays.js'
import { getFormatDateTimeToMinute } from '@/utils/date.js'
import CommentEnvironmentIcon from '@/views/Blog/components/CommentEnvironmentIcon.vue'

const { essays, loading, loadError, loadEssays } = useEssays()
const retryLoadEssays = () => loadEssays({ force: true }).catch(() => {})
const getEssayDisplayTitle = (title) => title.replace(/^\d{4}年(?=\d{1,2}月\d{1,2}日随笔$)/, '')

onMounted(() => loadEssays().catch(() => {}))
</script>

<template>
    <section class="essays-page" aria-labelledby="essays-title">
        <header class="page-heading">
            <p>ESSAYS</p>
            <h1 id="essays-title">随笔</h1>
        </header>

        <div v-if="loading" class="essay-status">正在加载随笔…</div>
        <div v-else-if="loadError" class="essay-status">
            随笔加载失败，<button type="button" @click="retryLoadEssays">点击重试</button>
        </div>
        <div v-else-if="!essays.length" class="essay-status">暂无随笔</div>
        <div v-else class="essay-list">
            <article v-for="essay in essays" :key="essay.id" class="essay-item">
                <h2>{{ getEssayDisplayTitle(essay.title) }}</h2>
                <div class="essay-meta">
                    <time :datetime="essay.createTime">
                        {{ getFormatDateTimeToMinute(essay.createTime) }}
                    </time>
                    <template v-if="essay.solarLocation?.region">
                        <span aria-hidden="true">·</span>
                        <span>{{ essay.solarLocation.region }}</span>
                    </template>
                    <CommentEnvironmentIcon
                        kind="time"
                        :value="essay.createTime"
                        timezone="Asia/Shanghai"
                        :location="essay.solarLocation"
                    />
                </div>
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

.essay-meta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    color: var(--quote-color);
    font-size: 0.875rem;
}

.essay-meta time {
    display: inline-flex;
    align-items: center;
    gap: 5px;
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
