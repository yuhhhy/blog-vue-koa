import jwt from 'jsonwebtoken'
import KEY from '../config/key.js'

const getTokenFromHeader = (authorization) => {
    if (!authorization) return null

    const [scheme, token] = authorization.split(' ')
    if (scheme !== 'Bearer' || !token) return null

    return token
}

const unauthorized = (ctx) => {
    ctx.status = 401
    ctx.body = {
        code: 401,
        message: '请先登录'
    }
}

const tokenInvalid = (ctx) => {
    ctx.status = 400
    ctx.body = {
        code: 400,
        message: 'token过期，请重新登录'
    }
}

const forbidden = (ctx) => {
    ctx.status = 403
    ctx.body = {
        code: 403,
        message: '权限不足，需要管理员权限'
    }
}

export const authMiddleware = async (ctx, next) => {
    const token = getTokenFromHeader(ctx.request.headers.authorization)

    if (token) {
        try {
            ctx.state.user = jwt.verify(token, KEY)
        } catch (error) {
            ctx.state.user = null
        }
    }

    await next()
}

export const requireAdmin = async (ctx, next) => {
    const token = getTokenFromHeader(ctx.request.headers.authorization)

    if (!token) {
        unauthorized(ctx)
        return
    }

    try {
        const decoded = jwt.verify(token, KEY)

        if (decoded.role !== 'admin') {
            forbidden(ctx)
            return
        }

        ctx.state.user = decoded
        await next()
    } catch (error) {
        tokenInvalid(ctx)
    }
}
