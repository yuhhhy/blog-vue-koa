<script setup>
import TagList from './components/TagList.vue'
import Timeline from './components/Timeline.vue'
</script>

<template>
<div class="archive-container">
    <div class="archive-main">
        <!-- 归档页面文章列表 -->
        <div class="archive-list">
            <!-- 归档页面标签列表 -->
            <TagList></TagList>
            <!-- 归档页面时间线 -->
            <Timeline></Timeline>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>
.archive-container {
    background-color: var(--white);
    color: var(--black);
    min-height: calc(100vh - 75px);
    
    .archive-main {
        width: min(960px, calc(100% - 48px));
        margin: 0 auto;
        padding: 40px 0;
        height: 100%;

        .archive-list {
            padding: 20px 0;
        }
    }
}

@media (max-width: 768px) {
    .archive-container{
        .archive-main {
            width: calc(100% - 30px);
            padding: 20px 0;

            .archive-list{
                padding: 0;
            }
        }
    }
}
</style>
