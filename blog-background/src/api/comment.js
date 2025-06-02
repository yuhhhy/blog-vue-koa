import request from "@/utils/request.js"

/**
 * Comment API
 * @returns {Promise}
 */

// 获取网站所有评论
export function apiGetAllComments() {
    return request({
        url: '/comment',
        method: 'GET',
    })
}

// 获取博客所有评论
export function apiGetComments(blogId) {
    return request({
        url: `/comment/${blogId}`,
        method: 'GET',
    })
}

// 审核一条评论
export function apiReviewComment(commentId, passed) {
    return request({
        url: `/comment/review/${commentId}`,
        method: 'PUT',
        data: { passed },
        requireAuth: true
    })
}

// 删除一条评论
export function apiDeleteComment(id) {
    return request({
        url: `/comment/${id}`,
        method: 'DELETE',
        requireAuth: true
    })
}