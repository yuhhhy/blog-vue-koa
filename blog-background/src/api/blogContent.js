import request from "@/utils/request.js"

/**
 * Blog Content API
 * @returns {Promise}
 */

// 获取所有博客内容
export function apiGetBlogContentList() {
    return request({
        url: '/blogcontent',
        method: 'GET'
    })
}

// 创建博客内容
export function apiCreateBlogContent(data) {
    return request({
        url: '/blogcontent',
        method: 'POST',
        data,
        requireAuth: true
    })
}

// 更新博客内容
export function apiUpdateBlogContent(data) {
    return request({
        url: `/blogcontent/${data.id}`,
        method: 'PUT',
        data,
        requireAuth: true
    })
}

// 删除博客内容
export function apiDeleteBlogContent(blogId) {
    return request({
        url: `/blogcontent/${blogId}`,
        method: 'DELETE',
        requireAuth: true
    })
}