import { Comment } from '../models/CommentSchema.js'

/**
 * Comment Controller
 * 用于处理评论相关的操作，包括获取评论列表、创建新评论。
 * 这些操作将直接与数据库交互，返回相应的结果。
 */

// 获取网站的所有评论
export const getAllComments = async (ctx) => {
    const allComments = await Comment.find({})

    ctx.status = 200
    ctx.body = allComments
}

// 获取博客的所有评论
export const getComments = async (ctx) => {
    const { id } = ctx.request.params
    // 使用 lean() 获取纯对象
    // 否则会返回 Mongoose 文档对象，包含额外的方法和属性
    const comments = await Comment.find({ blogId: id, reviewed: true, reviewPassed: true }).lean()

    // 使用递归构建嵌套结构，返回对象数组给前端
    const buildTree = (items, parentId = '-1') => {
    return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
        ...item,
        replies: buildTree(items, item.id)
        }))
    }
    ctx.status = 200
    ctx.body = buildTree(comments)
}

// 创建新评论
export const createComment = async (ctx) => {
    const newComment = new Comment(ctx.request.body)
    try {
        // 保存评论到数据库
        await newComment.save()
        // 如果有父评论，更新父评论的 replies 字段
        if (newComment.hasParent) {
            await Comment.findOneAndUpdate( {id: newComment.parentId}, { $push: { replies: newComment.id } })
        }
        ctx.status = 201 // 201 Created
        ctx.body = { message: '评论创建成功', comment: newComment }   
    } catch (error) {
        ctx.status = 500 
        ctx.body = { message: '评论创建失败', error: error.message }
    }
}

// 审核评论
export const reviewComment = async (ctx) => {
    const { id } = ctx.params
    const { passed } = ctx.request.body
    const comment = await Comment.findOne({ id })
    comment.reviewed = true
    comment.reviewPassed = passed
    await comment.save()
    ctx.status = 200
    ctx.body = { message: '审核成功' }
}

// 删除一条评论
export const deleteComment = async (ctx) => {
    const { id } = ctx.params
    try {
        const comment = await Comment.findOneAndDelete({ id })

        if (!comment) {
            ctx.status = 404
            ctx.body = { message: '评论不存在' }
            return
        }
        ctx.status = 200
        ctx.body = { message: '评论删除成功' }
    } catch (error) {
        ctx.status = 500
        ctx.body = { message: '评论删除失败', error: error.message }
    }
}

// 更新评论
export const updateComment = async (ctx) => {
    const { id } = ctx.params
    const updateData = ctx.request.body

    try {
        const updatedComment = await Comment.findOneAndUpdate({ id }, updateData, { new: true })
        if (!updatedComment) {
            ctx.status = 404
            ctx.body = { message: '评论不存在' }
            return
        } else {
            ctx.status = 200
            ctx.body = { message: '评论更新成功', comment: updatedComment }
        }  
    }  catch (error) {
        ctx.status = 500
        ctx.body = { message: '评论更新失败', error: error.message }
    }
}