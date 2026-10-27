import assert from 'node:assert/strict'
import test from 'node:test'
import { checkReadiness } from './readiness.js'

const accessibleStorage = async () => {}
const inaccessibleStorage = async () => {
    throw new Error('storage unavailable')
}

test('mock mode is ready without a MongoDB connection', async () => {
    const result = await checkReadiness({
        useMockData: true,
        databaseReady: false,
        access: accessibleStorage,
    })

    assert.deepEqual(result, {
        ready: true,
        dataSource: 'mock',
        checks: { database: true, storage: true },
    })
})

test('production is not ready before MongoDB connects', async () => {
    const result = await checkReadiness({
        useMockData: false,
        databaseReady: false,
        access: accessibleStorage,
    })

    assert.equal(result.ready, false)
    assert.deepEqual(result.checks, { database: false, storage: true })
})

test('unwritable static storage makes the service unavailable', async () => {
    const result = await checkReadiness({
        useMockData: false,
        databaseReady: true,
        access: inaccessibleStorage,
    })

    assert.equal(result.ready, false)
    assert.deepEqual(result.checks, { database: true, storage: false })
})
