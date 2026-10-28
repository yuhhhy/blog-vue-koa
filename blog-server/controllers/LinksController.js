import { respondLinkAvatar } from '../utils/linkAvatar.js'
import { Links } from "../models/LinksSchema.js"

const categoryRank = {
    friend: 0,
    recommended: 1,
}

const normalizeSortOrder = (value) => {
    const sortOrder = Number(value)
    return Number.isFinite(sortOrder) ? Math.max(0, Math.trunc(sortOrder)) : 0
}

const compareLinks = (a, b) => {
    const categoryDifference = (categoryRank[a.category] ?? 0) - (categoryRank[b.category] ?? 0)
    if (categoryDifference !== 0) return categoryDifference

    const sortOrderDifference = normalizeSortOrder(a.sortOrder) - normalizeSortOrder(b.sortOrder)
    if (sortOrderDifference !== 0) return sortOrderDifference

    return Number(b.id) - Number(a.id)
}

// 获取所有友链
export const getLinks = async (ctx) => {
    const links = await Links.find({}).lean()
    links.sort(compareLinks)
    ctx.status = 200
    ctx.body = links
}

// 创建友链
export const createLink = async (ctx) => {
    console.log(ctx.request.body)
    
    const { id, name, description, site, avatar, category = 'friend', sortOrder = 0 } = ctx.request.body
    const link = new Links({ id, name, description, site, avatar, category, sortOrder: normalizeSortOrder(sortOrder) })
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
    const { name, description, site, avatar, category = 'friend', sortOrder = 0 } = ctx.request.body
    const updatedLink = await Links.findOneAndUpdate(
        { id },
        { name, description, site, avatar, category, sortOrder: normalizeSortOrder(sortOrder) },
        { new: true, runValidators: true }
    )
    ctx.status = 200
    ctx.body = updatedLink
}

// Only stored friend links are eligible; no arbitrary URL proxy.
export const getLinkAvatar = async (ctx) => {
    await respondLinkAvatar(ctx, await Links.findOne({ id: ctx.params.id }).lean())
}
