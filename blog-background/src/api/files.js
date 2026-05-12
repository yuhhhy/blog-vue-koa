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
        requireAuth: true
    });
};

/**
 * 删除图片
 * @param {string} filename - 文件名
 */
export function apiDeleteImage(filename) {
  return request({
    url: `/files/images/${filename}`,
    method: "DELETE",
    requireAuth: true,
  });
};

// 获取 Markdown 文件列表
export function apiGetMdList() {
  return request({
    url: '/files/mds',
    method: 'GET',
    requireAuth: true
  });
}

// 删除 Markdown 文件
export function apiDeleteMd(filename) {
  return request({
    url: `/files/mds/${filename}`,
    method: "DELETE",
    requireAuth: true,
  });
}

export function apiGetLargeFileList() {
  return request({
    url: '/files/large',
    method: 'GET',
    requireAuth: true,
  });
}

export function apiDeleteLargeFile(type, filename) {
  return request({
    url: `/files/large/${type}/${encodeURIComponent(filename)}`,
    method: 'DELETE',
    requireAuth: true,
  });
}

export function apiDownloadLargeFile(type, filename) {
  return request({
    url: `/files/large/${type}/${encodeURIComponent(filename)}/download`,
    method: 'GET',
    requireAuth: true,
    responseType: 'blob',
    timeout: 0,
  });
}

export function apiGetLargeUploadStatus(fileHash) {
  return request({
    url: '/upload/large/status',
    method: 'GET',
    params: { fileHash },
    requireAuth: true,
  });
}

export function apiUploadLargeChunk(formData, onUploadProgress, signal) {
  return request({
    url: '/upload/large/chunk',
    method: 'POST',
    data: formData,
    requireAuth: true,
    timeout: 0,
    signal,
    onUploadProgress,
  });
}

export function apiMergeLargeFile(data) {
  return request({
    url: '/upload/large/merge',
    method: 'POST',
    data,
    requireAuth: true,
    timeout: 0,
  });
}
