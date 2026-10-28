import request from '@/utils/request.js'
import { isAdminVisitorMode } from '@/utils/adminVisitorMode.js'

/**
 * Visitor API
 * @returns {Promise}
 */

// 新建访客记录
export function apiCreateVisitor(data) {
    if (isAdminVisitorMode()) return Promise.resolve()

    return request({
        url: '/visitor',
        method: 'POST',
        data
    })
}
