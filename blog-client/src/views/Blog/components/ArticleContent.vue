<script setup>
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import { createApp, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SandboxAnimationWidget from './sandbox/SandboxAnimationWidget.vue'

const props = defineProps(['htmlContent'])
const contentRef = ref(null)
const mountedAnimations = []

const highlightCode = () => {
    contentRef.value?.querySelectorAll('pre code').forEach((block) => {
        Prism.highlightElement(block)
    })
}

const cleanupAnimations = () => {
    while (mountedAnimations.length) {
        mountedAnimations.pop().unmount()
    }
}

const parseAnimationProps = (rawProps) => {
    if (!rawProps) return {}

    try {
        return JSON.parse(decodeURIComponent(rawProps))
    }
    catch (error) {
        console.warn('动画参数解析失败', error)
        return {}
    }
}

const mountSandboxAnimations = () => {
    cleanupAnimations()

    contentRef.value?.querySelectorAll('[data-animation]').forEach((target) => {
        const app = createApp(SandboxAnimationWidget, parseAnimationProps(target.dataset.props))
        app.mount(target)
        mountedAnimations.push(app)
    })
}

const refreshContentEnhancements = async () => {
    await nextTick()
    highlightCode()
    mountSandboxAnimations()
}

watch(() => props.htmlContent, refreshContentEnhancements, { immediate: true })
onMounted(refreshContentEnhancements)
onBeforeUnmount(cleanupAnimations)
</script>

<template>
    <article class="article-content">
        <div ref="contentRef" v-html="htmlContent" class="markdown-content">
        </div>
    </article>
</template>

<!-- 这个不能加scoped，因为是全局的html样式 -->
<style lang="scss">
.article-content {
    padding: 0 30px;
    line-height: 1.8;
    font-family: var(--font-serif);
    color: var(--light-dark);

    .markdown-content {
        position: relative;

        h1 {
            font-size: 2em;
        }

        h2 {
            font-size: 1.8em;
        }

        h3 {
            font-size: 1.6em;
        }

        h4 {
            font-size: 1.4em;
        }

        h5 {
            font-size: 1.2em;
        }

        h6 {
            font-size: 1em;
        }

        h1, h2, h3, h4, h5, h6 
        {
            color: var(--blue);
            margin: 1.5em 0 0.8em;
            font-weight: 600;

            a {
                display: none;
            }

            &:hover {
                a {
                    display: inline;
                }
            }
        }

        hr {
            border: none;
            height: 2px;
            background-color: var(--hr-color);
            margin: 2em 0;
        }

        b, strong {
            color: var(--b-color);
        }

        p {
            margin-bottom: 1.2em;
            font-size: 1rem;
        }

        p[align="center"] {
            font-size: 0.8rem;
            color: var(--quote-color);
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
            word-break: break-word; // 文字折行

            &:hover {
                text-decoration: underline;
            }
        }

        blockquote {
            border-left: 3px solid var(--quote-color);
            padding-left: 1em;
            color: var(--quote-color);
            margin: 1em 0;
            font-style: italic;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            border: 1px solid var(--submit-button);

            th, td {
                padding: 12px 15px;
                text-align: left;
                border: 1px solid var(--submit-button);
            }
        }
    }
}

@media (max-width: 768px) {
    .article-content {
        padding-bottom: 30px;
        padding-left: 15px;
        padding-right: 15px;

        .markdown-content {

            h1, h2, h3, h4 
            {
                font-size: 20px;
            }

            p, ul, ol, li, code, pre, blockquote 
            {
                font-size: 14px;
            }
        }

    }
}
</style>
