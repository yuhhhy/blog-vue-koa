import request from "../utils/request.js"

/*
* Blog API
*/
// 获取博客列表
export function apiGetBlogList() {
    return request({
        url: '/api/blog/bloglist',
        method: 'GET'
    })
}

// 获取单个博客
export function apiFetchBlogData(blogId) {
    return request({
        url: `/api/blog/${blogId}`,
        method: 'GET'
    })
}

// 创建新博客
export function apiCreateBlog(data) {
    return request({
        url: '/api/blog',
        method: 'POST',
        data
    })
}

// 删除博客
export function apiDeleteBlog(blogId) {
    return request({
        url: `/api/blog/${blogId}`,
        method: 'DELETE'
    })
}

// 删除所有博客
export function apiDeleteAllBlogs() {
    return request({
        url: '/api/blog',
        method: 'DELETE'
    })
}
