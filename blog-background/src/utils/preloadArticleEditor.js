const VDITOR_CDN = 'https://unpkg.com/vditor@4.0.1'
const VDITOR_RESOURCES = [
    { href: `${VDITOR_CDN}/dist/js/i18n/zh_CN.js`, as: 'script' },
    { href: `${VDITOR_CDN}/dist/js/lute/lute.min.js`, as: 'script' },
    { href: `${VDITOR_CDN}/dist/js/icons/ant.js`, as: 'script' },
    { href: `${VDITOR_CDN}/dist/css/content-theme/light.css`, as: 'style' },
]

let scheduled = false
let preloadPromise = null

const addResourceHint = ({ href, as }) => {
    if (document.head.querySelector(`link[href="${href}"]`)) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = as
    link.href = href
    document.head.appendChild(link)
}

const preloadArticleEditor = () => {
    VDITOR_RESOURCES.forEach(addResourceHint)

    if (!preloadPromise) {
        preloadPromise = import('@/views/ArticleCreate/index.vue').catch((error) => {
            preloadPromise = null
            throw error
        })
    }

    return preloadPromise
}

export const scheduleArticleEditorPreload = () => {
    if (scheduled) return
    scheduled = true

    const run = () => {
        preloadArticleEditor().catch(() => {
            // Normal navigation will retry loading if idle preloading fails.
        })
    }

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(run, { timeout: 4000 })
    } else {
        window.setTimeout(run, 1500)
    }
}
