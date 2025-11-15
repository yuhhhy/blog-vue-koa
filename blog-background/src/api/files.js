import request from "@/utils/request.js";

/**
 * 
 * File API
 * @returns {Promise}
 */

/**
 * 获取图片列表
 */
export function apiGetImageList() {
    return request({
        url: '/files/images',
        method: 'GET',
    });
};

/**
 * 删除图片
 * @param {string} filename - 文件名
 */
export function apiDeleteImage(filename) {
  return request({
    url: `/files/images/${filename}`,
    method: 'DELETE',
  });
};

// 获取 Markdown 文件列表
export function apiGetMdList() {
  return request({
    url: '/files/mds',
    method: 'GET',
  });
}

// 删除 Markdown 文件
export function apiDeleteMd(filename) {
  return request({
    url: `/files/mds/${filename}`,
    method: 'DELETE',
  });
}