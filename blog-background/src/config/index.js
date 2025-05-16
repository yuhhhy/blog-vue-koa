// 环境配置封装在 config/index.js 中
const env = import.meta.env.MODE || 'production' // 当前环境变量
const envConfig = {
    development: {
        baseApi: '', // 开发环境接口地址(目前用Mockjs代替)
        mockApi: '', // apifox的mock接口地址 http://127.0.0.1:4523/m1/6133824-5825578-default
    },
    production: {
        baseApi: '',
        mockApi: '',
    }
}

export default {
    env,
    mock: true, // 是否开启mock
    ...envConfig[env] // 合并环境变量配置
}