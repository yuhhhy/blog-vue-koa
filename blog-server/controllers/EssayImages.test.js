import test from 'node:test'
import assert from 'node:assert/strict'
import { Essay } from '../models/EssaySchema.js'
import { EssayDraft } from '../models/EssayDraftSchema.js'
import { essayImageStorage } from '../services/essayImages.js'
import { updateEssay, deleteEssay } from './EssayController.js'
import {
    createEssayDraft,
    updateEssayDraft,
    deleteEssayDraft,
} from './EssayDraftController.js'

const context = (body) => ({
    params: { id: 'essay' },
    request: { body },
    throw(status, message) {
        throw Object.assign(new Error(message), { status })
    },
})

test('editing text preserves attachments, while an empty array removes them', async (t) => {
    const cleanup = t.mock.method(essayImageStorage, 'cleanup', async () => {})
    const essay = {
        title: '随笔',
        content: '正文',
        images: ['/images/one.avif', '/images/two.avif'],
        createTime: new Date(),
        save: async () => {},
    }
    t.mock.method(Essay, 'findOne', async () => essay)
    const textOnly = context({ content: '更新正文' })
    await updateEssay(textOnly)
    assert.deepEqual(textOnly.body.images, [
        '/images/one.avif',
        '/images/two.avif',
    ])

    const removeImages = context({ images: [] })
    await updateEssay(removeImages)
    assert.deepEqual(removeImages.body.images, [])
    assert.deepEqual(cleanup.mock.calls.at(-1).arguments, [
        ['/images/one.avif', '/images/two.avif'],
        [],
    ])
})

test('draft persistence includes attachments and rejects invalid image input', async (t) => {
    const cleanup = t.mock.method(essayImageStorage, 'cleanup', async () => {})
    t.mock.method(EssayDraft, 'create', async (values) => values)
    const created = context({
        images: ['/images/two.avif', '/images/one.avif'],
    })
    await createEssayDraft(created)
    assert.deepEqual(created.body.images, [
        '/images/two.avif',
        '/images/one.avif',
    ])

    let update
    t.mock.method(EssayDraft, 'findOneAndUpdate', (filter, values) => {
        update = values
        return {
            lean: () => ({
                exec: async () => ({
                    id: 'essay',
                    version: 1,
                    images: ['/images/one.avif'],
                }),
            }),
        }
    })
    const removed = context({ version: 1, images: [] })
    await updateEssayDraft(removed)
    assert.equal(removed.body.version, 2)
    assert.deepEqual(cleanup.mock.calls.at(-1).arguments, [
        ['/images/one.avif'],
        [],
    ])
    assert.deepEqual(update.$set.images, [])
    await updateEssayDraft(context({ version: 2, content: '仅修改正文' }))
    assert.equal(Object.hasOwn(update.$set, 'images'), false)
    await assert.rejects(
        createEssayDraft(context({ images: 'not-an-array' })),
        { status: 422 },
    )
})

test('old essays and drafts default to an empty image collection', () => {
    assert.deepEqual(
        new Essay({ title: '旧随笔', content: '正文' }).images.toObject(),
        [],
    )
    assert.deepEqual(new EssayDraft().images.toObject(), [])
})

test('deleting essays and drafts schedules their attached files for cleanup', async (t) => {
    const cleanup = t.mock.method(essayImageStorage, 'cleanup', async () => {})
    t.mock.method(Essay, 'findOneAndDelete', async () => ({
        images: ['/images/essay.avif'],
    }))
    t.mock.method(EssayDraft, 'findOneAndDelete', async () => ({
        images: ['/images/draft.avif'],
    }))
    const essay = context({})
    await deleteEssay(essay)
    assert.equal(essay.status, 204)
    assert.deepEqual(cleanup.mock.calls[0].arguments, [['/images/essay.avif']])
    await deleteEssayDraft(context({}))
    assert.deepEqual(cleanup.mock.calls[1].arguments, [['/images/draft.avif']])
})
