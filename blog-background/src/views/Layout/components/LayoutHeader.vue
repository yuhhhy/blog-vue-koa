<script setup>
import { ref, reactive, watch } from "vue"
import { useRoute,useRouter } from "vue-router"
import { useUserStore } from "@/stores/userStore.js"

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const routeList = ref([])

// 消息通知
const notifications = reactive({
    comments: 0,
    links: 0,
    system: 0
})

function handleLogout() {
    userStore.clearUserData()
}

function handleLogin() {
    router.push('/login')
}

// 监听，面包屑随路由改变
watch(() => route.path, () => {
    routeList.value = route.path.split("/")
    routeList.value.shift()
}, { immediate: true })

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
                        <el-badge :value="1" class="item cursor-pointer" is-dot :show-zero="false" :offset="[5, 5]">
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
                        <span class="text-red-500 text-xs ml-1" v-if="notifications.comments">({{ notifications.comments
                            }})</span>
                    </RouterLink>
                    <RouterLink to="/links" class="cursor-pointer hover:bg-gray-200 p-2">
                        <span class="text-blue-500">友链申请</span>
                        <span class="text-red-500 text-xs ml-1" v-if="notifications.links">({{ notifications.links
                            }})</span>
                    </RouterLink>
                    <RouterLink to="/" class="cursor-pointer hover:bg-gray-200 p-2">
                        <span class="text-blue-500">系统通知</span>
                        <span class="text-red-500 text-xs ml-1" v-if="notifications.system">({{ notifications.system
                            }})</span>
                    </RouterLink>
                    <div class="cursor-pointer hover:text-blue-500 p-2" @click="handleLogout">
                        退出登录
                    </div>
                </div>
            </el-popover>

            <!-- 用户未登录 -->
            <el-popover v-else>
                <template #reference>
                    <div class="iconfont cursor-pointer hover:text-blue-500 mr-5">&#xe6bc;</div>
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