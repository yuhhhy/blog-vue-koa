import request from '@/utils/request.js'

export function apiGetArticleDrafts() {
    return request({
        url: '/drafts',
        method: 'GET',
        requireAuth: true,
        suppressError: true,
    })
}

export function apiGetArticleDraft(id) {
    return request({
        url: `/drafts/${id}`,
        method: 'GET',
        requireAuth: true,
        suppressError: true,
    })
}

export function apiCreateArticleDraft(data) {
    return request({
        url: '/drafts',
        method: 'POST',
        data,
        requireAuth: true,
        suppressError: true,
    })
}

export function apiUpdateArticleDraft(id, data) {
    return request({
        url: `/drafts/${id}`,
        method: 'PUT',
        data,
        requireAuth: true,
        suppressError: true,
    })
}

export function apiDeleteArticleDraft(id) {
    return request({
        url: `/drafts/${id}`,
        method: 'DELETE',
        requireAuth: true,
        suppressError: true,
    })
}

export function apiPublishArticleDraft(id, version) {
    return request({
        url: `/drafts/${id}/publish`,
        method: 'POST',
        data: { version },
        requireAuth: true,
        suppressError: true,
    })
}
