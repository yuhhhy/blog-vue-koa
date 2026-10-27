import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateUploadProgress,
  createUploadSpeedTracker,
  getChunkRange,
} from './uploadMetrics.js'

test('upload progress never moves backwards and stays below merge completion', () => {
  assert.equal(calculateUploadProgress(60, 500, 1000), 60)
  assert.equal(calculateUploadProgress(60, 750, 1000), 75)
  assert.equal(calculateUploadProgress(98, 1000, 1000), 99)
  assert.equal(calculateUploadProgress(20, 100, 0), 20)
})

test('chunk ranges cover the final partial chunk without exceeding file size', () => {
  assert.deepEqual(getChunkRange(0, 12, 5), { start: 0, end: 5, size: 5 })
  assert.deepEqual(getChunkRange(2, 12, 5), { start: 10, end: 12, size: 2 })
})

test('upload speed uses recent transferred bytes from the rolling time window', () => {
  let currentTime = 0
  const tracker = createUploadSpeedTracker({
    sampleWindow: 1500,
    now: () => currentTime,
  })

  tracker.reset()
  currentTime = 1000
  assert.equal(tracker.record(1000), 1000)
  currentTime = 2000
  assert.equal(tracker.record(3000), 2000)
  currentTime = 2500
  assert.ok(Math.abs(tracker.record(1000) - (4000 / 1.5)) < 0.001)
  assert.equal(tracker.record(0), null)
})
