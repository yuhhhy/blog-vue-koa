<script setup>
defineProps(['blogData', 'html'])
</script>

<template>
<div class="article-content">
    <!-- <textarea 
        type="text" 
        v-model="blogData.content" 
        style="height: 200px; width: 400px;"
    ></textarea> -->
    <div 
        v-html="html"
        class="markdown-content"
    > </div>
</div>
</template>

<!-- 这个不能加scoped，因为是全局的html样式 -->
<style lang="scss">
.article-content {
    padding: 0 30px;
    line-height: 1.8;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #333;

    .markdown-content {
        h1, h2, h3, h4 {
            color: #2c3e50;
            margin: 1.5em 0 0.8em;
            font-weight: 600;
        }

        p {
            margin-bottom: 1.2em;
            font-size: 16px;
        }

        ul, ol {
            padding-left: 2em;
            margin: 1em 0;
            
            li {
                margin-bottom: 0.6em;
                list-style-position: outside;
            }
        }

        a {
            color: #3498db;
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }

        code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }

        pre {
            background: #f8f8f8;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            code {
                background: transparent;
                padding: 0;
            }
        }

        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1em;
            color: #666;
            margin: 1em 0;
            font-style: italic;
        }
    }
}
</style>