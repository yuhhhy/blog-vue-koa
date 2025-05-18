<script setup>
import SideNavItem from '@/components/SideNavItem/index.vue'
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
                link: '/article/list'
            },
            {
                title: '新建文章',
                link: '/article/create'
            }
        ]
    },
    {
        title: '用户',
        link: '/user'
    }
]
 
</script>

<template>
    <div class="w-52 h-screen overflow-y-auto fixed border-r border-slate-300 ">
        <el-menu>
            <SideNavItem
                v-for="(item, index) in siderNavItems"
                :item="item"
                :index="String(index)"
            />
        </el-menu>
    </div>
</template>

<style scoped>
 
</style>