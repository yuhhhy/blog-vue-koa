import request from "@/utils/request"

export function apiGetBlogList() {
    return request({
        url: '/api/bloglist',
        method: 'GET'
    })
}

export function apiFetchBlogData(blogId) {
    return request({
        url: `/api/blog/${blogId}`,
        method: 'GET'
    })
}

export function apiCreateBlog(data) {
    return request({
        url: '/api/blog',
        method: 'POST',
        data
    })
}

export function apiDeleteBlog(blogId) {
    return request({
        url: `/api/blog/${blogId}`,
        method: 'DELETE'
    })
}

