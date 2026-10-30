import assert from 'node:assert/strict'
import test from 'node:test'
import { reorderLinksWithinCategory } from './linkOrder.js'

const links = [
  { id: 'a', category: 'friend', sortOrder: 10 },
  { id: 'b', category: 'friend', sortOrder: 20 },
  { id: 'c', category: 'friend', sortOrder: 30 },
  { id: 'r', category: 'recommended', sortOrder: 10 },
]

test('dragging changes order and renumbers the affected category', () => {
  assert.deepEqual(reorderLinksWithinCategory(links, 'c', 'a').map(({ id, sortOrder }) => ({ id, sortOrder })), [
    { id: 'c', sortOrder: 10 },
    { id: 'a', sortOrder: 20 },
    { id: 'b', sortOrder: 30 },
  ])
})

test('links cannot be dragged into another category', () => {
  assert.deepEqual(reorderLinksWithinCategory(links, 'a', 'r'), [])
})
