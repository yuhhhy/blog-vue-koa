import assert from 'node:assert/strict'
import test from 'node:test'
import {
    createAdminVisitorRedirect,
    hasAdminVisitorQuery,
} from './adminVisitorMode.js'

test('detects the admin visitor query value', () => {
    assert.equal(hasAdminVisitorQuery({ visitor: 'admin' }), true)
    assert.equal(hasAdminVisitorQuery({ visitor: ['guest', 'admin'] }), true)
    assert.equal(hasAdminVisitorQuery({ visitor: 'guest' }), false)
})

test('preserves admin visitor mode on internal navigation', () => {
    assert.deepEqual(
        createAdminVisitorRedirect({
            path: '/blog/example',
            query: { source: 'archive' },
            hash: '#comments',
        }, true),
        {
            path: '/blog/example',
            query: { source: 'archive', visitor: 'admin' },
            hash: '#comments',
            replace: true,
        },
    )
})

test('does not redirect when the mode is disabled or already present', () => {
    const route = { path: '/about', query: { visitor: 'admin' }, hash: '' }
    assert.equal(createAdminVisitorRedirect(route, true), null)
    assert.equal(createAdminVisitorRedirect({ ...route, query: {} }, false), null)
})
