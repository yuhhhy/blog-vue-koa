import request from '@/utils/request.js'

/**
 * Links API
 * @returns {Promise}
 */

// 获取所有友链
export function getLinks() {
  return request({
    url: '/links',
    method: 'get'
  })
}

// 创建友链
export function createLink(data) {
  return request({
    url: '/links',
    method: 'post',
    data,
    requireAuth: true
  })
}

// 更新友链
export function updateLink(data) {
  return request({
    url: `/links/${data.id}`,
    method: 'put',
    data,
    requireAuth: true
  })
}

// 删除友链
export function deleteLink(id) {
  return request({
    url: `/links/${id}`,
    method: 'delete',
    requireAuth: true
  })
}