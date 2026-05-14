// 环境变量
const env = import.meta.env?.MODE || 'production'

const envConfig = {
    development: {
        baseApi: 'http://localhost:3000/api'
    },
    production: {
        baseApi: '/api',
    }
}

const currentEnvConfig = envConfig[env] || envConfig.production

export default {
    env,
    baseApi: currentEnvConfig.baseApi
}
