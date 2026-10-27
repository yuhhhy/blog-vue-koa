import assert from 'node:assert/strict'
import test from 'node:test'
import { createBundleStats, findBudgetViolations } from './vite-bundle-tools.js'

const bundle = {
  entry: { type: 'chunk', fileName: 'assets/index.js', name: 'index', code: 'a'.repeat(500), isEntry: true, isDynamicEntry: false },
  lazy: { type: 'chunk', fileName: 'assets/lazy.js', name: 'lazy', code: 'b'.repeat(1000), isEntry: false, isDynamicEntry: true },
  style: { type: 'asset', fileName: 'assets/index.css', source: '.test{}'.repeat(50) },
}

test('collects entry, async, JavaScript and CSS gzip metrics', () => {
  const stats = createBundleStats('frontend', bundle)

  assert.equal(stats.app, 'frontend')
  assert.equal(stats.chunks.length, 2)
  assert.equal(stats.styles.length, 1)
  assert.ok(stats.metrics.largestEntryGzipBytes > 0)
  assert.ok(stats.metrics.largestAsyncChunkGzipBytes > 0)
  assert.equal(
    stats.metrics.totalJavaScriptGzipBytes,
    stats.chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
  )
})

test('reports entry and async chunks that exceed their separate budgets', () => {
  const stats = createBundleStats('frontend', bundle)
  const violations = findBudgetViolations(stats, {
    entryGzipLimit: 1,
    asyncChunkGzipLimit: 1,
  })

  assert.deepEqual(violations.map((item) => item.kind).sort(), ['async', 'entry'])
})
