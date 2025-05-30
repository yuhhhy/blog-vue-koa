import request from '@/utils/request.js'

/**
 * Visitor API
 * @returns {Promise}
 */

// 获取访客列表
export function apiGetVisitorList(params) {
    return request({
        url: '/visitor',
        method: 'GET',
        params: {
            page: params?.page || 1,
            limit: params?.limit || 10
        }
    })
}

// 删除访客记录
export function apiDeleteVisitor(id) {
    return request({
        url: `/visitor/${id}`,
        method: 'DELETE',
        requireAuth: true
    })
}