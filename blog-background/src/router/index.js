import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import { ElMessage } from 'element-plus'

const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/welcome',
        component: () => import('../views/Home.vue'),
        children: [
            {        
                path: 'welcome',
                name: 'Welcome',
                component: () => import('../views/Welcome/index.vue'),
            },
            {
                path: 'article/list',
                name: 'ArticleList',
                component: () => import('../views/ArticleList/index.vue'),
            },
            {
                path: 'article/create',
                name: 'ArticleCreate',
                component: () => import('../views/ArticleCreate/index.vue')
            },
            {
                path: 'user/manage',
                name: 'UserManage',
                component: () => import('../views/UserManage/index.vue'),
                meta: {
                    requiresAdmin: true
                }
            },
            {
                path: 'user/record',
                name: 'UserRecord',
                component: () => import('../views/UserRecord/index.vue'),
                meta: {
                    requiresAdmin: true // 需要admin权限
                }
            },
            {
                path: 'comment/manage',
                name: 'CommentManage',
                component: () => import('../views/CommentManage/index.vue')
            },
            {
                path: 'comment/pending',
                name: 'CommentPending',
                component: () => import('../views/CommentPending/index.vue')
            },
            {
                path: 'links',
                name: 'Links',
                component: () => import('../views/Links/index.vue')
            },
            {
                path: 'files/imgfile',
                name: 'ImgFile',
                component: () => import('../views/Files/ImgFile/index.vue')
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
    // 检查用户是否已登录
    const userStore = useUserStore()
    
    // 如果路由需要登录但用户未登录，重定向到登录页
    if (!userStore.isAuthenticated && to.name !== 'Login') {
        ElMessage.warning('请先登录！')   
        return { name: 'Login' }
    }
    
    // 检查是否需要admin权限
    if (to.meta.requiresAdmin && userStore.userData.role !== 'admin') {
        ElMessage.warning('没有访问权限！')
        return { path: from.path || '/' } // 回到之前的页面或首页
    }
})

export default router