// 环境变量
const env = import.meta.env?.MODE || 'production'

const envConfig = {
    development: {
        baseApi: 'http://localhost:3000/api',
        baseUrl: 'http://localhost:3000'
    },
    production: {
        baseApi: '/api',
        baseUrl: 'https://yuhhhy.cn' // + /images/ 或 /api/ 会被代理到后端
    }
}

export default {
    env,
    baseApi: envConfig[env].baseApi,
    baseUrl: envConfig[env].baseUrl
}