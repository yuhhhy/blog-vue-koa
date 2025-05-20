import request from "../utils/request.js"

/**
 * Website Data API
 * @returns {Promise}
 */

// 获取网站访问量
export function apiGetWebsiteData() {
    return request({
        url: '/api/website',
        method: 'GET',
    })
}

// 更新网站访问量
export function apiUpdateWebsiteVisit() {
    return request({
        url: '/api/website/visit',
        method: 'PUT',
    })
}

// 更新网站浏览量
export function apiUpdateWebsiteView() {
    return request({
        url: '/api/website/view',
        method: 'PUT',
    })
}

// 更新网站最后更新时间
export function apiUpdateWebsiteLastUpdate() {
    return request({
        url: '/api/website/lastupdate',
        method: 'PUT',
    })
}
