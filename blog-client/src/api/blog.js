import request from "../utils/request.js"

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

// 通过标题获取博客
export function apiGetBlogByTitle(title) {
    return request({
        url: `/blog/title/${title}`,
        method: 'GET'
    })
}

// 创建新博客
export function apiCreateBlog(data) {
    return request({
        url: '/blog',
        method: 'POST',
        data
    })
}

// 删除博客
export function apiDeleteBlog(blogId) {
    return request({
        url: `/blog/${blogId}`,
        method: 'DELETE'
    })
}

// 删除所有博客
export function apiDeleteAllBlogs() {
    return request({
        url: '/blog',
        method: 'DELETE'
    })
}

// 更新博客
export function apiUpdateBlog(blogId, data) {
    return request({
        url: `/blog/${blogId}`,
        method: 'PUT',
        data
    })
}