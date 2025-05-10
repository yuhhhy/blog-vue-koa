import { Comment } from '../models/CommentSchema.js'

/*
* Comment Controller
* 用于处理评论相关的操作，包括获取评论列表、创建新评论。
* 这些操作将直接与数据库交互，返回相应的结果。
*/
// 获取博客的所有评论
export const getComments = async (ctx) => {
    const { id } = ctx.request.params
    const comments = await Comment.find({ blogId: id }) // 从数据库获取所有评论
    ctx.status = 200
    ctx.body = comments
}

// 创建新评论
export const createComment = async (ctx) => {
    // POST 请求体作为数据，创建新评论到数据库
    const newComment = new Comment(ctx.request.body)
    try {
        await newComment.save()
        ctx.status = 201 // 201 Created 状态码
        ctx.body = { message: '评论创建成功', comment: newComment }
    } catch (error) {
        ctx.status = 500 
        ctx.body = { message: '评论创建失败', error: error.message }
    }
}