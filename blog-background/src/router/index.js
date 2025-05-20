import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'

const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/welcome',
        component: () => import('../views/Home/index.vue'),
        children: [
            {        
                path: 'welcome',
                name: 'Welcome',
                component: () => import('../views/Welcome/index.vue')
            },
            {
                path: 'article/list',
                name: 'ArticleList',
                component: () => import('../views/ArticleList/index.vue')
            },
            {
                path: 'article/create',
                name: 'ArticleCreate',
                component: () => import('../views/ArticleCreate/index.vue')
            },
            {
                path: 'user/manage',
                name: 'UserManage',
                component: () => import('../views/UserManage/index.vue')
            },
            {
                path: 'user/record',
                name: 'UserRecord',
                component: () => import('../views/UserRecord/index.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login/index.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

router.beforeEach((to, from) => {
    
    // 检查用户是否已登录 未登录跳转登录页
    const userStore = useUserStore()
    if (
        !userStore.isAuthenticated &&
        // 避免无限重定向
        to.name !== 'Login'
    ) {
        // 将用户重定向到登录页面
        return { name: 'Login' }
    }
})

export default router