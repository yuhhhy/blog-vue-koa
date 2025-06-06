import { Links } from "../models/LinksSchema.js"

// 获取所有友链
export const getLinks = async (ctx) => {
    const links = await Links.find({})
    ctx.status = 200
    ctx.body = links
}

// 创建友链
export const createLink = async (ctx) => {
    const { name, description, site, avatar } = ctx.request.body
    const link = new Links({ name, description, site, avatar })
    await link.save()
}

// 删除友链
export const deleteLink = async (ctx) => {
    const { id } = ctx.params
    await Links.findOneAndDelete({ id })
}

// 更新友链
export const updateLink = async (ctx) => {
    const { id } = ctx.params
    const { name, description, site, avatar } = ctx.request.body
    await Links.findOneAndUpdate({ id }, { name, description, site, avatar })
}