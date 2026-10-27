import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const budgetFile = path.join(scriptDir, 'bundle-size-budgets.json')
const budgets = JSON.parse(fs.readFileSync(budgetFile, 'utf8'))

for (const app of Object.keys(budgets)) {
  const reportFile = path.join(projectRoot, 'reports', 'bundle-stats', `${app}.json`)
  if (!fs.existsSync(reportFile)) {
    throw new Error(`Missing bundle report for ${app}; build both applications first`)
  }

  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
  budgets[app].baseline = report.metrics
}

fs.writeFileSync(budgetFile, `${JSON.stringify(budgets, null, 2)}\n`)
console.log(`Updated bundle size baselines in ${path.relative(projectRoot, budgetFile)}`)
