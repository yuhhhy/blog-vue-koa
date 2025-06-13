import envConfig from './env.js'
import winston from "winston"
const { combine, colorize, timestamp, printf } = winston.format

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
}

const myFormat = combine(
    colorize(),
    timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`
    })
)

// 日志写入到文件
const logger = winston.createLogger({
    // 设置日志等级
    levels: levels,
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'blog-service' },
    transports: [
        // 写入错误等级小等于 error 的错误日志
        new winston.transports.File({ filename: './log/error.log', level: 'error' }),
        // 写入错误等级小于等于 info 的错误日志
        new winston.transports.File({ filename: './log/combined.log' }),
    ],
})

// 如果是开发环境，添加控制台输出
if (envConfig.currentEnv == 'development') {
    logger.add(new winston.transports.Console({
        format: myFormat
    }))
}

export default logger