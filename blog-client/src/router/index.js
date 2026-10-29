import { createRouter, createWebHistory } from 'vue-router'
import { apiCreateVisitor } from '@/api/visitor.js'
import { apiUpdateWebsiteView } from "@/api/websiteData.js"
import Layout from '@/views/Layout/index.vue'
import HomePage from '@/views/Home/index.vue'
import ExplorePage from '@/views/Explore/index.vue'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'
import { recordHostedPage } from '@/utils/hostedAnalytics.js'
import { getAdminVisitorRedirect, isAdminVisitorMode } from '@/utils/adminVisitorMode.js'

let isExploreScrollRangePreserved = false
let previousBodyMinHeight = ''

const preserveExploreScrollRange = () => {
    if (!isExploreScrollRangePreserved) {
        previousBodyMinHeight = document.body.style.minHeight
    }
    document.body.style.minHeight = `${document.documentElement.scrollHeight}px`
    isExploreScrollRangePreserved = true
}

const releaseExploreScrollRange = () => {
    if (!isExploreScrollRangePreserved) return
    document.body.style.minHeight = previousBodyMinHeight
    previousBodyMinHeight = ''
    isExploreScrollRangePreserved = false
}

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                name: 'Home',
                component: HomePage,
                meta: {
                    title: '一曝十寒',
                    keepAlive: true
                }
            },
            {
                path: 'explore',
                name: 'Explore',
                component: ExplorePage,
                meta: {
                    title: '探索 | 一曝十寒',
                    backgroundColor: 'var(--page-explore-background)',
                    keepAlive: true
                }
            },
            {
                path: 'home',
                redirect: '/'
            },
            {
                path: 'about',
                name: 'About',
                component: () => import('@/views/About/index.vue'),
                meta: {
                    title: '关于 | 一曝十寒',
                    backgroundColor: 'var(--page-about-background)',
                    backgroundShape: 'about'
                }
            },
            {
                path: 'essays',
                name: 'Essays',
                component: () => import('@/views/Essays/index.vue'),
                meta: {
                    title: '随笔 | 一曝十寒',
                    backgroundColor: 'var(--page-essays-background)',
                    backgroundShape: 'essays'
                }
            },
            {
                path: 'archive',
                name: 'Archive',
                component: () => import('@/views/Archive/index.vue'),
                meta: {
                    title: '归档 | 一曝十寒',
                    backgroundColor: 'var(--page-archive-background)',
                    backgroundShape: 'archive'
                }
            },
            {
                path: 'blog/:id',
                name: 'Blog',
                component: () => import('@/views/Blog/index.vue'),
                meta: {
                    title: '文章详情 | 一曝十寒',
                    dynamicTitle: true,
                    backgroundColor: 'var(--section-surface)',
                    backgroundShape: 'blog'
                }
            },
            {
                path: 'links',
                redirect: '/explore#links'
            },
            {
                path: 'info',
                name: 'Info',
                component: () => import('@/views/Info/index.vue'),
                meta: {
                    title: '相关信息 | 一曝十寒'
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active', // 设置Vue Router模糊匹配类名
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            }
        }

        if (
            (to.name === 'Home' && from.name === 'Explore')
            || (to.name === 'Explore' && from.name === 'Home')
        ) {
            return false
        }

        // 归档页退出动画需要保留用户点击文章时的可视区域；
        // 文章页会在动画完成后再无缝回到顶部。
        if (
            (to.name === 'Blog' && from.name === 'Archive')
            || (to.name === 'Archive' && from.name === 'Blog')
        ) {
            return false
        }

        // 如果有保存的位置，优先使用
        if (savedPosition) {
            return savedPosition
        }

        // 始终滚动到顶部
        return { top: 0 }
    }
})

router.beforeEach((to, from) => {
    const adminVisitorRedirect = getAdminVisitorRedirect(to)
    if (adminVisitorRedirect) return adminVisitorRedirect

    if (from.name === 'Explore' && to.name === 'Home') {
        preserveExploreScrollRange()
        return
    }

    if (!(from.name === 'Home' && to.name === 'Explore')) {
        releaseExploreScrollRange()
    }
})

router.afterEach((to, from, failure) => {
    if (failure) {
        releaseExploreScrollRange()
        return
    }
    // 设置页面标题
    if (to.meta?.title && !to.meta.dynamicTitle) {
        document.title = to.meta.title
    }

})

// 在路由导航完成后执行统计，不会阻塞页面渲染
router.afterEach((to, from, failure) => {
    if (failure) return
    // 如果是锚点导航，不做处理
    if (to.hash || isAdminVisitorMode()) return

    recordHostedPage(to)

    runAfterPageIdle(() => {
        const { role, page } = { role: 'client', page: to.name }
        Promise.allSettled([
            apiCreateVisitor({ role, page }),
            apiUpdateWebsiteView(),
        ])
    })
})

export default router
