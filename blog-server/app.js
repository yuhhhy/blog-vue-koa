import Koa from 'koa'
import cors from 'koa2-cors'
import { connectDB } from './config/db.js'
import bodyParser from 'koa-bodyparser'
import router from './routes/api.js'
import serve from 'koa-static'
import path from 'path'
import { fileURLToPath } from 'url'

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
    console.log(`in app.js 请求方法：${ctx.request.method} 请求路径：${ctx.request.url}`)
    await next()
})

// 解析 request.body
app.use(bodyParser())

// 代理静态资源目录，让前端可以访问到public目录下的文件
app.use(serve(path.join(__dirname, '../public')))


// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, '0.0.0.0') // 禁用 IPv6

console.log('Server is running on http://localhost:3000')