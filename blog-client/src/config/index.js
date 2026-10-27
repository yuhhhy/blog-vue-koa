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

const currentEnvConfig = envConfig[env] || envConfig.production

export default {
    env,
    baseApi: currentEnvConfig.baseApi,
    baseUrl: currentEnvConfig.baseUrl,
    analyticsEnabled: import.meta.env?.PROD === true && import.meta.env?.VITE_ANALYTICS_ENABLED === 'true',
    analyticsEndpoint: import.meta.env?.VITE_ANALYTICS_ENDPOINT || '',
    analyticsSiteId: import.meta.env?.VITE_ANALYTICS_SITE_ID || 'personal-blog',
}
