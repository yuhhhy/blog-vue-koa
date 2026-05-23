<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SideNavItem from '@/components/SideNavItem/index.vue'
import { useUserStore } from '@/stores/userStore'
import avatarUrl from '@/assets/avatar.jpg'

const userStore = useUserStore()
const route = useRoute()

const siderNavItems = [
    {
        title: '首页',
        link: '/welcome',
        icon: 'House',
    },
    {
        title: '数据大屏',
        link: '/dashboard',
        icon: 'DataAnalysis',
        requiresAdmin: true
    },
    {
        title: '文章',
        icon: 'Document',
        children: [
            {
                title: '文章列表',
                link: '/article/list',
                icon: 'Tickets',
                requiresAdmin: true
            },
            {
                title: '新建文章',
                link: '/article/create',
                icon: 'EditPen',
                requiresAdmin: true
            }
        ]
    },
    {
        title: '用户',
        icon: 'User',
        children: [
            {
                title: '用户管理',
                link: '/user/manage',
                icon: 'UserFilled',
                requiresAdmin: true
            },
            {
                title: '访客记录',
                link: '/user/record',
                icon: 'Position',
                requiresAdmin: true
            }
        ]
    },
    {
        title: '评论',
        icon: 'ChatDotRound',
        children: [
            {
                title: '全部评论',
                link: '/comment/manage',
                icon: 'ChatLineRound',
                requiresAdmin: true
            },
            {
                title: '待审评论',
                link: '/comment/pending',
                icon: 'Bell',
                requiresAdmin: true
            }
        ]
    },
    {
        title: '友链',
        link: '/links',
        icon: 'Link',
        requiresAdmin: true
    },
    {
        title: '文件',
        icon: 'Folder',
        children: [
            {
                title: '图片',
                link: '/files/imgfile',
                icon: 'Picture',
                requiresAdmin: true
            },
            {
                title: '大文件',
                link: '/files/large',
                icon: 'UploadFilled',
                requiresAdmin: true
            },
            {
                title: 'Markdown',
                link: '/files/mdfile',
                icon: 'DocumentCopy',
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
        <RouterLink to="/welcome" class="brand-block">
            <img class="brand-mark" :src="avatarUrl" alt="avatar">
            <div>
                <strong>一曝十寒</strong>
                <span>Admin Studio</span>
            </div>
        </RouterLink>

        <div class="nav-caption">Workspace</div>
        <el-menu class="admin-menu" :default-active="route.path">
            <SideNavItem
                v-for="(item, index) in visibleSiderNavItems"
                :key="item.link || item.title"
                :item="item"
                :index="item.link || String(index)"
            />
        </el-menu>
    </aside>
</template>

<style scoped>
.layout-sidenav {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 20;
    width: var(--admin-sidebar-width);
    height: 100vh;
    padding: 18px 14px;
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.76);
    background:
        linear-gradient(180deg, rgba(16, 23, 25, 0.98), rgba(24, 34, 36, 0.98)),
        radial-gradient(circle at 22px 24px, rgba(255, 255, 255, 0.08) 1px, transparent 1.4px);
    background-size: auto, 26px 26px;
    box-shadow: 16px 0 42px rgba(16, 23, 25, 0.12);
}

.brand-block {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    min-height: 62px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--admin-radius);
    background: rgba(255, 255, 255, 0.045);
}

.brand-mark {
    width: 42px;
    height: 42px;
    border-radius: var(--admin-radius-sm);
    object-fit: cover;
    background: rgba(255, 255, 255, 0.08);
}

.brand-block strong,
.brand-block span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.brand-block strong {
    color: #fff;
    font-size: 15px;
    font-weight: 850;
}

.brand-block span {
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.44);
    font-family: "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 11px;
}

.nav-caption {
    margin: 22px 10px 10px;
    color: rgba(255, 255, 255, 0.34);
    font-family: "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
}

.admin-menu {
    border-right: 0;
    background: transparent;
}

:deep(.el-menu) {
    border-right: 0;
    background: transparent;
}

:deep(.el-sub-menu),
:deep(.el-sub-menu .el-menu) {
    background: transparent;
}

:deep(.el-menu--inline) {
    padding: 2px 0 6px;
    overflow: hidden;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    height: 42px;
    line-height: 42px;
    margin: 4px 0;
    padding: 0 12px !important;
    border-radius: var(--admin-radius-sm);
    color: rgba(255, 255, 255, 0.68);
    font-weight: 700;
    transition: color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
}

:deep(.el-menu-item.is-active) {
    color: #fff;
    background: linear-gradient(90deg, rgba(36, 84, 255, 0.88), rgba(27, 138, 107, 0.76));
    box-shadow: 0 12px 28px rgba(36, 84, 255, 0.2);
}

:deep(.el-sub-menu .el-menu-item) {
    height: 38px;
    line-height: 38px;
    margin: 0 0 2px 18px;
    padding-left: 14px !important;
    font-size: 13px;
}

:deep(.el-sub-menu__icon-arrow) {
    color: rgba(255, 255, 255, 0.42);
}
</style>
