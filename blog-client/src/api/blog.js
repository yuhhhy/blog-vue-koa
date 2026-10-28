import request from "@/utils/request.js"

/**
 * Blog API
 * @returns {Promise}
 */

// 获取博客列表
export function apiGetBlogList() {
    return request({
        url: '/blog/bloglist',
        method: 'GET'
    })
}

// 获取单个博客
export function apiFetchBlogData(blogId) {
    return request({
        url: `/blog/${blogId}`,
        method: 'GET'
    })
}
