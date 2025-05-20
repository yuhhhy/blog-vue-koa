import request from '@/utils/request.js'

/**
 * Visitor API
 * @returns {Promise}
 */

// 新建访客记录
export function apiCreateVisitor(data) {
    return request({
        url: '/visitor',
        method: 'post',
        data
    })
}