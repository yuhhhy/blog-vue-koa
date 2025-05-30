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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Koa()

// 连接数据库
connectDB()

// 解决跨域问题
app.use(cors({
    origin: '*'
}))

// 对所有请求进行打印
app.use(async (ctx, next) => {
    console.log(`${ctx.request.method}请求 ${ctx.request.url}`)
    await next()
})

// 解析 request.body
app.use(bodyParser())


// 代理静态资源目录，让前端可以访问到public目录下的文件
app.use(serve(path.join(__dirname, '../public')))


// 处理文件上传
const upload = multer({ storage })
app.use(upload.single('file')) // 处理单个文件上传，注意这里的 'file' 要和前端上传时的 name 对应


// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, '0.0.0.0') // 监听所有网络接口（0.0.0.0）

console.log('Server is running on http://localhost:3000')