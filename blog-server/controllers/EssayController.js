import { randomUUID } from 'node:crypto'
import { Essay } from '../models/EssaySchema.js'
import { normalizeEssayInput } from '../utils/essay.js'

export const getEssays = async (ctx) => {
    ctx.body = await Essay.find({}).sort({ createTime: -1, _id: -1 }).lean()
}

export const createEssay = async (ctx) => {
    const now = new Date()
    const values = normalizeEssayInput(ctx.request.body, now)
    if (values.error) ctx.throw(422, values.error)

    const essay = await Essay.create({
        id: randomUUID(),
        ...values,
        createTime: now,
        updateTime: now,
    })
    ctx.status = 201
    ctx.body = essay
}

export const updateEssay = async (ctx) => {
    const essay = await Essay.findOne({ id: ctx.params.id })
    if (!essay) ctx.throw(404, '随笔不存在')

    const values = normalizeEssayInput({
        title: ctx.request.body?.title ?? essay.title,
        content: ctx.request.body?.content ?? essay.content,
    }, essay.createTime)
    if (values.error) ctx.throw(422, values.error)

    Object.assign(essay, values, { updateTime: new Date() })
    await essay.save()
    ctx.body = essay
}

export const deleteEssay = async (ctx) => {
    const essay = await Essay.findOneAndDelete({ id: ctx.params.id })
    if (!essay) ctx.throw(404, '随笔不存在')
    ctx.status = 204
}
