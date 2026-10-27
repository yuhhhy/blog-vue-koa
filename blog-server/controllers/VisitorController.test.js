import assert from 'node:assert/strict'
import test from 'node:test'
import { createVisitor, deleteVisitor } from './VisitorController.js'

const withLegacyWrites = async (value, callback) => {
    const previous = process.env.LEGACY_VISITOR_WRITES_ENABLED
    process.env.LEGACY_VISITOR_WRITES_ENABLED = value
    try {
        await callback()
    } finally {
        if (previous === undefined) delete process.env.LEGACY_VISITOR_WRITES_ENABLED
        else process.env.LEGACY_VISITOR_WRITES_ENABLED = previous
    }
}

test('legacy visitor POST becomes a compatible no-op when writes are disabled', async () => {
    await withLegacyWrites('false', async () => {
        const ctx = { request: { body: {} } }

        await createVisitor(ctx)

        assert.equal(ctx.status, 202)
        assert.deepEqual(ctx.body, { accepted: true, legacyWrite: false })
    })
})

test('legacy visitor records cannot be deleted when writes are disabled', async () => {
    await withLegacyWrites('false', async () => {
        const ctx = { params: { id: 'unused' } }

        await deleteVisitor(ctx)

        assert.equal(ctx.status, 409)
        assert.deepEqual(ctx.body, { message: '旧访客记录已设为只读' })
    })
})
