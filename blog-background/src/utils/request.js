import axios from "axios";
import cfg from '@/config/index.js'
import { ElMessage } from 'element-plus'
import { useUserStore } from "@/stores/userStore"

// 判断当前环境变量是否开启mock
const baseURL = cfg.mock ? cfg.mockApi : cfg.baseApi 

// 创建 Axios 实例对象，添加全局配置
const request = axios.create({
    baseURL: baseURL,
    timeout: 8000
})

const userStore = useUserStore()

// 请求拦截添加token验证
request.interceptors.request.use(
    config => {
        // 添加请求头 Authorization
        const token = userStore.userData.token || ''
        if (token) { 
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config;
    },
    e => Promise.reject(e)
)

// 响应统一拦截 
request.interceptors.response.use(
    res => {
        // Axios响应体res，返回实际响应数据是res.data
        if (res.status >= 200 && res.status < 400) {
            return res.data
        } else {
            ElMessage.error('请求失败，请稍后再试')
            return Promise.reject(res.data)
        }
    },
    e => Promise.reject(e)
)

export default request