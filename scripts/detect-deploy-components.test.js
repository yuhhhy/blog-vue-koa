import assert from 'node:assert/strict'
import test from 'node:test'
import { detectDeployComponents } from './detect-deploy-components.js'

test('maps each workspace to its deployed component', () => {
  assert.deepEqual(
    detectDeployComponents(['blog-client/src/main.js']),
    {
      frontend: true,
      admin: false,
      server: false,
      hasChanges: true,
      components: ['frontend'],
    },
  )
  assert.deepEqual(
    detectDeployComponents(['blog-background/src/main.js', 'blog-server/app.js']).components,
    ['admin', 'server'],
  )
})

test('shared build and deployment files trigger a full release', () => {
  for (const file of [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    '.github/workflows/cicd.yaml',
    'scripts/deploy-release.sh',
  ]) {
    assert.deepEqual(
      detectDeployComponents([file]).components,
      ['frontend', 'admin', 'server'],
    )
  }
})

test('documentation-only changes do not deploy an application', () => {
  assert.deepEqual(
    detectDeployComponents(['README.md', 'assets/images/doc_md-1.jpg']),
    {
      frontend: false,
      admin: false,
      server: false,
      hasChanges: false,
      components: [],
    },
  )
})

test('manual runs force a full release', () => {
  assert.deepEqual(
    detectDeployComponents([], { forceAll: true }).components,
    ['frontend', 'admin', 'server'],
  )
})
