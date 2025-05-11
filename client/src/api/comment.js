import request from "../utils/request.js"

/*
* Comment API
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