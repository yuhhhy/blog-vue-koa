import request from "../utils/request.js"

/**
 * Comment API
 * @returns {Promise}
 */

// 获取博客所有评论
export function apiGetComments(blogId) {
    return request({
        url: `/api/comment/${blogId}`,
        method: 'GET',
    })
}

// 创建新评论
export function apiCreateComment(data) {
    return request({
        url: '/api/comment',
        method: 'POST',
        data
    })
}

// 删除一条评论
export function apiDeleteComment(id) {
    return request({
        url: `/api/comment/${id}`,
        method: 'DELETE',
    })
}

// 删除所有评论
export function apiDeleteAllComments() {
    return request({
        url: '/api/comment',
        method: 'DELETE',
    })
}