import test from 'node:test'
import assert from 'node:assert/strict'
import { canVisit, columnsForWidth, createGesture, createMotionSampler, moveGesture, safeSite, TOUCH_DRAG_DELAY, TOUCH_MOVE_TOLERANCE } from './interaction.js'

test('ema layout chooses readable rack columns', () => {
  assert.equal(columnsForWidth(400), 1)
  assert.equal(columnsForWidth(700), 2)
  assert.equal(columnsForWidth(1100), 3)
})
test('touch movement tolerates finger jitter but cancels a visit beyond the threshold', () => {
  const gesture = createGesture(10, 10, true)
  moveGesture(gesture, 20, 10)
  assert.equal(canVisit(gesture), true)
  moveGesture(gesture, 10 + TOUCH_MOVE_TOLERANCE + 1, 10)
  assert.equal(canVisit(gesture), false)
})
test('touch drag starts quickly enough to feel responsive', () => {
  assert.equal(TOUCH_DRAG_DELAY, 160)
})
test('motion sampler ignores a page handoff jump', () => {
  const sampler = createMotionSampler()
  sampler.sample(0, 0, 0, 'preview')
  assert.deepEqual(sampler.sample(900, 0, 16, 'page'), { x: 0, y: 0 })
})
test('external links are restricted to http(s)', () => {
  assert.equal(safeSite('javascript:alert(1)'), null)
  assert.equal(safeSite('https://example.com/'), 'https://example.com/')
})
