import test from 'node:test'
import assert from 'node:assert/strict'
import { Essay } from '../models/EssaySchema.js'
import { EssayDraft } from '../models/EssayDraftSchema.js'
import { createEssay, updateEssay } from './EssayController.js'
import { createEssayDraft, updateEssayDraft } from './EssayDraftController.js'
import { essayImageStorage } from '../services/essayImages.js'

const context = (body) => ({
    params: { id: 'essay' },
    request: { body },
    throw(status, message) {
        throw Object.assign(new Error(message), { status })
    },
})

test('publishes at the chosen time and derives the default title from its Beijing date', async (t) => {
    t.mock.method(Essay, 'create', async (values) => values)
    const ctx = context({
        content: '补记',
        createTime: '2026-10-01T16:30:00.000Z',
    })
    await createEssay(ctx)
    assert.equal(ctx.body.createTime.toISOString(), '2026-10-01T16:30:00.000Z')
    assert.equal(ctx.body.title, '10月2日随笔')
    assert.ok(ctx.body.updateTime > ctx.body.createTime)
})

test('an empty time uses the server publishing time', async (t) => {
    t.mock.method(Essay, 'create', async (values) => values)
    for (const createTime of [undefined, null, '']) {
        const ctx = context({ content: '现在发布', createTime })
        await createEssay(ctx)
        assert.equal(
            ctx.body.createTime.valueOf(),
            ctx.body.updateTime.valueOf(),
        )
    }
})

test('edits preserve an omitted time, allow changing it and reset a cleared time to now', async (t) => {
    const old = new Date('2026-10-01T10:00:00Z')
    const essay = {
        title: '随笔',
        content: '正文',
        createTime: old,
        images: [],
        save: async () => {},
    }
    t.mock.method(Essay, 'findOne', async () => essay)
    t.mock.method(essayImageStorage, 'cleanup', async () => {})
    await updateEssay(context({ content: '改正文' }))
    assert.equal(essay.createTime.valueOf(), old.valueOf())
    await updateEssay(context({ createTime: '2026-10-02T12:30:00+08:00' }))
    assert.equal(essay.createTime.toISOString(), '2026-10-02T04:30:00.000Z')
    await updateEssay(context({ createTime: null }))
    assert.equal(essay.createTime.valueOf(), essay.updateTime.valueOf())
    await assert.rejects(updateEssay(context({ createTime: 'invalid' })), {
        status: 422,
    })
})

test('drafts retain the selected time and clearing it restores automatic time', async (t) => {
    t.mock.method(EssayDraft, 'create', async (values) => values)
    t.mock.method(essayImageStorage, 'cleanup', async () => {})
    const ctx = context({ createTime: '2026-10-02T04:30:00.000Z' })
    await createEssayDraft(ctx)
    assert.equal(ctx.body.createTime.toISOString(), '2026-10-02T04:30:00.000Z')
    let update
    t.mock.method(EssayDraft, 'findOneAndUpdate', (filter, values) => {
        update = values
        return {
            lean: () => ({ exec: async () => ({ ...ctx.body, version: 1 }) }),
        }
    })
    const cleared = context({ version: 1, createTime: null })
    await updateEssayDraft(cleared)
    assert.equal(update.$set.createTime, null)
    assert.equal(cleared.body.createTime, null)
    await updateEssayDraft(context({ version: 2, content: '只改正文' }))
    assert.equal(Object.hasOwn(update.$set, 'createTime'), false)
    await assert.rejects(createEssayDraft(context({ createTime: 'invalid' })), {
        status: 422,
    })
})
