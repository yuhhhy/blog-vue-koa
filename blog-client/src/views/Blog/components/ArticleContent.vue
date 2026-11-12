<script setup>
import { createApp, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import ImageViewer from '@/components/ImageViewer.vue'
import SandboxAnimationWidget from './sandbox/SandboxAnimationWidget.vue'

const props = defineProps(['htmlContent'])
const contentRef = ref(null)
const lightbox = ref(null)
const lightboxImages = ref([])
const lightboxIndex = ref(0)
const mountedAnimations = []
const imageCleanupCallbacks = []
let prismLoadPromise
let activeArticleImage = null

const openImage = (image) => {
    const images = [
        ...(contentRef.value?.querySelectorAll('.article-image-frame img') ||
            []),
    ].filter((item) => item.isConnected && item.naturalWidth > 0)
    const index = images.indexOf(image)
    if (index < 0) return

    lightboxImages.value = images.map((item) => ({
        src: item.currentSrc || item.src,
        alt: item.getAttribute('alt')?.trim() || '',
    }))
    lightboxIndex.value = index
    activeArticleImage = image
    lightbox.value = true
}

const closeImage = () => {
    lightbox.value = false
    nextTick(() => activeArticleImage?.focus())
}

const handleArticleImageClick = (event) => {
    const image = event.target.closest?.('.article-image-frame img')
    if (!image || !contentRef.value?.contains(image)) return
    event.preventDefault()
    openImage(image)
}

const handleArticleImageKeydown = (event) => {
    if (!['Enter', ' '].includes(event.key)) return
    const image = event.target.closest?.('.article-image-frame img')
    if (!image || !contentRef.value?.contains(image)) return
    event.preventDefault()
    openImage(image)
}

const handleLightboxSwitch = (index) => {
    lightboxIndex.value = index
}

const loadPrism = () => {
    prismLoadPromise ||= Promise.all([
        import('prismjs'),
        import('prismjs/themes/prism.css'),
    ])

    return prismLoadPromise
}

const highlightCode = async () => {
    const codeBlocks = contentRef.value?.querySelectorAll('pre code')
    if (!codeBlocks?.length) return

    const [{ default: Prism }] = await loadPrism()
    codeBlocks.forEach((block) => {
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
    } catch (error) {
        console.warn('动画参数解析失败', error)
        return {}
    }
}

const mountSandboxAnimations = () => {
    cleanupAnimations()

    contentRef.value?.querySelectorAll('[data-animation]').forEach((target) => {
        const app = createApp(
            SandboxAnimationWidget,
            parseAnimationProps(target.dataset.props),
        )
        app.mount(target)
        mountedAnimations.push(app)
    })
}

const cleanupImageListeners = () => {
    while (imageCleanupCallbacks.length) imageCleanupCallbacks.pop()()
}

const replaceFailedImage = (image, frame) => {
    if (!frame.isConnected) return

    const placeholder = document.createElement('div')
    const altText = image.getAttribute('alt')?.trim()
    placeholder.className = 'article-image-placeholder'
    if (frame.dataset.imageWidth)
        placeholder.dataset.imageWidth = frame.dataset.imageWidth
    placeholder.setAttribute('role', 'img')
    placeholder.setAttribute(
        'aria-label',
        altText ? `图片加载失败：${altText}` : '图片加载失败',
    )

    const title = document.createElement('strong')
    title.textContent = '图片暂时无法显示'
    placeholder.append(title)

    if (altText) {
        const description = document.createElement('span')
        description.textContent = altText
        placeholder.append(description)
    }

    frame.replaceWith(placeholder)
}

const enhanceArticleImages = () => {
    cleanupImageListeners()

    contentRef.value?.querySelectorAll('img').forEach((image) => {
        const frame = document.createElement('span')
        frame.className = 'article-image-frame is-loading'
        if (image.dataset.imageWidth)
            frame.dataset.imageWidth = image.dataset.imageWidth
        image.before(frame)
        frame.append(image)
        image.tabIndex = 0
        image.setAttribute('role', 'button')
        image.setAttribute(
            'aria-label',
            `放大查看图片${image.alt ? `：${image.alt}` : ''}`,
        )

        const handleLoad = () => frame.classList.remove('is-loading')
        const handleError = () => {
            frame.classList.remove('is-loading')
            replaceFailedImage(image, frame)
        }

        image.addEventListener('load', handleLoad, { once: true })
        image.addEventListener('error', handleError, { once: true })
        imageCleanupCallbacks.push(() => {
            image.removeEventListener('load', handleLoad)
            image.removeEventListener('error', handleError)
        })

        // Cached images can complete before Vue has inserted the article HTML.
        if (image.complete) {
            if (image.naturalWidth > 0) handleLoad()
            else handleError()
        }
    })
}

const refreshContentEnhancements = async () => {
    cleanupImageListeners()
    await nextTick()
    enhanceArticleImages()
    contentRef.value?.addEventListener('click', handleArticleImageClick)
    contentRef.value?.addEventListener('keydown', handleArticleImageKeydown)
    await highlightCode()
    mountSandboxAnimations()
}

watch(() => props.htmlContent, refreshContentEnhancements, {
    immediate: true,
    flush: 'post',
})
onBeforeUnmount(() => {
    cleanupImageListeners()
    cleanupAnimations()
    contentRef.value?.removeEventListener('click', handleArticleImageClick)
    contentRef.value?.removeEventListener('keydown', handleArticleImageKeydown)
})
</script>

<template>
    <article class="article-content">
        <div
            ref="contentRef"
            v-html="htmlContent"
            class="markdown-content"
        ></div>
        <ImageViewer
            v-if="lightbox"
            :images="lightboxImages.map((image) => image.src)"
            :initial-index="lightboxIndex"
            hide-mobile-arrows
            @close="closeImage"
            @switch="handleLightboxSwitch"
        />
    </article>
</template>

<!-- 这个不能加scoped，因为是全局的html样式 -->
<style lang="scss">
.article-content {
    line-height: 1.8;
    font-family: var(--font-system-sans);
    color: var(--light-dark);

    .markdown-content {
        position: relative;

        h1 {
            font-size: 1.6rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        h3 {
            font-size: 1.4rem;
        }

        h4 {
            font-size: 1.3rem;
        }

        h5 {
            font-size: 1.2rem;
        }

        h6 {
            font-size: 1.1rem;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
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

        b,
        strong {
            color: var(--b-color);
        }

        p {
            margin-bottom: 1.2em;
            font-size: 1rem;
        }

        p[align='center'] {
            font-size: 0.8rem;
            color: var(--quote-color);
        }

        ul,
        ol {
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
        }

        .article-image-frame {
            display: block;
            width: 100%;
            margin: 1.5em 0;
            overflow: hidden;
            border-radius: 6px;

            img {
                display: block;
                width: 100%;
                max-width: 100%;
                margin: 0;
            }

            &.is-loading {
                position: relative;
                min-height: clamp(180px, 32vw, 320px);
                background: color-mix(
                    in srgb,
                    var(--light-dark) 8%,
                    transparent
                );

                img {
                    opacity: 0;
                }

                &::after {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 32px;
                    height: 32px;
                    border: 3px solid
                        color-mix(in srgb, var(--quote-color) 28%, transparent);
                    border-top-color: var(--skyblue);
                    border-radius: 50%;
                    content: '';
                    animation: article-image-loading-spin 800ms linear infinite;
                }
            }
        }

        .article-image-frame[data-image-width='25'] {
            width: 25%;
        }
        .article-image-frame[data-image-width='50'] {
            width: 50%;
        }
        .article-image-frame[data-image-width='75'] {
            width: 75%;
        }
        .article-image-frame[data-image-width='100'] {
            width: 100%;
        }
        .article-image-placeholder[data-image-width='25'] {
            width: 25%;
        }
        .article-image-placeholder[data-image-width='50'] {
            width: 50%;
        }
        .article-image-placeholder[data-image-width='75'] {
            width: 75%;
        }
        .article-image-placeholder[data-image-width='100'] {
            width: 100%;
        }

        .article-image-placeholder {
            display: flex;
            width: 100%;
            min-height: clamp(180px, 32vw, 320px);
            margin: 1.5em 0;
            padding: 24px;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 6px;
            border: 1px dashed
                color-mix(in srgb, var(--quote-color) 55%, transparent);
            border-radius: 6px;
            color: var(--quote-color);
            background: color-mix(in srgb, var(--light-dark) 4%, transparent);
            text-align: center;

            strong {
                color: var(--light-dark);
                font-size: 0.95rem;
                font-weight: 600;
            }

            span {
                max-width: 36rem;
                overflow-wrap: anywhere;
                font-size: 0.8rem;
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

            th,
            td {
                padding: 12px 15px;
                text-align: left;
                border: 1px solid var(--submit-button);
            }
        }
    }
}

.article-image-frame:not(.is-loading) img {
    cursor: zoom-in;
}

@keyframes article-image-loading-spin {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .article-content .markdown-content .article-image-frame.is-loading::after {
        animation: none;
        transform: translate(-50%, -50%);
    }
}

@media (max-width: 768px) {
    .article-content {
        padding-bottom: 30px;

        .markdown-content {
            h1 {
                font-size: 1.4rem;
            }
            h2 {
                font-size: 1.32rem;
            }
            h3 {
                font-size: 1.24rem;
            }
            h4 {
                font-size: 1.16rem;
            }
            h5 {
                font-size: 1.08rem;
            }
            h6 {
                font-size: 1rem;
            }

            p,
            ul,
            ol,
            li,
            code,
            pre,
            blockquote {
                font-size: 14px;
            }
        }
    }
}
</style>
