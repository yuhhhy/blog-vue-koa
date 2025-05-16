import { createRouter, createWebHistory } from 'vue-router'


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

export default router