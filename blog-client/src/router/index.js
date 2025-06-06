import { createRouter, createWebHistory } from 'vue-router'
import { apiCreateVisitor } from '@/api/visitor.js'
import { apiUpdateWebsiteView } from "@/api/websiteData.js"
import Layout from '@/views/Layout/index.vue'

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
            },
            {
                path: 'archive/:tagName?',
                name: 'Archive',
                component: () => import('@/views/Archive/index.vue'),
            },
            {
                path: 'about',
                name: 'About',
                component: () => import('@/views/About/index.vue'),
            },
            {
                path: 'blog/:id',
                name: 'Blog',
                component: () => import('@/views/Blog/index.vue')
            },
            {
                path: 'links',
                name: 'Links',
                component: () => import('@/views/Links/index.vue')
            },
            {
                path: 'info',
                name: 'Info',
                component: () => import('@/views/Info/index.vue')
            }
        ]
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/404/index.vue')
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
    // 添加404路由捕获
    if (!to.matched.length) {
        return '/404'
    }

    // 如果是锚点导航，不做处理
    if (to.hash) {
        return
    }
    // 如果是路由参数的tag参数变换，不做处理
    if (to.name === from.name && to.query.tag !== from.query.tag) {
        return
    }
    
    // 路由切换时创建访客记录
    const { role, page } = { role: 'client', page: to.name }
    await apiCreateVisitor({ role, page })
    await apiUpdateWebsiteView()

})

export default router