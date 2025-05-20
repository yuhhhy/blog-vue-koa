import request from '@/utils/request.js'

/**
 * User API
 * @returns {Promise}
 */

// 用户登录
export function apiUserLogin(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data // POST 请求体数据
    })
}

// 获取用户列表
export function apiGetUserList() {
    return request({
        url: '/user/list',
        method: 'get',
    })
}

// 获取用户
export function apiGetUser(userId) {
    return request({
        url: `/user/${userId}`,
        method: 'get',
    })
}

// 创建用户
export function apiCreateUser(data) {
    return request({
        url: '/user',
        method: 'post',
        data
    })
}

// 删除用户
export function apiDeleteUser(userId) {
    return request({
        url: `/user/${userId}`,
        method: 'delete',
    })
}

// 更新用户
export function apiUpdateUser(data) {
    return request({
        url: `/user/${data.userId}`,
        method: 'put',
        data
    })
}