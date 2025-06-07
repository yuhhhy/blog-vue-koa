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