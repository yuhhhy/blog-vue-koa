<script setup>
    defineProps(['html'])
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
    color: var(--dark);

    .markdown-content {
        h1, h2, h3, h4 {
            color: var(--sapphire);
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
            color: var(--skyblue);
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }

        code {
            background: var(--light);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }

        pre {
            background: var(--light);
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            code {
                background: transparent;
                padding: 0;
            }
        }

        blockquote {
            border-left: 3px solid var(--quote-color);
            padding-left: 1em;
            color: var(--quote-color);
            margin: 1em 0;
            font-style: italic;
        }
    }
}
@media (max-width: 768px) {
    .article-content {
        padding: 0 15px;
        .markdown-content {
            h1, h2, h3, h4 {
                font-size: 20px;
            }
            p, ul, ol, li, code, pre, blockquote { 
                font-size: 14px;
            }
        }

    }
}

</style>