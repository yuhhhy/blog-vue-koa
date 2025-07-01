<script setup>
defineProps({
    tocHtml: { // 文章目录html
        type: String,
        default: ''
    },
})
</script>

<template>
    <!-- toc: Table of Content 文章目录 -->
    <div class="toc">
        <div class="toc-header">文章目录</div>
        <div class="toc-content" v-html="tocHtml"></div>
    </div>
</template>

<style lang="scss" scoped>
.toc {
    background-color: var(--white);
    color: var(--dark);
    height: fit-content;
    max-height: 80vh; // 限制整个目录容器的最大高度
    width: 100%;
    padding-top: 20px;
    padding-bottom: 20px;
    border-radius: 10px;
    position: sticky;
    top: 84px; // 必须指定top/left/right/bottom值
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: flex;
    flex-direction: column; // 添加flex布局

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }
    
    .toc-header {
        padding-left: 20px;
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 10px;
        flex-shrink: 0; // 标题不压缩
    }
    
    .toc-content {
        color: var(--blue);
        font-size: 0.9rem;
        line-height: 1.5;
        overflow-y: auto;
        max-height: calc(80vh - 100px); // 减去标题和padding的高度
        padding-right: 10px; // 为滚动条留出空间
        
        // 自定义滚动条样式
        &::-webkit-scrollbar {
            width: 6px;
        }
        
        &::-webkit-scrollbar-track {
            background: var(--background-color);
            border-radius: 3px;
        }
        
        &::-webkit-scrollbar-thumb {
            background: var(--blue);
            border-radius: 3px;
            opacity: 0.6;
            
            &:hover {
                opacity: 1;
            }
        }
    }
    
    :deep(ul), :deep(ol) {
        padding-left: 2em;
        margin: 0.3em 0;
        
        li {
            margin-bottom: 0.6em;
            list-style-position: outside;
            list-style: none;
        }
    }
}


</style>