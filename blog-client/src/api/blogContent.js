import request from "@/utils/request.js"

/**
 * Blog Content API
 * @returns {Promise}
 */

// 获取博客内容
export function apiGetBlogContent(blogId) {
    return request({
        url: `/blogcontent/${blogId}`,
        method: 'GET'
    })
}

// 更新博客的浏览量
export function apiUpdateBlogViewCount(blogId) {
    return request({
        url: `/blogcontent/view/${blogId}`,
        method: 'PUT',
    })
}

// 更新博客的点赞数
export function apiUpdateBlogLikeCount(blogId) {
    return request({
        url: `/blogcontent/like/${blogId}`,
        method: 'PUT',
    })
}