import axios from "axios";
import cfg from '@/config/index.js'
import { ElMessage } from 'element-plus'
import router from '@/router/index.js'
import { useUserStore } from "@/stores/userStore";

const REQUEST_ERROR = '请求失败，请稍后再试'
const TOKEN_EXPIRED = '登录信息已过期，请重新登录'


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
        const { data, status, statusText, headers, config, request } = res
        const { code, message } = data
        if (code === 200) {
            ElMessage.success(message)

            // 返回响应体数据
            return res.data;        
        } else if (code === 40001) {
            // 表示token过期
            ElMessage.error(TOKEN_EXPIRED)
            setTimeout(() => {
                router.push('/login') 
            }, 1000)
            return Promise.reject(TOKEN_EXPIRED)
        } else {
            ElMessage.error(message || REQUEST_ERROR)
            return Promise.reject(message || REQUEST_ERROR)
        }
    },
    e => Promise.reject(e)
)

export default request
