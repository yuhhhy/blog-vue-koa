<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/stores/userStore.js"
import { useNotificationStore } from "@/stores/notificationStore.js"

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const router = useRouter()
const routeList = ref([])

// 监听路由变化
watch(() => route.path, () => {
    routeList.value = route.path.split("/")
    routeList.value.shift()
    
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
    if (userStore.isAuthenticated) {
        fetchNotifications()
        
        // 设置定时刷新通知 (每分钟刷新一次)
        const timer = setInterval(fetchNotifications, 60000)
        
        // 组件卸载时清除定时器
        onBeforeUnmount(() => {
            clearInterval(timer)
        })
    }
})

// 用户登录状态变化时，重新获取通知
watch(() => userStore.isAuthenticated, (newVal) => {
    if (newVal) {
        fetchNotifications()
    }
})

// 获取所有通知
async function fetchNotifications() {
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
    <div class="ml-52 h-14 flex items-center justify-between px-5 border-b border-slate-300">
        <!-- 左侧 -->
        <div>
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/">
                <el-breadcrumb-item class="text-base">{{ routeList[0] }}</el-breadcrumb-item>
                <el-breadcrumb-item class="text-base" v-if="routeList.length > 1">{{ routeList[1]
                    }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 右侧 -->
        <div class="flex gap-5 items-center">

            <!-- 头像 -->
            <div v-if="userStore.isAuthenticated" class="size-9 rounded-full overflow-hidden">
                <img src="/src/assets/avatar.jpg" alt="avatar">
            </div>

            <!-- 用户信息，登录 -->
            <el-popover v-if="userStore.isAuthenticated" width="260">
                <!-- 用户名 -->
                <template #reference>
                    <div class="cursor-pointer text-gray-500 hover:text-blue-500 mr-5 text-base">
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
                    </div>
                </template>
                <!-- 弹出框 -->
                <div class="flex flex-col content-center">
                    <div class="flex gap-3 pt-2 pb-2">
                        <el-tag :type="userStore.userData.role === 'admin' ? 'success' : 'primary'">
                            {{ userStore.userData.role }}
                        </el-tag>
                        <div>{{ userStore.userData.email }}</div>
                    </div>
                    <RouterLink to="/comment/pending" class="cursor-pointer hover:bg-gray-200 p-2">
                        <span class=" text-blue-500">待审评论</span>
                        <span class="text-red-500 text-xs ml-1" v-if="notificationStore.pendingCommentsCount">
                            ({{ notificationStore.pendingCommentsCount }})
                        </span>
                    </RouterLink>
                    <RouterLink to="/links" class="cursor-pointer hover:bg-gray-200 p-2">
                        <span class="text-blue-500">友链申请</span>
                        <span class="text-red-500 text-xs ml-1" v-if="notificationStore.pendingLinksCount">
                            ({{ notificationStore.pendingLinksCount }})
                        </span>
                    </RouterLink>
                    <RouterLink to="/" class="cursor-pointer hover:bg-gray-200 p-2">
                        <span class="text-blue-500">系统通知</span>
                        <span class="text-red-500 text-xs ml-1" v-if="notificationStore.unreadSystemCount">
                            ({{ notificationStore.unreadSystemCount }})
                        </span>
                    </RouterLink>
                    <div class="cursor-pointer hover:text-blue-500 p-2" @click="handleLogout">
                        退出登录
                    </div>
                </div>
            </el-popover>

            <!-- 用户未登录 -->
            <el-popover v-else>
                <template #reference>
                    <!-- IconFont的 Symbol 引用 -->
                    <svg class="icon cursor-pointer hover:text-blue-500 mr-5" aria-hidden="true">
                        <use xlink:href="#icon-user"></use>
                    </svg>
                </template>
                <div class="flex flex-col content-center p-2">
                    <div class="cursor-pointer hover:text-blue-500" @click="handleLogin">去登录</div>
                </div>
            </el-popover>
        </div>
    </div>
</template>

<style scoped>
</style>