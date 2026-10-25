import { randomUUID } from 'node:crypto'
import { ArticleDraft } from '../models/ArticleDraftSchema.js'
import { Blog } from '../models/BlogSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'
import { WebsiteData } from '../models/WebsiteDataSchema.js'
import { refreshRSS } from '../services/RSSService.js'

const editableFields = ['title', 'author', 'coverImage', 'tags', 'content']

const countWords = (content = '') => {
    let letterCount = 0
    let spaceCount = 0

    for (const character of content) {
        if (/[a-zA-Z]/.test(character)) letterCount += 1
        else if (/\s/.test(character)) spaceCount += 1
    }

    const words = Array.from(new Intl.Segmenter('en', { granularity: 'word' }).segment(content))
        .filter(({ isWordLike, segment }) => isWordLike && /^[a-zA-Z]+$/.test(segment))

    return content.length - letterCount + words.length - spaceCount
}

const normalizeDraftData = (body = {}) => {
    const data = {}
    editableFields.forEach((field) => {
        if (body[field] !== undefined) data[field] = body[field]
    })
    if (data.content !== undefined) data.wordCount = countWords(data.content)
    return data
}

const getMissingPublishFields = (draft) => {
    const missing = []
    if (!draft.title?.trim()) missing.push('title')
    if (!draft.author?.trim()) missing.push('author')
    if (!draft.coverImage?.trim()) missing.push('coverImage')
    if (!Array.isArray(draft.tags) || !draft.tags.length) missing.push('tags')
    if (!draft.content?.trim()) missing.push('content')
    return missing
}

export const createArticleDraft = async (ctx) => {
    const data = normalizeDraftData(ctx.request.body)
    const draft = await ArticleDraft.create({
        id: randomUUID(),
        ...data,
        version: 1,
    })

    ctx.status = 201
    ctx.body = draft
}

export const getArticleDrafts = async (ctx) => {
    const drafts = await ArticleDraft.find({})
        .sort({ updatedAt: -1 })
        .lean()
        .exec()

    ctx.status = 200
    ctx.body = drafts
}

export const getArticleDraft = async (ctx) => {
    const draft = await ArticleDraft.findOne({ id: ctx.params.id }).lean().exec()
    if (!draft) {
        ctx.status = 404
        ctx.body = { message: '草稿不存在' }
        return
    }

    ctx.status = 200
    ctx.body = draft
}

export const updateArticleDraft = async (ctx) => {
    const version = Number(ctx.request.body?.version)
    const force = ctx.request.body?.force === true

    if (!force && !Number.isInteger(version)) {
        ctx.status = 400
        ctx.body = { message: '缺少有效的草稿版本号' }
        return
    }

    const query = force
        ? { id: ctx.params.id, publishing: { $ne: true } }
        : { id: ctx.params.id, version, publishing: { $ne: true } }
    const draft = await ArticleDraft.findOneAndUpdate(
        query,
        {
            $set: normalizeDraftData(ctx.request.body),
            $inc: { version: 1 },
        },
        { new: true, runValidators: true }
    ).lean().exec()

    if (draft) {
        ctx.status = 200
        ctx.body = draft
        return
    }

    const cloudDraft = await ArticleDraft.findOne({ id: ctx.params.id }).lean().exec()
    if (!cloudDraft) {
        ctx.status = 404
        ctx.body = { message: '草稿不存在' }
        return
    }

    ctx.status = 409
    ctx.body = {
        message: '云端草稿已有更新',
        draft: cloudDraft,
    }
}

export const deleteArticleDraft = async (ctx) => {
    const draft = await ArticleDraft.findOneAndDelete({
        id: ctx.params.id,
        publishing: { $ne: true },
    })
    if (!draft) {
        const publishingDraft = await ArticleDraft.exists({ id: ctx.params.id, publishing: true })
        if (publishingDraft) {
            ctx.status = 409
            ctx.body = { message: '草稿正在发布，暂时无法删除' }
            return
        }
        ctx.status = 404
        ctx.body = { message: '草稿不存在' }
        return
    }

    ctx.status = 204
}

export const publishArticleDraft = async (ctx) => {
    const version = Number(ctx.request.body?.version)
    const existingDraft = await ArticleDraft.findOne({ id: ctx.params.id }).lean().exec()

    if (!existingDraft) {
        ctx.status = 404
        ctx.body = { message: '草稿不存在' }
        return
    }

    if (!Number.isInteger(version) || existingDraft.version !== version) {
        ctx.status = 409
        ctx.body = { message: '云端草稿已有更新', draft: existingDraft }
        return
    }

    const missingFields = getMissingPublishFields(existingDraft)
    if (missingFields.length) {
        ctx.status = 422
        ctx.body = { message: '草稿字段不完整', missingFields }
        return
    }

    const draft = await ArticleDraft.findOneAndUpdate(
        { id: ctx.params.id, version, publishing: { $ne: true } },
        { $set: { publishing: true } },
        { new: true }
    ).lean().exec()

    if (!draft) {
        ctx.status = 409
        ctx.body = { message: '草稿正在发布，请勿重复提交', draft: existingDraft }
        return
    }

    const createTime = new Date()
    const articleId = draft.id
    let contentCreated = false
    let blogCreated = false

    try {
        await BlogContent.create({
            id: articleId,
            title: draft.title,
            author: draft.author,
            coverImage: draft.coverImage,
            createTime,
            tags: draft.tags,
            content: draft.content,
            wordCount: draft.wordCount,
            viewCount: 0,
            likeCount: 0,
        })
        contentCreated = true

        await Blog.create({
            id: articleId,
            title: draft.title,
            coverImage: draft.coverImage,
            createTime,
            tags: draft.tags,
            link: `/blog/${articleId}`,
        })
        blogCreated = true

        await ArticleDraft.deleteOne({ id: draft.id, version: draft.version })

        await Promise.allSettled([
            WebsiteData.updateDailyData('article'),
            WebsiteData.findOneAndUpdate({}, { $set: { updateTime: createTime } }, { new: true, upsert: true }),
            WebsiteData.findOneAndUpdate({}, { $inc: { totalWordCount: draft.wordCount } }, { new: true, upsert: true }),
            refreshRSS('draft published'),
        ])

        ctx.status = 201
        ctx.body = { message: '文章发布成功', id: articleId }
    } catch (error) {
        if (contentCreated) await BlogContent.deleteOne({ id: articleId })
        if (blogCreated) await Blog.deleteOne({ id: articleId })
        await ArticleDraft.updateOne(
            { id: draft.id, version: draft.version },
            { $set: { publishing: false } }
        )
        throw error
    }
}
