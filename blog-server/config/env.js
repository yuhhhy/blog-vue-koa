import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envConfig = {
    development: {
        currentEnv: 'development',
        allowAnyLogin: true,
        // 开发环境默认使用内存 mock；设置 USE_MOCK_DATA=false 可切回 MongoDB。
        get useMockData() {
            return process.env.USE_MOCK_DATA !== 'false'
        },
        port: 3000,
        allowOrigins: [
            'http://localhost:8080',
            'http://localhost:8081',
            'http://localhost:8096',
            'http://localhost:8097',
        ],
        // 前端请求的静态资源文件路径
        staticResourceFilePath: path.join(__dirname, "../../public"),
        baseUrl: 'http://localhost:3000',
        get legacyVisitorWritesEnabled() {
            return process.env.LEGACY_VISITOR_WRITES_ENABLED !== 'false'
        },
    },
    production: {
        currentEnv: 'production',
        allowAnyLogin: false,
        useMockData: false,
        port: 3000,
        allowOrigins: [
            'https://yuhhhy.cn',
            'https://www.yuhhhy.cn',
            'https://admin.yuhhhy.cn',
            'https://42.192.41.225',
            'http://yuhhhy.cn',
            'http://www.yuhhhy.cn',
            'http://admin.yuhhhy.cn',
            'http://42.192.41.225',
        ],
        staticResourceFilePath: '/var/www/public',
        baseUrl: 'https://yuhhhy.cn',
        get legacyVisitorWritesEnabled() {
            return process.env.LEGACY_VISITOR_WRITES_ENABLED !== 'false'
        },
    }
}

const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const selectedEnvConfig = envConfig[currentEnv]
export default selectedEnvConfig
