import request from "../utils/request.js"

/**
 * Blog Content API
 * @returns {Promise}
 */

// 创建博客内容
export function apiCreateBlogContent(data) {
    return request({
        url: '/api/blogcontent',
        method: 'POST',
        data
    })
}

// 获取博客内容
export function apiGetBlogContent(blogId) {
    return request({
        url: `/api/blogcontent/${blogId}`,
        method: 'GET'
    })
}

// 删除所有博客内容
export function apiDeleteAllBlogContent() {
    return request({
        url: '/api/blogcontent',
        method: 'DELETE'
    })
}

// 更新博客内容
export function apiUpdateBlogContent(blogId, data) {
    return request({
        url: `/api/blogcontent/${blogId}`,
        method: 'PUT',
        data
    })
}

// 更新博客的浏览量
export function apiUpdateBlogViewCount(blogId) {
    return request({
        url: `/api/blogcontent/view/${blogId}`,
        method: 'PUT',
    })
}

// 更新博客的点赞数
export function apiUpdateBlogLikeCount(blogId) {
    return request({
        url: `/api/blogcontent/like/${blogId}`,
        method: 'PUT',
    })
}