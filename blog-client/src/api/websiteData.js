import request from "@/utils/request.js"

/**
 * Website Data API
 * @returns {Promise}
 */

// 获取网站数据
export function apiGetWebsiteData() {
    return request({
        url: '/website/count',
        method: 'GET',
    })
}

// 更新网站访问量
export function apiUpdateWebsiteVisit() {
    return request({
        url: '/website/visit',
        method: 'PUT',
    })
}

// 更新网站浏览量
export function apiUpdateWebsiteView() {
    return request({
        url: '/website/view',
        method: 'PUT',
    })
}

// 更新总评论量
export function apiUpdateWebsiteComment() {
    return request({
        url: '/website/comment',
        method: 'PUT'
    })
}