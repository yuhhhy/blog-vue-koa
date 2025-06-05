import request from "@/utils/request.js"

/**
 * Website Data API
 * @returns {Promise}
 */

// 获取网站数据
export function apiGetWebsiteData(timeRange = 'all') {
    return request({
        url: '/website',
        method: 'GET',
        params: { timeRange }
    })
}

// 更新网站最后更新时间
export function apiUpdateWebsiteLastUpdate() {
    return request({
        url: '/website/lastupdate',
        method: 'PUT',
        requireAuth: true
    })
}

// 更新网站总字数
export function apiUpdateWebsiteTotalWordCount() {
    return request({
        url: '/website/totalwordcount',
        method: 'PUT',
        requireAuth: true
    })
}

// 更新网站总博客数
export function apiUpdateWebsiteArticle() {
    return request({
        url: '/website/article',
        method: 'PUT',
        requireAuth: true
    })
} 