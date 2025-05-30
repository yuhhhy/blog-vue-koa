import request from "@/utils/request.js"

/**
 * Blog API
 * @returns {Promise}
 */

// 获取博客列表
export function apiGetBlogList() {
    return request({
        url: '/blog/bloglist',
        method: 'GET',
    })
}

// 创建新博客
export function apiCreateBlog(data) {
    return request({
        url: '/blog',
        method: 'POST',
        data,
        requireAuth: true
    })
}

// 删除博客
export function apiDeleteBlog(blogId) {
    return request({
        url: `/blog/${blogId}`,
        method: 'DELETE',
        requireAuth: true
    })
}

// 删除所有博客
export function apiDeleteAllBlogs() {
    return request({
        url: '/blog',
        method: 'DELETE',
        requireAuth: true
    })
}

// 更新博客
export function apiUpdateBlog(data) {
    return request({
        url: `/blog/${data.id}`,
        method: 'PUT',
        data,
        requireAuth: true
    })
}