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

// 获取上一篇博客
export function apiGetPrevArticle(blogId) {
    return request({
        url: `/blog/prev/${blogId}`,
        method: 'GET'
    })
}

// 获取下一篇博客
export function apiGetNextArticle(blogId) {
    return request({
        url: `/blog/next/${blogId}`,
        method: 'GET'
    })
}