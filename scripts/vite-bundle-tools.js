import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const budgetFile = path.join(scriptDir, 'bundle-size-budgets.json')
const reportDir = path.join(projectRoot, 'reports', 'bundle-stats')

const readBudgets = () => JSON.parse(fs.readFileSync(budgetFile, 'utf8'))
const gzipSize = (source) => gzipSync(typeof source === 'string' ? source : Buffer.from(source)).length
const roundKiB = (bytes) => Math.round((bytes / 1024) * 100) / 100

const largest = (items) => items.reduce((current, item) => (
  !current || item.gzipBytes > current.gzipBytes ? item : current
), null)

export const createBundleStats = (app, bundle) => {
  const chunks = Object.values(bundle)
    .filter((item) => item.type === 'chunk' && item.fileName.endsWith('.js'))
    .map((item) => ({
      file: item.fileName,
      name: item.name,
      isEntry: item.isEntry,
      isDynamicEntry: item.isDynamicEntry,
      gzipBytes: gzipSize(item.code),
    }))
    .sort((a, b) => b.gzipBytes - a.gzipBytes)
  const styles = Object.values(bundle)
    .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
    .map((item) => ({ file: item.fileName, gzipBytes: gzipSize(item.source) }))
    .sort((a, b) => b.gzipBytes - a.gzipBytes)
  const entries = chunks.filter((chunk) => chunk.isEntry)
  const asyncChunks = chunks.filter((chunk) => !chunk.isEntry)

  return {
    app,
    generatedAt: new Date().toISOString(),
    metrics: {
      largestEntryGzipBytes: largest(entries)?.gzipBytes || 0,
      largestAsyncChunkGzipBytes: largest(asyncChunks)?.gzipBytes || 0,
      totalJavaScriptGzipBytes: chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
      totalCssGzipBytes: styles.reduce((total, style) => total + style.gzipBytes, 0),
    },
    chunks,
    styles,
  }
}

export const findBudgetViolations = (stats, budget) => stats.chunks
  .filter((chunk) => chunk.gzipBytes > (chunk.isEntry ? budget.entryGzipLimit : budget.asyncChunkGzipLimit))
  .map((chunk) => ({
    file: chunk.file,
    kind: chunk.isEntry ? 'entry' : 'async',
    gzipBytes: chunk.gzipBytes,
    limitBytes: chunk.isEntry ? budget.entryGzipLimit : budget.asyncChunkGzipLimit,
  }))

const formatDelta = (current, baseline) => {
  if (!Number.isFinite(baseline)) return 'no baseline'
  const delta = current - baseline
  const sign = delta > 0 ? '+' : ''
  return `${sign}${roundKiB(delta)} KiB`
}

export const bundleSizeBudget = (app) => ({
  name: `bundle-size-budget:${app}`,
  apply: 'build',
  generateBundle(_options, bundle) {
    const budgets = readBudgets()
    const budget = budgets[app]
    if (!budget) this.error(`Missing bundle size budget for ${app}`)

    const stats = createBundleStats(app, bundle)
    const violations = findBudgetViolations(stats, budget)
    const baseline = budget.baseline || {}

    fs.mkdirSync(reportDir, { recursive: true })
    fs.writeFileSync(
      path.join(reportDir, `${app}.json`),
      `${JSON.stringify(stats, null, 2)}\n`,
    )

    const summary = [
      `${app} bundle gzip:`,
      `entry ${roundKiB(stats.metrics.largestEntryGzipBytes)} KiB (${formatDelta(stats.metrics.largestEntryGzipBytes, baseline.largestEntryGzipBytes)})`,
      `largest async ${roundKiB(stats.metrics.largestAsyncChunkGzipBytes)} KiB (${formatDelta(stats.metrics.largestAsyncChunkGzipBytes, baseline.largestAsyncChunkGzipBytes)})`,
      `total JS ${roundKiB(stats.metrics.totalJavaScriptGzipBytes)} KiB (${formatDelta(stats.metrics.totalJavaScriptGzipBytes, baseline.totalJavaScriptGzipBytes)})`,
      `total CSS ${roundKiB(stats.metrics.totalCssGzipBytes)} KiB (${formatDelta(stats.metrics.totalCssGzipBytes, baseline.totalCssGzipBytes)})`,
    ].join(' | ')
    this.info(summary)

    if (!violations.length) return
    const details = violations.map((item) => (
      `${item.kind} ${item.file}: ${roundKiB(item.gzipBytes)} KiB > ${roundKiB(item.limitBytes)} KiB`
    )).join('\n')
    const message = `Bundle size budget exceeded for ${app}:\n${details}`

    if (process.env.CI === 'true' || process.env.BUNDLE_BUDGET_STRICT === 'true') {
      this.error(message)
    } else {
      this.warn(message)
    }
  },
})

export const bundleReportPath = (app) => path.join(projectRoot, 'reports', `bundle-${app}.html`)
