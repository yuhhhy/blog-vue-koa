import { Links } from "../models/LinksSchema.js"

// 获取所有友链
export const getLinks = async (ctx) => {
    const links = await Links.find({})
    ctx.status = 200
    ctx.body = links
}

// 创建友链
export const createLink = async (ctx) => {
    console.log(ctx.request.body)
    
    const { id, name, description, site, avatar, category = 'friend' } = ctx.request.body
    const link = new Links({ id, name, description, site, avatar, category })
    await link.save()
    ctx.status = 201
    ctx.body = link
}

// 删除友链
export const deleteLink = async (ctx) => {
    const { id } = ctx.params
    await Links.findOneAndDelete({ id })
    ctx.status = 204
}

// 更新友链
export const updateLink = async (ctx) => {
    const { id } = ctx.params
    const { name, description, site, avatar, category = 'friend' } = ctx.request.body
    const updatedLink = await Links.findOneAndUpdate({ id }, { name, description, site, avatar, category })
    ctx.status = 200
    ctx.body = updatedLink
}
