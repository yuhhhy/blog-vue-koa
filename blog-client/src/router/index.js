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
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active', // 设置Vue Router模糊匹配类名
    routes
})

router.beforeEach( async (to, from) => {
    const role = 'client'
    const page = to.name
    await apiCreateVisitor({ role, page })
    await apiUpdateWebsiteView()
})

export default router