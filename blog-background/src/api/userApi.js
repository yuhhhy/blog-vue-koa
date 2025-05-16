import request from '@/utils/request.js'

// 调用 Axios 实例
export function apiUserLogin(data) {
    return request({
        url: '/login',
        method: 'post',
        data // POST 请求体数据
    })
}
