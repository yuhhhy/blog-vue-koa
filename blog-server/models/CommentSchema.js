import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    id: { type: String, required: true },    // 评论的 ID
    blogId: { type: String, required: true }, // 评论所属的博客文章的 ID，如果是关于页则为'-1'
    parentId: { type: String, required: true }, // 父评论的 ID，如果是一级评论则为'-1'
    avatar: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: false },
    content: { type: String, required: true },
    createTime: { type: Date, default: Date.now },
    showForm: { type: Boolean, required: true }, // 是否显示回复表单
    hasParent : { type: Boolean, required: true }, // 是否是有父评论
    replies: { type: [String], required: true } // 回复的评论 ID 数组
})

export const Comment = mongoose.model('Comment', CommentSchema)