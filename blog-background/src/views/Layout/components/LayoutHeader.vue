<script setup>
import { ref, watch } from "vue"
import { useRoute,useRouter } from "vue-router"
import { useUserStore } from "@/stores/userStore.js";

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const routeList = ref([])

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
        <!-- 面包屑导航 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item class="text-base">{{ routeList[0] }}</el-breadcrumb-item>
                <el-breadcrumb-item class="text-base" v-if="routeList.length > 1">{{ routeList[1]
                    }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <!-- 用户信息，登录 -->
        <el-popover v-if="userStore.isAuthenticated" width="260">
            <!-- 默认展示 -->
            <template #reference>
                <div class="cursor-pointer text-gray-500  hover:text-blue-500 mr-5">{{ userStore.userData.username }}</div>
            </template>
            <!-- 弹出框 -->
            <div class="flex flex-col content-center p-2 gap-4">
                <div class="flex gap-3">
                    <el-tag :type="userStore.userData.role === 'admin' ? 'success' : 'primary'">
                        {{ userStore.userData.role }}
                    </el-tag>
                    <div>{{ userStore.userData.email }}</div>
                </div>
                <div class="cursor-pointer hover:text-blue-500" @click="handleLogout">退出登录</div>
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
</template>

<style scoped>
 
</style>