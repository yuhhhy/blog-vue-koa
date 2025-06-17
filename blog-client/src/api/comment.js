import request from "@/utils/request.js"

/**
 * Comment API
 * @returns {Promise}
 */

// 获取博客所有评论
export function apiGetComments(blogId) {
    return request({
        url: `/comment/${blogId}`,
        method: 'GET',
    })
}

// 创建新评论
export function apiCreateComment(data) {
    return request({
        url: '/comment',
        method: 'POST',
        data
    })
}

// 更新评论
export function apiUpdateComment(data) {
    return request({
        url: `/comment/${data.id}`,
        method: 'PUT',
        data
    })
}

// 给父评论的邮箱发送邮件通知
export function apiSendEmailNotification(parentId, replyUsername, replyContent, blogId, createTime) {
    return request({
        url: '/comment/email',
        method: 'POST',
        data: {
            parentId,
            replyUsername,
            replyContent,
            blogId,
            createTime
        }
    })
}