import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    blogId: { type: String, required: true }, // 评论所属的博客文章的 ID
    id: { type: String, required: true },    // 评论的 ID
    parentId: { type: String, required: true }, // 父评论的 ID，如果是一级评论则为''
    avatar: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true },
    content: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    isReply: { type: Boolean, required: true }, // 是否显示回复表单
    firstLevel : { type: Boolean, required: true }, // 是否是一级评论
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // 回复的评论列表，使用自身的类型来定义
})

export const Comment = mongoose.model('Comment', CommentSchema)