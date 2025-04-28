import { createRouter, createWebHistory } from 'vue-router'
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
                path: 'archive',
                name: 'Archive',
                component: () => import('@/views/Archive/index.vue'),
                children: [
                    {
                        path: '',
                        name: 'ByDate',
                        component: () => import('@/views/Archive/components/ByDate.vue'),
                    },
                    {
                        path: ':tagName',
                        name: 'ByTag',
                        component: () => import('@/views/Archive/components/ByTag.vue'),
                    },
                ]
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
                path: 'test',
                name: 'Test',
                component: () => import('@/views/Test/index.vue'),
                meta: { title: '测试' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active', // 设置Vue Router模糊匹配类名
    routes
})

export default router
