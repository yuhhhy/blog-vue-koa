import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envConfig = {
    development: {
        currentEnv: 'development',
        port: 3000,
        allowOrigins: [
            'http://localhost:8080',
            'http://localhost:8096',
        ],
        // 前端请求的静态资源文件路径
        staticResourceFilePath: path.join(__dirname, "../../public"),
        baseUrl: 'http://localhost:3000',
    },
    production: {
        currentEnv: 'production',
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
    }
}

const selectedEnvConfig = envConfig['development'] // 根据环境选择配置
export default selectedEnvConfig