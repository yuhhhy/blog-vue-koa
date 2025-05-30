import request from "@/utils/request.js"

/**
 * Comment API
 * @returns {Promise}
 */

// 获取博客所有评论
export function apiGetComments(blogId) {
    return request({
        url: `/comment/${blogId}`,
        method: 'GET',
        noAuth: true
    })
}

// 删除一条评论
export function apiDeleteComment(id) {
    return request({
        url: `/comment/${id}`,
        method: 'DELETE'
    })
}