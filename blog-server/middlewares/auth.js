import jwt from 'jsonwebtoken'
import KEY from '../config/key.js'

export const authMiddleware = async (ctx, next) => {
    let requireAuth = ctx.request.headers['require-auth']

    // 如果前端请求请求头有 require-auth: true，或者访问的是上传接口，则需要校验 token
    if (requireAuth) {

        // 检查是否登录
        const authorization = ctx.request.headers.authorization
        if (!authorization) {
            ctx.status = 401
            ctx.body = {
                code: 401,
                message: '请先登录'
            }
            return
        }

        // 检查token和权限
        try {
            const token = authorization.split(' ')[1]
            const decoded = jwt.verify(token, KEY)

            // 检查JWT payload中的用户角色字段
            if (decoded.role !== 'admin') {
                ctx.status = 403
                ctx.body = {
                    code: 403,
                    message: '权限不足，需要管理员权限'
                }
                return
            }
            
            await next()
        } catch (error) {
            ctx.status = 400
            ctx.body = {
                code: 400,
                message: 'token过期，请重新登录'
            }
        }
    } else {
        await next()
        return
    }
}