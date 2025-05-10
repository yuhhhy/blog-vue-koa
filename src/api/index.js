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
export function apiDeleteAllBlogs(){
  return request({
    url: '/api/blog',
    method: 'DELETE'
  })
}

/*
* Blog Content API
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

// 更新博客的浏览量
export function apiUpdateBlogViewCount(blogId) {
    return request({
        url: `/api/blogcontent/${blogId}`,
        method: 'PUT',
        data: { viewCount: 1 }
    })
}

// 删除所有博客内容
export function apiDeleteAllBlogContent() {
    return request({
        url: '/api/blogcontent',
        method: 'DELETE'
    })
}