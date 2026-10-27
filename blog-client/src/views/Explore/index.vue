<script setup>
import LinksPage from '@/views/Links/index.vue'
</script>

<template>
    <section class="explore-page" aria-labelledby="explore-title">
        <header class="page-heading">
            <p>EXPLORE</p>
            <h1 id="explore-title">探索</h1>
        </header>
        <section id="links" class="explore-links" aria-label="友链">
            <LinksPage />
        </section>
    </section>
</template>

<style scoped>
.explore-page {
    width: min(100%, 1080px);
    min-height: 100%;
    margin: 0 auto;
    padding: clamp(48px, 8vw, 96px) clamp(20px, 4vw, 48px);
    color: var(--black);
}

.page-heading {
    margin-bottom: clamp(40px, 6vw, 72px);
}

.page-heading p {
    margin: 0;
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
}

.explore-links :deep(.link-container) {
    min-height: 0;
    background: transparent;
}

.explore-links :deep(.links) {
    padding-top: 0;
}
</style>
