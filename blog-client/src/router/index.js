import { createRouter, createWebHistory } from 'vue-router'
import { apiCreateVisitor } from '@/api/visitor.js'
import { apiUpdateWebsiteView } from "@/api/websiteData.js"
import Layout from '@/views/Layout/index.vue'
import HomePage from '@/views/Home/index.vue'
import ExplorePage from '@/views/Explore/index.vue'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'
import { recordHostedPage } from '@/utils/hostedAnalytics.js'

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
                    backgroundColor: '#f3d2dd',
                    backgroundShape: 'about'
                }
            },
            {
                path: 'essays',
                name: 'Essays',
                component: () => import('@/views/Essays/index.vue'),
                meta: {
                    title: '随笔 | 一曝十寒',
                    backgroundColor: '#c8e4f3',
                    backgroundShape: 'essays'
                }
            },
            {
                path: 'archive',
                name: 'Archive',
                component: () => import('@/views/Archive/index.vue'),
                meta: {
                    title: '归档 | 一曝十寒',
                    backgroundColor: '#d9e9cb',
                    backgroundShape: 'archive'
                }
            },
            {
                path: 'blog/:id',
                name: 'Blog',
                component: () => import('@/views/Blog/index.vue'),
                meta: {
                    title: '文章详情 | 一曝十寒',
                    dynamicTitle: true
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

        // 如果有保存的位置，优先使用
        if (savedPosition) {
            return savedPosition
        }

        // 始终滚动到顶部
        return { top: 0 }
    }
})

router.afterEach((to, from, failure) => {
    if (failure) return
    // 设置页面标题
    if (to.meta?.title && !to.meta.dynamicTitle) {
        document.title = to.meta.title
    }

})

// 在路由导航完成后执行统计，不会阻塞页面渲染
router.afterEach((to, from, failure) => {
    if (failure) return
    // 如果是锚点导航，不做处理
    if (to.hash) {
        return
    }

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
