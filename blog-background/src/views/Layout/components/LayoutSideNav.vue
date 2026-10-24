<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SideNavItem from '@/components/SideNavItem/index.vue'
import { useUserStore } from '@/stores/userStore'
import LayoutUserMenu from './LayoutUserMenu.vue'
import {
    mdiAccountCircleOutline,
    mdiAccountClockOutline,
    mdiAccountEditOutline,
    mdiChartBoxOutline,
    mdiCloudUploadOutline,
    mdiCommentAlertOutline,
    mdiCommentMultipleOutline,
    mdiFileDocumentOutline,
    mdiFileDocumentMultipleOutline,
    mdiFileEditOutline,
    mdiFolderOutline,
    mdiImageMultipleOutline,
    mdiLanguageMarkdownOutline,
    mdiLinkVariant,
    mdiMessageTextOutline
} from '@mdi/js'

const userStore = useUserStore()
const route = useRoute()

const siderNavItems = [
    {
        title: '数据大屏',
        link: '/dashboard',
        icon: mdiChartBoxOutline,
        requiresAdmin: true
    },
    {
        title: '文章',
        icon: mdiFileDocumentOutline,
        children: [
            {
                title: '文章列表',
                link: '/article/list',
                icon: mdiFileDocumentMultipleOutline,
                requiresAdmin: true
            },
            {
                title: '新建文章',
                link: '/article/create',
                icon: mdiFileEditOutline,
                requiresAdmin: true
            }
        ]
    },
    {
        title: '用户',
        icon: mdiAccountCircleOutline,
        children: [
            {
                title: '用户管理',
                link: '/user/manage',
                icon: mdiAccountEditOutline,
                requiresAdmin: true
            },
            {
                title: '访客记录',
                link: '/user/record',
                icon: mdiAccountClockOutline,
                requiresAdmin: true
            }
        ]
    },
    {
        title: '评论',
        icon: mdiCommentMultipleOutline,
        children: [
            {
                title: '全部评论',
                link: '/comment/manage',
                icon: mdiMessageTextOutline,
                requiresAdmin: true
            },
            {
                title: '待审评论',
                link: '/comment/pending',
                icon: mdiCommentAlertOutline,
                requiresAdmin: true
            }
        ]
    },
    {
        title: '友链',
        link: '/links',
        icon: mdiLinkVariant,
        requiresAdmin: true
    },
    {
        title: '文件',
        icon: mdiFolderOutline,
        children: [
            {
                title: '图片',
                link: '/files/imgfile',
                icon: mdiImageMultipleOutline,
                requiresAdmin: true
            },
            {
                title: '大文件',
                link: '/files/large',
                icon: mdiCloudUploadOutline,
                requiresAdmin: true
            },
            {
                title: 'Markdown',
                link: '/files/mdfile',
                icon: mdiLanguageMarkdownOutline,
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
    <aside class="layout-sidenav">
        <div class="sidenav-scroll">
            <el-menu class="admin-menu" :default-active="route.path">
                <SideNavItem
                    v-for="(item, index) in visibleSiderNavItems"
                    :key="item.link || item.title"
                    :item="item"
                    :index="item.link || String(index)"
                />
            </el-menu>
        </div>
        <LayoutUserMenu />
    </aside>
</template>

<style scoped>
.layout-sidenav {
    --md-sys-color-surface: #f7f2fa;
    --md-sys-color-surface-container: #f3edf7;
    --md-sys-color-on-surface: #1d1b20;
    --md-sys-color-on-surface-variant: #49454f;
    --md-sys-color-outline-variant: #cac4d0;
    --md-sys-color-secondary-container: #e8def8;
    --md-sys-color-on-secondary-container: #1d192b;

    position: fixed;
    display: flex;
    flex-direction: column;
    inset: 0 auto 0 0;
    z-index: 20;
    width: var(--admin-sidebar-width);
    height: 100vh;
    padding: 14px 12px 20px;
    overflow: hidden;
    border-right: 1px solid #e7e0ec;
    color: var(--md-sys-color-on-surface-variant);
    background: var(--md-sys-color-surface);
    box-shadow: none;
}

.sidenav-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
}

.sidenav-scroll::-webkit-scrollbar {
    display: none;
}

.admin-menu {
    width: 100%;
    border-right: 0;
    background: transparent;
}

:deep(.el-menu),
:deep(.el-sub-menu),
:deep(.el-sub-menu .el-menu) {
    border-right: 0;
    background: transparent;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
    margin: 2px 0;
    padding: 0 12px !important;
    border-radius: 999px;
    color: var(--md-sys-color-on-surface-variant);
    font-weight: 600;
    transition: color 0.18s ease, background-color 0.18s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    color: var(--md-sys-color-on-surface);
    background: var(--md-sys-color-surface-container);
}

:deep(.el-menu-item.is-active) {
    color: var(--md-sys-color-on-secondary-container);
    background: var(--md-sys-color-secondary-container);
    font-weight: 700;
}

:deep(.el-sub-menu .el-menu-item) {
    height: 44px;
    line-height: 44px;
    margin: 1px 0 1px 18px;
    padding-left: 14px !important;
    font-size: 13px;
}

:deep(.el-sub-menu__icon-arrow) {
    top: 50%;
    right: 16px;
    width: 18px;
    height: 18px;
    margin-top: -11px;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 18px;
    font-weight: 800;
}
</style>
