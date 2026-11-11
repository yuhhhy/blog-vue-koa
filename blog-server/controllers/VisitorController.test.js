import assert from 'node:assert/strict'
import test from 'node:test'
import { createVisitor, deleteVisitor } from './VisitorController.js'
import { Visitor } from '../models/VisitorSchema.js'
import envConfig from '../config/env.js'

test('legacy visitor recording continues when writes are enabled', async (t) => {
    const previous = process.env.LEGACY_VISITOR_WRITES_ENABLED
    process.env.LEGACY_VISITOR_WRITES_ENABLED = 'true'
    let saved = false
    const visitor = { viewNum: 1, save: async () => { saved = true } }
    t.mock.method(Visitor, 'findOne', async () => visitor)
    try {
        assert.equal(envConfig.legacyVisitorWritesEnabled, true)
        const ctx = {
            request: { body: {}, headers: { 'user-agent': 'Mozilla/5.0' } },
            headers: { 'user-agent': 'Mozilla/5.0' },
            ip: '127.0.0.1',
        }
        await createVisitor(ctx)
        assert.equal(ctx.status, 200)
        assert.equal(saved, true)
        assert.equal(visitor.viewNum, 2)
    } finally {
        if (previous === undefined) delete process.env.LEGACY_VISITOR_WRITES_ENABLED
        else process.env.LEGACY_VISITOR_WRITES_ENABLED = previous
    }
})

test('legacy visitor recording can still be paused by configuration', async () => {
    const previous = process.env.LEGACY_VISITOR_WRITES_ENABLED
    process.env.LEGACY_VISITOR_WRITES_ENABLED = 'false'
    try {
        const ctx = { request: { body: {} } }
        await createVisitor(ctx)
        assert.equal(ctx.status, 202)
        assert.deepEqual(ctx.body, { accepted: true, legacyWrite: false })
        await deleteVisitor(ctx)
        assert.equal(ctx.status, 409)
    } finally {
        if (previous === undefined) delete process.env.LEGACY_VISITOR_WRITES_ENABLED
        else process.env.LEGACY_VISITOR_WRITES_ENABLED = previous
    }
})
