import Koa from 'koa'
import cors from 'koa2-cors'
import { connectDB } from './config/db.js'
import bodyParser from 'koa-bodyparser'
import router from './routes/api.js'

const app = new Koa()

// 连接数据库
connectDB()

// 解决跨域问题
app.use(cors({
    origin: '*',
}))

// 对所有请求进行打印
app.use(async (ctx, next) => {
    console.log(`in app.js 请求方法：${ctx.request.method} 请求路径：${ctx.request.url}`)
    await next()
})

// 解析 request.body
app.use(bodyParser())


// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())


app.listen(3000)

console.log('Server is running on http://localhost:3000')