// 环境变量
const env = import.meta.env?.MODE || 'production'

const envConfig = {
    development: {
        baseApi: 'http://localhost:3000/api',
        baseUrl: 'http://localhost:3000'
    },
    production: {
        baseApi: 'https://api.yuhhhy.cn/api',
        baseUrl: 'https://api.yuhhhy.cn'
    }
}

export default {
    env,
    baseApi: envConfig[env].baseApi,
    baseUrl: envConfig[env].baseUrl
}