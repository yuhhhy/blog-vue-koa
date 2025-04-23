import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('@/views/Home/index.vue'),
            },
            {
                path: 'archive',
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
    linkExactActiveClass: 'active', // 设置全局的精确匹配类名
    routes
})

export default router
