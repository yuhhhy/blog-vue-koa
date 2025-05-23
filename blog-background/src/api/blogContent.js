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
        data
    })
}

// 更新博客内容
export function apiUpdateBlogContent(data) {
    return request({
        url: `/blogcontent/${data.id}`,
        method: 'PUT',
        data
    })
}

// 删除博客内容
export function apiDeleteBlogContent(blogId) {
    return request({
        url: `/blogcontent/${blogId}`,
        method: 'DELETE',
    })
}
