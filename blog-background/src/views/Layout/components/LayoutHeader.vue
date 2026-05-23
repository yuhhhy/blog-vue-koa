<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores/userStore.js"
import { useNotificationStore } from "@/stores/notificationStore.js"
import avatarUrl from "@/assets/avatar.jpg"

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const router = useRouter()
const isAdmin = computed(() => userStore.userData.role === 'admin')
let notificationTimer = null

const routeNameMap = {
    Welcome: 'Overview',
    DataDashboard: 'Data Dashboard',
    ArticleList: 'Article List',
    ArticleCreate: 'Create Article',
    UserManage: 'User Management',
    UserRecord: 'Visitor Records',
    CommentManage: 'Comments',
    CommentPending: 'Pending Comments',
    Links: 'Links',
    ImgFile: 'Images',
    MdFile: 'Markdown Files',
    LargeFile: 'Large Files'
}

const currentRouteTitle = computed(() => routeNameMap[route.name] || 'Console')
const userRoleText = computed(() => {
    const role = userStore.userData.role
    const roleNameMap = {
        admin: '管理员',
        user: '用户'
    }

    return roleNameMap[role] || role
})

// 监听路由变化
watch(() => route.path, () => {
    // 当进入评论管理页面时，重置评论通知计数
    if (route.path.includes('/comment/pending')) {
        notificationStore.resetCommentsCount()
    }
    
    // 当进入友链管理页面时，重置友链通知计数
    if (route.path.includes('/links')) {
        notificationStore.resetLinksCount()
    }
}, { immediate: true })

// 组件挂载时获取通知数据
onMounted(() => {
    if (isAdmin.value) {
        fetchNotifications()
        
        // 设置定时刷新通知 (每分钟刷新一次)
        notificationTimer = setInterval(fetchNotifications, 60000)
    }
})

// 组件卸载时清除定时器
onBeforeUnmount(() => {
    if (notificationTimer) {
        clearInterval(notificationTimer)
    }
})

// 用户登录状态变化时，重新获取通知
watch(() => userStore.isAuthenticated, (newVal) => {
    if (newVal && isAdmin.value) {
        fetchNotifications()
    }
})

// 获取所有通知
async function fetchNotifications() {
    if (!isAdmin.value) return

    await notificationStore.refreshAllNotifications()
}

function handleLogout() {
    userStore.clearUserData()
}

function handleLogin() {
    router.push('/login')
}
</script>

<template>
    <header class="layout-header">
        <!-- 左侧 -->
        <div class="header-left">
            <span class="route-chip">{{ currentRouteTitle }}</span>
        </div>

        <!-- 右侧 -->
        <div class="header-right">

            <!-- 用户信息，登录 -->
            <el-popover
                v-if="userStore.isAuthenticated"
                width="280"
                placement="bottom-end"
                popper-class="admin-user-popover-panel"
                :show-arrow="false"
            >
                <!-- 用户名 -->
                <template #reference>
                    <button class="user-trigger">
                        <img class="trigger-avatar" :src="avatarUrl" alt="avatar">
                        <!-- 使用总通知数量来显示红点 -->
                        <el-badge 
                            :value="notificationStore.totalNotifications" 
                            class="item cursor-pointer" 
                            :show-zero="false"
                            is-dot
                            :offset="[5, 5]"
                        >
                            {{ userStore.userData.username }}
                        </el-badge>
                    </button>
                </template>
                <!-- 弹出框 -->
                <div class="user-popover">
                    <div class="user-meta">
                        <img class="popover-avatar" :src="avatarUrl" alt="avatar">
                        <div class="user-meta-main">
                            <div class="popover-username">{{ userStore.userData.username }}</div>
                            <div class="popover-email">{{ userStore.userData.email }}</div>
                        </div>
                        <el-tag
                            class="role-tag"
                            :type="userStore.userData.role === 'admin' ? 'success' : 'primary'"
                            effect="light"
                        >
                            {{ userRoleText }}
                        </el-tag>
                    </div>
                    <RouterLink v-if="isAdmin" to="/comment/pending" class="popover-link">
                        <span>待审评论</span>
                        <span class="notice-count" v-if="notificationStore.pendingCommentsCount">
                            ({{ notificationStore.pendingCommentsCount }})
                        </span>
                    </RouterLink>
                    <RouterLink v-if="isAdmin" to="/links" class="popover-link">
                        <span>友链申请</span>
                        <span class="notice-count" v-if="notificationStore.pendingLinksCount">
                            ({{ notificationStore.pendingLinksCount }})
                        </span>
                    </RouterLink>
                    <RouterLink to="/" class="popover-link">
                        <span>系统通知</span>
                        <span class="notice-count" v-if="notificationStore.unreadSystemCount">
                            ({{ notificationStore.unreadSystemCount }})
                        </span>
                    </RouterLink>
                    <button class="popover-link logout-link" @click="handleLogout">
                        退出登录
                    </button>
                </div>
            </el-popover>

            <!-- 用户未登录 -->
            <el-popover
                v-else
                width="180"
                placement="bottom-end"
                popper-class="admin-user-popover-panel"
                :show-arrow="false"
            >
                <template #reference>
                    <!-- IconFont的 Symbol 引用 -->
                    <svg class="icon user-icon" aria-hidden="true">
                        <use xlink:href="#icon-user"></use>
                    </svg>
                </template>
                <div class="user-popover">
                    <button class="popover-link logout-link" @click="handleLogin">去登录</button>
                </div>
            </el-popover>
        </div>
    </header>
