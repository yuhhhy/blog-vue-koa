// 环境配置封装在 config/index.js 中
const env = import.meta.env.MODE || 'production' // 当前环境变量
const envConfig = {
    development: {
        baseApi: 'http://localhost:3000/api', // 开发环境接口地址(目前用Mockjs代替)
        mockApi: '', // mock接口地址
    },
    production: {
        baseApi: 'http://localhost:3000/api',
        mockApi: '',
    }
}

export default {
    env,
    mock: false, // 是否开启mock
    ...envConfig[env] // 合并环境变量配置
}