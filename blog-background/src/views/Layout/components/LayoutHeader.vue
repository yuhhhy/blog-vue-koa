<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores/userStore.js"
import { useNotificationStore } from "@/stores/notificationStore.js"

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

            <!-- 头像 -->
            <div v-if="userStore.isAuthenticated" class="avatar-frame">
                <img src="/src/assets/avatar.jpg" alt="avatar">
            </div>

            <!-- 用户信息，登录 -->
            <el-popover v-if="userStore.isAuthenticated" width="260">
                <!-- 用户名 -->
                <template #reference>
                    <button class="user-trigger">
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
                        <el-tag :type="userStore.userData.role === 'admin' ? 'success' : 'primary'">
                            {{ userStore.userData.role }}
                        </el-tag>
                        <div>{{ userStore.userData.email }}</div>
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
            <el-popover v-else>
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
    border-bottom: 1px solid var(--admin-line);
    background: rgba(248, 250, 252, 0.82);
    backdrop-filter: blur(18px);
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
    border: 1px solid var(--admin-line);
    border-radius: 999px;
    color: var(--admin-text-muted);
    font-family: "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 12px;
    background: rgba(248, 250, 252, 0.72);
}

.avatar-frame {
    width: 38px;
    height: 38px;
    padding: 2px;
    border: 1px solid var(--admin-line);
    border-radius: 50%;
    overflow: hidden;
    background: var(--admin-surface-solid);
    box-shadow: var(--admin-shadow-soft);
}

.avatar-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.user-trigger,
.user-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    border: 1px solid var(--admin-line);
    border-radius: 999px;
    color: var(--admin-text);
    background: var(--admin-surface-solid);
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.user-trigger {
    padding: 0 14px;
    font-weight: 750;
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
    gap: 6px;
}

.user-meta {
    display: grid;
    gap: 8px;
    padding: 4px 4px 10px;
    color: var(--admin-text-muted);
    font-size: 13px;
    border-bottom: 1px solid var(--admin-line);
}

.popover-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 36px;
    padding: 0 10px;
    border: 0;
    border-radius: var(--admin-radius-sm);
    color: var(--admin-text);
    font-weight: 650;
    background: transparent;
    cursor: pointer;
}

.popover-link:hover {
    color: var(--admin-primary);
    background: var(--admin-primary-soft);
}

.notice-count {
    color: var(--admin-danger);
    font-size: 12px;
}

.logout-link {
    text-align: left;
}

</style>
