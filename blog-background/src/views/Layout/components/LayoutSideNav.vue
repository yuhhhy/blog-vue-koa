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
        children: [
            {
                title: '用户管理',
                link: '/user/manage'
            },
            {
                title: '访客记录',
                link: '/user/record'
            }
        ]
    },
    {
        title: '评论',
        children: [
            {
                title: '全部评论',
                link: '/comment/manage'
            },
            {
                title: '待审评论',
                link: '/comment/pending'
            }
        ]
    },
    {
        title: '友链',
        link: '/links',
    },
    {
        title: '功能',
        children: [
            {
                title: '甘特图',
                link: '/functions/ganttchart'
            }
        ]

    }
    
    // {
    //     title: '设置',
    //     children: [
    //         {
    //             title: '站点设置',
    //             link: '/settings/site'
    //         },
    //         {
    //             title: 'SEO设置',
    //             link: '/settings/seo'
    //         }
    //     ]
    // }
    // {
    //     title: '通知',
    //     children: [
    //         {
    //             title: '通知管理',
    //             link: '/notification/manage'
    //         }
    //     ]
    // }
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