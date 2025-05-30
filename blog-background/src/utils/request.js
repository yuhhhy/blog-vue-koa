import axios from "axios"
import { ElMessage } from 'element-plus'
import { useUserStore } from "@/stores/userStore"
import router from "@/router"
const userStore = useUserStore()

// 创建 Axios 实例对象，添加全局配置
const request = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 8000
})

// 请求统一拦截
request.interceptors.request.use(
    config => {
        // 判断Axios配置对象是否有requireAuth:true字段，如果有，就代表这个请求需要鉴权
        if (config.requireAuth === true) {
            // 如果需要鉴权，添加requireAuth请求头
            config.headers['require-auth'] = 'true'
        }

        // 如果用户登录，那么就会有userData和token
        const token = userStore.userData?.token
        if (token) { 
            // 为所有请求添加Authorization请求头
            config.headers['Authorization'] = `Bearer ${token}`
        }

        // 返回配置对象
        return config
    },
    e => Promise.reject(e)
)

// 响应统一拦截 
request.interceptors.response.use(
    // 2xx 范围内的状态码都会触发该函数
    // response是Axios响应体，后端实际可以设置的响应数据是response.data
    response => {
        // 2xx 范围内的状态码都会触发该函数
        if (response.status === 204) {
            return {
                message: "204 No Content"
            }
        }
        return response.data
    },

    // 超出 2xx 范围的状态码都会触发该函数
    error => {
        // 超出 2xx 范围的状态码都会触发该函数
        const { response } = error
        if (response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            switch (response.status) {
                case 400:
                    ElMessage.error('token过期，请重新登录')
                    userStore.clearUserData()  // 登出
                    router.push('/login')
                    break
                case 401:
                    ElMessage.error('请先登录')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('请求拒绝，没有操作权限')
                    break
                case 404:
                    ElMessage.error('请求错误，未找到该资源')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(`请求失败: ${response.data.message || '未知错误'}`)
            }
        } else {
            // 网络问题或请求被取消
            if (error.message.includes('timeout')) {
                ElMessage.error('请求超时！请检查网络连接')
            } else {
                ElMessage.error('网络错误，请检查您的网络连接')
            }
        }

        return Promise.reject(error)
    }
)

export default request