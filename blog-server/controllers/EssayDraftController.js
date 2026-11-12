import { randomUUID } from 'node:crypto'
import { essayImageStorage } from '../services/essayImages.js'
import { EssayDraft } from '../models/EssayDraftSchema.js'
import { normalizeEssayImages } from '../utils/essay.js'

const draftFields = (body = {}, ctx) => {
    const images =
        body.images === undefined ? {} : normalizeEssayImages(body.images)
    if (images.error) ctx.throw(422, images.error)
    return {
        ...images,
        ...(body.sourceEssayId !== undefined && {
            sourceEssayId: String(body.sourceEssayId || ''),
        }),
        ...(body.title !== undefined && {
            title: String(body.title).slice(0, 120),
        }),
        ...(body.content !== undefined && { content: String(body.content) }),
    }
}

export const getEssayDrafts = async (ctx) => {
    ctx.body = await EssayDraft.find({}).sort({ updatedAt: -1 }).lean().exec()
}

export const createEssayDraft = async (ctx) => {
    const draft = await EssayDraft.create({
        id: randomUUID(),
        ...draftFields(ctx.request.body, ctx),
        version: 1,
    })
    ctx.status = 201
    ctx.body = draft
}

export const getEssayDraft = async (ctx) => {
    const draft = await EssayDraft.findOne({ id: ctx.params.id }).lean().exec()
    if (!draft) ctx.throw(404, '随笔草稿不存在')
    ctx.body = draft
}

export const updateEssayDraft = async (ctx) => {
    const version = Number(ctx.request.body?.version)
    if (!Number.isInteger(version)) ctx.throw(400, '缺少有效的草稿版本号')

    const fields = draftFields(ctx.request.body, ctx)
    const updatedAt = new Date()
    const draft = await EssayDraft.findOneAndUpdate(
        { id: ctx.params.id, version },
        { $set: { ...fields, updatedAt }, $inc: { version: 1 } },
        { new: false, runValidators: true, timestamps: false },
    )
        .lean()
        .exec()
    if (draft) {
        const updated = { ...draft, ...fields, version: draft.version + 1 }
        await essayImageStorage.cleanup(draft.images, updated.images)
        ctx.body = { ...updated, updatedAt }
        return
    }

    const cloudDraft = await EssayDraft.findOne({ id: ctx.params.id })
        .lean()
        .exec()
    if (!cloudDraft) ctx.throw(404, '随笔草稿不存在')
    ctx.status = 409
    ctx.body = { message: '云端随笔草稿已有更新', draft: cloudDraft }
}

export const deleteEssayDraft = async (ctx) => {
    const draft = await EssayDraft.findOneAndDelete({ id: ctx.params.id })
    if (!draft) ctx.throw(404, '随笔草稿不存在')
    await essayImageStorage.cleanup(draft.images)
    ctx.status = 204
}
