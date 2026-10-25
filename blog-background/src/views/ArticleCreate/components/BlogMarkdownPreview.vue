<script setup>
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
    markdown: {
        type: String,
        default: '',
    },
})

const contentRef = ref(null)
let prismLoadPromise

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
})

const defaultFenceRender = md.renderer.rules.fence
const defaultImageRender = md.renderer.rules.image || ((tokens, idx, options, env, self) => (
    self.renderToken(tokens, idx, options)
))

const parseFenceMeta = (meta = '') => meta.split(/\s+/).filter(Boolean).reduce((result, item) => {
    const [key, ...valueParts] = item.split('=')
    if (key && valueParts.length) result[key] = valueParts.join('=').replace(/^["']|["']$/g, '')
    return result
}, {})

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const [blockType, ...meta] = token.info.trim().split(/\s+/)
    if (blockType === 'animation') {
        const props = { ...parseFenceMeta(meta.join(' ')), html: token.content }
        return `<div data-animation data-props="${md.utils.escapeHtml(encodeURIComponent(JSON.stringify(props)))}"></div>`
    }
    return defaultFenceRender ? defaultFenceRender(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
}

md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrPush(['loading', 'lazy'])
    return defaultImageRender(tokens, idx, options, env, self)
}

const htmlContent = computed(() => DOMPurify.sanitize(md.render(props.markdown || ''), {
    ADD_ATTR: ['data-animation', 'data-props'],
}))

const highlightCode = async () => {
    const codeBlocks = contentRef.value?.querySelectorAll('pre code')
    if (!codeBlocks?.length) return
    prismLoadPromise ||= Promise.all([
        import('prismjs'),
        import('prismjs/themes/prism.css'),
    ])
    const [{ default: Prism }] = await prismLoadPromise
    codeBlocks.forEach((block) => Prism.highlightElement(block))
}

watch(htmlContent, async () => {
    await nextTick()
    await highlightCode()
}, { immediate: true, flush: 'post' })
</script>

<template>
    <article class="blog-markdown-preview">
        <slot name="action"></slot>
        <div ref="contentRef" class="markdown-content" v-html="htmlContent"></div>
    </article>
</template>

<style scoped>
.blog-markdown-preview {
    --preview-text: #444;
    --preview-heading: #2d2d2d;
    --preview-link: #409eff;
    --preview-quote: #666;
    --preview-border: #eceef2;
    --preview-code: #000;
    --preview-code-background: #f5f2f0;
    --preview-code-inline: #c7254e;
    --preview-code-inline-background: #f9f2f4;
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 420px;
    overflow: hidden;
    box-sizing: border-box;
    color: var(--preview-text);
    background: #fff;
    font-family: "Songti SC", SimSun, serif;
    font-size: 16px;
    line-height: 1.8;
}

.markdown-content {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    padding: 0 30px 30px;
}

.markdown-content :deep(h1) { font-size: 2em; }
.markdown-content :deep(h2) { font-size: 1.8em; }
.markdown-content :deep(h3) { font-size: 1.6em; }
.markdown-content :deep(h4) { font-size: 1.4em; }
.markdown-content :deep(h5) { font-size: 1.2em; }
.markdown-content :deep(h6) { font-size: 1em; }

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
    margin: 1.5em 0 0.8em;
    color: var(--preview-heading);
    font-weight: 600;
}

.markdown-content :deep(hr) {
    height: 2px;
    margin: 2em 0;
    border: 0;
    background: var(--preview-border);
}

.markdown-content :deep(p) { margin: 0 0 1.2em; font-size: 1rem; }
.markdown-content :deep(strong) { color: #2d2d2d; }
.markdown-content :deep(ul),
.markdown-content :deep(ol) { margin: 1em 0; padding-left: 2em; }
.markdown-content :deep(ul) { list-style: disc; }
.markdown-content :deep(ol) { list-style: decimal; }
.markdown-content :deep(li) { margin-bottom: 0.6em; list-style-position: outside; }
.markdown-content :deep(a) { color: var(--preview-link); text-decoration: none; word-break: break-word; }
.markdown-content :deep(a:hover) { text-decoration: underline; }

.markdown-content :deep(blockquote) {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 3px solid var(--preview-quote);
    color: var(--preview-quote);
    font-style: italic;
}

.markdown-content :deep(img),
.markdown-content :deep(video),
.markdown-content :deep(iframe) { max-width: 100%; }

.markdown-content :deep(table) {
    display: block;
    width: 100%;
    max-width: 100%;
    margin: 1em 0;
    overflow-x: auto;
    border: 1px solid #909090;
    border-collapse: collapse;
}

.markdown-content :deep(th),
.markdown-content :deep(td) { padding: 12px 15px; border: 1px solid #909090; text-align: left; }

.markdown-content :deep(code) {
    padding: 0.2em 0.4em;
    border-radius: 0.3em;
    color: var(--preview-code-inline);
    background: var(--preview-code-inline-background);
    font-family: "JetBrains Mono", "Cascadia Code", "Fira Code", ui-monospace, monospace;
    font-size: 0.875rem;
}

.markdown-content :deep(pre) {
    max-width: 100%;
    margin: 0.5em 0;
    padding: 1em;
    overflow: auto;
    border-radius: 5px;
    color: var(--preview-code);
    background: var(--preview-code-background);
}

.markdown-content :deep(pre code) {
    display: block;
    padding: 0;
    overflow-x: auto;
    border-radius: 0;
    color: var(--preview-code);
    background: none;
    white-space: pre;
    word-break: normal;
    line-height: 1.5;
}

.markdown-content :deep(.token.comment),
.markdown-content :deep(.token.prolog),
.markdown-content :deep(.token.doctype),
.markdown-content :deep(.token.cdata) { color: slategray; }
.markdown-content :deep(.token.punctuation) { color: #999; }
.markdown-content :deep(.token.property),
.markdown-content :deep(.token.tag),
.markdown-content :deep(.token.boolean),
.markdown-content :deep(.token.number),
.markdown-content :deep(.token.constant),
.markdown-content :deep(.token.symbol),
.markdown-content :deep(.token.deleted) { color: #905; }
.markdown-content :deep(.token.selector),
.markdown-content :deep(.token.attr-name),
.markdown-content :deep(.token.string),
.markdown-content :deep(.token.char),
.markdown-content :deep(.token.builtin),
.markdown-content :deep(.token.inserted) { color: #690; }
.markdown-content :deep(.token.atrule),
.markdown-content :deep(.token.attr-value),
.markdown-content :deep(.token.keyword) { color: #07a; }
.markdown-content :deep(.token.function),
.markdown-content :deep(.token.class-name) { color: #dd4a68; }
.markdown-content :deep(.token.regex),
.markdown-content :deep(.token.important),
.markdown-content :deep(.token.variable) { color: #e90; }

.markdown-content :deep([data-animation])::before {
    content: "动画组件将在博客前台运行";
    display: grid;
    min-height: 120px;
    place-items: center;
    border: 1px dashed var(--preview-border);
    color: var(--preview-quote);
}

@media (max-width: 768px) {
    .markdown-content { padding: 0 15px 30px; }
    .markdown-content :deep(h1),
    .markdown-content :deep(h2),
    .markdown-content :deep(h3),
    .markdown-content :deep(h4) { font-size: 20px; }
    .markdown-content :deep(p),
    .markdown-content :deep(ul),
    .markdown-content :deep(ol),
    .markdown-content :deep(li),
    .markdown-content :deep(code),
    .markdown-content :deep(pre),
    .markdown-content :deep(blockquote) { font-size: 14px; }
}
</style>
