import request from '@/utils/request.js'

export const apiGetEssays = () => request({ url: '/essays', method: 'GET' })

export const apiCreateEssay = (data) => request({
    url: '/essays',
    method: 'POST',
    data,
    requireAuth: true,
})

export const apiUpdateEssay = (id, data) => request({
    url: `/essays/${id}`,
    method: 'PUT',
    data,
    requireAuth: true,
})

export const apiDeleteEssay = (id) => request({
    url: `/essays/${id}`,
    method: 'DELETE',
    requireAuth: true,
})

export const apiGetEssayDrafts = () => request({
    url: '/essay-drafts',
    method: 'GET',
    requireAuth: true,
})

export const apiGetEssayDraft = (id) => request({
    url: `/essay-drafts/${id}`,
    method: 'GET',
    requireAuth: true,
    suppressError: true,
})

export const apiCreateEssayDraft = (data) => request({
    url: '/essay-drafts',
    method: 'POST',
    data,
    requireAuth: true,
})

export const apiUpdateEssayDraft = (id, data) => request({
    url: `/essay-drafts/${id}`,
    method: 'PUT',
    data,
    requireAuth: true,
})

export const apiDeleteEssayDraft = (id) => request({
    url: `/essay-drafts/${id}`,
    method: 'DELETE',
    requireAuth: true,
    suppressError: true,
})
