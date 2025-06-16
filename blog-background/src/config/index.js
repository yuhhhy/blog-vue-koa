// 环境变量
const env = import.meta.env?.MODE || 'production'

const envConfig = {
    development: {
        baseApi: 'http://localhost:3000/api'
    },
    production: {
        baseApi: 'http://api.yuhhhy.cn/api',
    }
}

export default {
    env,
    baseApi: envConfig[env].baseApi
}