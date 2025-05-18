import { User } from '../models/UserSchema.js'

/**
 * User Controller
 * 用于处理用户相关的操作，包括获取用户列表、创建用户、删除用户、更新用户等。
 */

// 用户登录
export const userLogin = async (ctx) => {
    const { username, password } = ctx.request.body // 从请求体中获取用户名和密码
    const user = await User.findOne({ username, password }) // 在数据库中查找用户
    if (user) {
        ctx.status = 200
        ctx.body = {
            code: 200,
            message: "登录成功",
            data: {
                success: "true",
                username: user.username,
                userid: user.userId,
            }
        }
    }
    else {
        ctx.status = 401
        ctx.body = {
            message: '用户名或密码错误',
        }
    }
}

// 获取用户列表
export const getuserList = async (ctx) => {
    const users = await User.find({})
    ctx.status = 200
    ctx.body = users
}

// 获取用户
export const getUser = async (ctx) => {
    const { id } = ctx.params
    const user = await User.findOne({ userId: id })
    if (user) {
        ctx.status = 200
        ctx.body = user
    } else {
        ctx.status = 404
        ctx.body = {
            message: '用户不存在',
        }
    }
}

// 创建用户
export const createUser = async (ctx) => {
    const { userId, username, password, email } = ctx.request.body
    const existingUser = await User.findOne({ userId })
    if (existingUser) {
        ctx.status = 400
        ctx.body = {
            message: '用户已存在',
        }
    } else {
        const newUser = new User({ userId, username, password, email, role: 'user' })
        await newUser.save()
        ctx.status = 201
        ctx.body = {
            message: '用户创建成功',
            data: newUser,
        }
    }
}

// 删除用户
export const deleteUser = async (ctx) => {
    const { id } = ctx.params
    const user = await User.findOne({ userId: id })
    if (user) {
        await User.deleteOne({ userId: id })
        ctx.status = 200
        ctx.body = {
            message: '用户删除成功',
        }
    }
    else {
        ctx.status = 404
        ctx.body = {
            message: '用户不存在',
        }
    }
}

// 更新用户
export const updateUser = async (ctx) => {
    const { id } = ctx.params
    const { username, password, email } = ctx.request.body
    const user = await User.findOne({ userId: id })
    if (user) {
        user.username = username
        user.password = password
        user.email = email
        await user.save()
        ctx.status = 200
        ctx.body = {
            message: '用户更新成功',
            data: user,
        }
    } else {
        ctx.status = 404
        ctx.body = {
            message: '用户不存在',
        }
    }
}