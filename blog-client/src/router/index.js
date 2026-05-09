import { createRouter, createWebHistory } from 'vue-router'
import { apiCreateVisitor } from '@/api/visitor.js'
import { apiUpdateWebsiteView } from "@/api/websiteData.js"
import Layout from '@/views/Layout/index.vue'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                name: 'Redirect',
                redirect: '/home'
            },
            {
                path: '/home',
                name: 'Home',
                component: () => import('@/views/Home/index.vue'),
                meta: {
                    title: '一曝十寒'
                }
            },
            {
                path: 'about',
                name: 'About',
                component: () => import('@/views/About/index.vue'),
                meta: {
                    title: '关于 | 一曝十寒'
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
                name: 'Links',
                component: () => import('@/views/Links/index.vue'),
                meta: {
                    title: '友链 | 一曝十寒'
                }
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
        // 如果是锚点导航，不做处理
        if (to.hash) {
            return
        }

        // 如果有保存的位置，优先使用
        if (savedPosition) {
            return savedPosition
        }

        // 始终滚动到顶部
        return { top: 0 }
    }
})

router.beforeEach(async (to, from) => {
    // 设置页面标题
    if (to.meta?.title && !to.meta.dynamicTitle) {
        document.title = to.meta.title
    }
})

// 在路由导航完成后执行统计，不会阻塞页面渲染
router.afterEach((to, from) => {
    // 如果是锚点导航，不做处理
    if (to.hash) {
        return
    }

    runAfterPageIdle(() => {
        const { role, page } = { role: 'client', page: to.name }
        Promise.allSettled([
            apiCreateVisitor({ role, page }),
            apiUpdateWebsiteView()
        ])
    })
})

export default router
