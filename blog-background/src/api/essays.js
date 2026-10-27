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
