import assert from 'node:assert/strict'
import test from 'node:test'
import { getNextLinkSortOrder, normalizeLinkSortOrder } from './linkSort.js'

test('new links are placed after the largest order in the same category', () => {
    const links = [
        { category: 'friend', sortOrder: 10 },
        { category: 'friend', sortOrder: 30 },
        { category: 'recommended', sortOrder: 80 },
    ]

    assert.equal(getNextLinkSortOrder(links, 'friend'), 40)
    assert.equal(getNextLinkSortOrder(links, 'recommended'), 90)
})

test('legacy links without a category belong to the friend category', () => {
    assert.equal(getNextLinkSortOrder([{ sortOrder: 20 }], 'friend'), 30)
})

test('sort orders are normalized to non-negative integers', () => {
    assert.equal(normalizeLinkSortOrder('12.9'), 12)
    assert.equal(normalizeLinkSortOrder(-2), 0)
    assert.equal(normalizeLinkSortOrder('invalid'), 0)
})