</template>

<style scoped>
.layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--admin-header-height);
    margin-left: var(--admin-sidebar-width);
    padding: 0 24px;
    border-bottom: 0;
    background: rgba(248, 250, 252, 0.54);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.48) inset, 0 10px 28px rgba(15, 23, 36, 0.04);
    backdrop-filter: blur(22px) saturate(1.35);
}

.header-left,
.header-right {
    display: flex;
    align-items: center;
}

.header-left {
    gap: 14px;
}

.header-right {
    gap: 12px;
}

.route-chip {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border: 0;
    border-radius: 999px;
    color: var(--admin-text-muted);
    font-family: "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.42);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.68) inset;
}

.user-trigger,
.user-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    border: 0;
    border-radius: 999px;
    color: var(--admin-text);
    background: rgba(255, 255, 255, 0.46);
    backdrop-filter: blur(16px);
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.user-trigger {
    gap: 8px;
    padding: 3px 14px 3px 4px;
    font-weight: 750;
}

.trigger-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.72);
}

.user-trigger:hover,
.user-icon:hover {
    color: var(--admin-primary);
    border-color: rgba(36, 84, 255, 0.32);
    box-shadow: 0 0 0 4px rgba(36, 84, 255, 0.08);
}

.user-popover {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.user-meta {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 10px 10px 14px;
    color: var(--admin-text-muted);
    font-size: 13px;
    border-bottom: 1px solid var(--admin-line);
}

.popover-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.72);
}

.user-meta-main {
    min-width: 0;
}

.popover-username,
.popover-email {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.popover-username {
    color: var(--admin-text);
    font-size: 15px;
    font-weight: 850;
}

.popover-email {
    margin-top: 4px;
    color: var(--admin-text-muted);
    font-size: 12px;
}

.role-tag {
    border-radius: 999px;
}

.popover-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: var(--admin-radius-sm);
    color: var(--admin-text);
    font-weight: 650;
    background: transparent;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.popover-link:hover {
    color: var(--admin-primary);
    background: var(--admin-primary-soft);
    transform: translateX(2px);
}

.notice-count {
    color: var(--admin-danger);
    font-size: 12px;
}

.logout-link {
    text-align: left;
}

:global(.admin-user-popover-panel.el-popper) {
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.72);
    border-radius: var(--admin-radius);
    background: rgba(248, 250, 252, 0.88);
    box-shadow: 0 24px 60px rgba(15, 23, 36, 0.14), 0 1px 0 rgba(255, 255, 255, 0.72) inset;
    backdrop-filter: blur(22px) saturate(1.25);
}

</style>
