import request from '@/utils/request.js'

export const apiGetEssays = () => request({
    url: '/essays',
    method: 'GET',
})
