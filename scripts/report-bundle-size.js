import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const budgets = JSON.parse(fs.readFileSync(path.join(scriptDir, 'bundle-size-budgets.json'), 'utf8'))
const requestedApps = process.argv.slice(2)
const apps = requestedApps.length ? requestedApps : Object.keys(budgets)
const toKiB = (bytes) => (bytes / 1024).toFixed(2)
const delta = (current, baseline) => {
  if (!Number.isFinite(baseline)) return '—'
  const value = (current - baseline) / 1024
  return `${value > 0 ? '+' : ''}${value.toFixed(2)} KiB`
}

console.log('| 应用 | 最大入口 gzip | 相对基线 | 最大异步 chunk gzip | 相对基线 | JS gzip 总量 | 相对基线 | CSS gzip 总量 | 相对基线 |')
console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

for (const app of apps) {
  const reportFile = path.join(projectRoot, 'reports', 'bundle-stats', `${app}.json`)
  if (!fs.existsSync(reportFile)) continue

  const stats = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
  const baseline = budgets[app]?.baseline || {}
  console.log([
    `| ${app}`,
    `${toKiB(stats.metrics.largestEntryGzipBytes)} KiB`,
    delta(stats.metrics.largestEntryGzipBytes, baseline.largestEntryGzipBytes),
    `${toKiB(stats.metrics.largestAsyncChunkGzipBytes)} KiB`,
    delta(stats.metrics.largestAsyncChunkGzipBytes, baseline.largestAsyncChunkGzipBytes),
    `${toKiB(stats.metrics.totalJavaScriptGzipBytes)} KiB`,
    delta(stats.metrics.totalJavaScriptGzipBytes, baseline.totalJavaScriptGzipBytes),
    `${toKiB(stats.metrics.totalCssGzipBytes)} KiB`,
    `${delta(stats.metrics.totalCssGzipBytes, baseline.totalCssGzipBytes)} |`,
  ].join(' | '))
}
