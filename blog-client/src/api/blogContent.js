import request from "@/utils/request.js"
import { isAdminVisitorMode } from '@/utils/adminVisitorMode.js'

const blogContentCache = new Map()
const blogContentRequests = new Map()

/**
 * Blog Content API
 * @returns {Promise}
 */

// 获取博客内容
export function apiGetBlogContent(blogId) {
    if (blogContentCache.has(blogId)) {
        return Promise.resolve(blogContentCache.get(blogId))
    }

    if (blogContentRequests.has(blogId)) {
        return blogContentRequests.get(blogId)
    }

    const contentRequest = request({
        url: `/blogcontent/${blogId}`,
        method: 'GET'
    })
        .then((data) => {
            blogContentCache.set(blogId, data)
            return data
        })
        .finally(() => blogContentRequests.delete(blogId))

    blogContentRequests.set(blogId, contentRequest)
    return contentRequest
}

export const apiPrefetchBlogContent = (blogId) => apiGetBlogContent(blogId)
export const getCachedBlogContent = (blogId) => blogContentCache.get(blogId)

// 获取所有博客内容
export function apiGetBlogContentList() {
    return request({
        url: '/blogcontent',
        method: 'GET'
    })
}

// 获取博客搜索索引
export function apiGetBlogContentSearchIndex() {
    return request({
        url: '/blogcontent/search-index',
        method: 'GET'
    })
}

// 更新博客的浏览量
export function apiUpdateBlogViewCount(blogId) {
    if (isAdminVisitorMode()) return Promise.resolve(null)

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
