import test from 'node:test'
import assert from 'node:assert/strict'
import { toEssayTimeInput, fromEssayTimeInput } from './essayTime.js'

test('converts Beijing time independently of the browser timezone', () => {
    const value = '2026-11-11T18:30:45.123Z'
    assert.equal(toEssayTimeInput(value), '2026-11-12T02:30:45.123')
    assert.equal(fromEssayTimeInput(toEssayTimeInput(value)), value)
    assert.equal(
        toEssayTimeInput('2026-11-11T16:00:00.000Z'),
        '2026-11-12T00:00:00.000',
    )
})

test('an empty selection stays empty until publishing', () => {
    assert.equal(toEssayTimeInput(null), '')
    assert.equal(toEssayTimeInput(undefined), '')
    assert.equal(fromEssayTimeInput(''), null)
    assert.equal(fromEssayTimeInput(null), null)
})
