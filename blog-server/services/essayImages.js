import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import envConfig from '../config/env.js'
import logger from '../config/logger.js'
import { Essay } from '../models/EssaySchema.js'
import { EssayDraft } from '../models/EssayDraftSchema.js'
import { Blog } from '../models/BlogSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'
import { ArticleDraft } from '../models/ArticleDraftSchema.js'
import { Links } from '../models/LinksSchema.js'
import { Comment } from '../models/CommentSchema.js'
import { deleteImageVariants } from '../utils/imageVariants.js'

// Match the existing upload destination in config/upload.js.
const imageDir = fileURLToPath(new URL('../../public/images/', import.meta.url))

export const getLocalEssayImageFilename = (image) => {
    if (typeof image !== 'string') return null
    try {
        const url = new URL(image, envConfig.baseUrl)
        const localOrigins = [envConfig.baseUrl, ...envConfig.allowOrigins]
        if (
            !localOrigins.includes(url.origin) ||
            !url.pathname.startsWith('/images/')
        )
            return null
        const filename = decodeURIComponent(
            url.pathname.slice('/images/'.length),
        )
        if (
            !filename ||
            filename.includes('\\') ||
            filename.includes('\0') ||
            filename
                .split('/')
                .some((part) => !part || part === '.' || part === '..')
        )
            return null
        return filename
    } catch {
        return null
    }
}

export const getImageReferencePattern = (filename) => {
    // Also retain originals when a thumbnail or an encoded URL is referenced.
    const stem = path.parse(filename).name
    const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(
        [...new Set([stem, encodeURIComponent(stem)])].map(escape).join('|'),
        'i',
    )
}

const isImageReferenced = async (filename) => {
    const pattern = getImageReferencePattern(filename)
    const checks = [
        [Essay, ['images']],
        [EssayDraft, ['images']],
        [Blog, ['coverImage']],
        [BlogContent, ['content', 'coverImage']],
        [ArticleDraft, ['content', 'coverImage']],
        [Links, ['avatar']],
        [Comment, ['avatar', 'content']],
    ]
    const references = await Promise.all(
        checks.map(([model, fields]) =>
            model.exists({
                $or: fields.map((field) => ({ [field]: pattern })),
            }),
        ),
    )
    return references.some(Boolean)
}

export const cleanupEssayImages = async (
    previous = [],
    current = [],
    options = {},
) => {
    const directory = options.imageDir || imageDir
    const referenced = options.isReferenced || isImageReferenced
    const kept = new Set(
        current.map(getLocalEssayImageFilename).filter(Boolean),
    )
    const candidates = new Set(
        previous.map(getLocalEssayImageFilename).filter(Boolean),
    )
    for (const filename of candidates) {
        if (kept.has(filename)) continue
        try {
            if (await referenced(filename)) continue
            const target = path.join(directory, filename)
            // Refuse symlinked directories that could escape image storage.
            const root = await fs.realpath(directory)
            const parent = await fs.realpath(path.dirname(target))
            if (parent !== root && !parent.startsWith(`${root}${path.sep}`))
                continue
            await fs.rm(target, { force: true })
            await deleteImageVariants(
                path.dirname(target),
                path.basename(filename),
            )
        } catch (error) {
            if (error.code !== 'ENOENT')
                logger.warn(`清理随笔图片失败 ${filename}: ${error.message}`)
        }
    }
}

export const essayImageStorage = { cleanup: cleanupEssayImages }
