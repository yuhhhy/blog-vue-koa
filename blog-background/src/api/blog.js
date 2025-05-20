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

// 更新博客
export function apiUpdateBlog(data) {
    return request({
        url: `/blog/${data.id}`,
        method: 'PUT',
        data
    })
}