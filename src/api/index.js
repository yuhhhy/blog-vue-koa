import request from "../utils/request.js"

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

export const apiDeleteAllBlogs = () => {
  return request({
    url: '/api/posts',
    method: 'DELETE'
  })
}

