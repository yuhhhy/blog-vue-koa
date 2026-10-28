import cfg from '@/config/index.js'
import { isAdminVisitorMode } from '@/utils/adminVisitorMode.js'

let loaded = false

const enabled = cfg.analyticsEnabled && Boolean(cfg.analyticsEndpoint && cfg.analyticsSiteId)

const ensureQueue = () => {
    if (typeof window === 'undefined') return
    if (!window.blogAnalytics) {
        window.blogAnalytics = (...args) => {
            window.blogAnalytics.q = window.blogAnalytics.q || []
            window.blogAnalytics.q.push(args)
        }
    }
}

export const loadHostedAnalytics = () => {
    if (!enabled || isAdminVisitorMode() || typeof document === 'undefined') return
    ensureQueue()
    window.blogAnalytics('init', {
        siteId: cfg.analyticsSiteId,
        endpoint: cfg.analyticsEndpoint,
        enabled: true,
    })
    if (loaded || document.querySelector('script[data-blog-analytics-tracker]')) return
    const script = document.createElement('script')
    script.async = true
    script.src = `${cfg.analyticsEndpoint}/tracker/v1.js`
    script.dataset.blogAnalyticsTracker = 'true'
    script.onerror = () => { loaded = false }
    script.onload = () => { loaded = true }
    document.head.appendChild(script)
}

export const recordHostedPage = (route) => {
    if (!enabled || isAdminVisitorMode() || typeof window === 'undefined') return
    ensureQueue()
    window.blogAnalytics('page', {
        path: route.fullPath,
        title: document.title,
    })
}
