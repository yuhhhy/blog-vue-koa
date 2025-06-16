import Koa from 'koa'
import cors from 'koa2-cors'
import { connectDB } from './config/db.js'
import bodyParser from 'koa-bodyparser'
import router from './routes/api.js'
import serve from 'koa-static'
import multer from '@koa/multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { storage } from './config/upload.js'
import { authMiddleware } from './middlewares/auth.js'
import envConfig from './config/env.js'
import logger from './config/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建 Koa 实例
const app = new Koa()

// 连接数据库
connectDB()

// 解决跨域问题
app.use(cors({
    origin: (ctx) => {
        const allowedOrigins = envConfig.allowOrigins
        const origin = ctx.request.header.origin
        return allowedOrigins.includes(origin) ? origin : false
    },
    credentials: true, // 允许携带 Cookie
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'require-auth'], // 允许的请求头
    maxAge: 86400 // 缓存预检请求结果24小时(秒)，减少OPTIONS请求
}))

// 增加一个OPTIONS请求处理中间件，快速响应预检请求
app.use(async (ctx, next) => {
    if (ctx.method === 'OPTIONS') {
        ctx.status = 204; // 预检请求成功状态码
        return;
    }
    await next();
});

// 日志中间件
app.use(async (ctx, next) => {
    const msg = `[${ctx.request.method}] (${ctx.request.headers['require-auth'] ? 'auth' : 'noAuth'}) ${ctx.request.url}`
    logger.info(msg)
    await next()
})

// 解析 request.body
app.use(bodyParser())

// 代理静态资源，让前端可以访问到后端指定目录下的文件
if(envConfig.currentEnv === 'development') {
    app.use(serve(path.join(__dirname, envConfig.staticResourceFilePath)))
} else {
    // 生产环境下，静态资源路径可能需要根据实际部署情况调整
    app.use(serve(envConfig.staticResourceFilePath))
}

// 处理文件上传
const upload = multer({ storage })
app.use(upload.single('file')) // 处理单个文件上传，注意这里的 'file' 要和前端上传时的 name 对应

// 注册鉴权中间件
app.use(authMiddleware)

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(envConfig.port , '0.0.0.0') // 监听所有 IP 地址

console.log(`Server is running on port ${envConfig.port}`)