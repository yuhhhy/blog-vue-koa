<script setup>
import { computed } from 'vue'
import SideNavItem from '@/components/SideNavItem/index.vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const siderNavItems = [
    {
        title: '首页',
        link: '/welcome',
    },
    {
        title: '文章',
        children: [
            {
                title: '文章列表',
                link: '/article/list',
                requiresAdmin: true
            },
            {
                title: '新建文章',
                link: '/article/create',
                requiresAdmin: true
            }
        ]
    },
    {
        title: '用户',
        children: [
            {
                title: '用户管理',
                link: '/user/manage',
                requiresAdmin: true
            },
            {
                title: '访客记录',
                link: '/user/record',
                requiresAdmin: true
            }
        ]
    },
    {
        title: '评论',
        children: [
            {
                title: '全部评论',
                link: '/comment/manage',
                requiresAdmin: true
            },
            {
                title: '待审评论',
                link: '/comment/pending',
                requiresAdmin: true
            }
        ]
    },
    {
        title: '友链',
        link: '/links',
        requiresAdmin: true
    },
    {
        title: '文件',
        children: [
            {
                title: '图片',
                link: '/files/imgfile',
                requiresAdmin: true
            },
            {
                title: 'Markdown',
                link: '/files/mdfile',
                requiresAdmin: true
            }
        ]
    }
]

const isAdmin = computed(() => userStore.userData.role === 'admin')

const filterNavItems = (items) => {
    return items
        .map((item) => {
            if (item.children) {
                const children = filterNavItems(item.children)
                return children.length ? { ...item, children } : null
            }

            if (item.requiresAdmin && !isAdmin.value) return null

            return item
        })
        .filter(Boolean)
}

const visibleSiderNavItems = computed(() => filterNavItems(siderNavItems))
 
</script>

<template>
    <div class="w-52 h-screen overflow-y-auto fixed border-r border-slate-300 ">
        <el-menu>
            <SideNavItem
                v-for="(item, index) in visibleSiderNavItems"
                :item="item"
                :index="String(index)"
            />
        </el-menu>
    </div>
</template>

<style scoped>
 
</style>
