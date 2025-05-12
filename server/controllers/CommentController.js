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
        console.log('评论创建成功，id: ', newComment.id)
    } catch (error) {
        console.error('Error creating comment:', error) // 记录完整错误
        ctx.status = 500 
        ctx.body = { message: '评论创建失败', error: error.message }
    }
}


// export const getComments = async (ctx) => {
//     try {
//       const { blogId } = ctx.params
//       const comments = await Comment.find({ blogId }).lean()
      
//       // 构建嵌套结构
//       const buildTree = (items, parentId = '') => {
//         return items
//           .filter(item => item.parentId === parentId)
//           .map(item => ({
//             ...item,
//             replies: buildTree(items, item.id)
//           }))
//       }
      
//       ctx.body = buildTree(comments)
//     } catch (error) {
//       ctx.status = 500
//       ctx.body = { message: '获取评论失败', error: error.message }
//     }
//   }

// export function buildCommentTree(comments) {
//     const map = {}
//     const roots = []
    
//     // 创建映射表
//     comments.forEach(comment => {
//       map[comment.id] = { ...comment, replies: [] }
//     })
    
//     // 构建树结构
//     comments.forEach(comment => {
//       if (comment.parentId && map[comment.parentId]) {
//         map[comment.parentId].replies.push(map[comment.id])
//       } else {
//         roots.push(map[comment.id])
//       }
//     })
    
//     return roots
//   }

// 3. 使用示例 ：
// import { buildCommentTree } from '@/

// utils/commentHelper'

// // ... existing code ...

// const comments = ref ( [ ] )

// onMounted ( async ( ) => {

// const { data } = await

// apiGetComments ( blogId . value )

// comments . value = buildCommentTree

// ( data )