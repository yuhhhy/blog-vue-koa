import axios from "axios"
import cfg from "../config/index.js"

const baseApi = cfg.baseApi

const request = axios.create({
    baseURL: baseApi, // 后端API地址
    timeout: 8000,
})

request.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    (res) => {
        if (res.status >= 200 && res.status < 400) {
            return res.data
        } else {
            return Promise.reject(res.data)
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default request