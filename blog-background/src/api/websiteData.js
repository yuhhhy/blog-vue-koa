import request from "@/utils/request.js"

/**
 * Website Data API
 * @returns {Promise}
 */

// 更新网站最后更新时间
export function apiUpdateWebsiteLastUpdate() {
    return request({
        url: '/website/lastupdate',
        method: 'PUT',
    })
}

// 更新网站总字数
export function apiUpdateWebsiteTotalWordCount() {
    return request({
        url: '/website/totalwordcount',
        method: 'PUT'
    })
}