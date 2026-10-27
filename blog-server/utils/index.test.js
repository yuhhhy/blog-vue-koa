import assert from 'node:assert/strict'
import test from 'node:test'
import { getIp } from './index.js'

test('normalizes the client address forwarded by the edge proxy', () => {
    const ctx = {
        req: {
            headers: { 'x-forwarded-for': ' 203.0.113.8, 172.18.0.2 ' },
            socket: { remoteAddress: '172.18.0.2' },
        },
        request: { ip: '172.18.0.2' },
    }

    assert.equal(getIp(ctx), '203.0.113.8')
})

test('keeps loopback addresses honest and normalizes mapped IPv4 addresses', () => {
    assert.equal(getIp({
        req: { headers: {}, socket: { remoteAddress: '::1' } },
        request: {},
    }), '::1')
    assert.equal(getIp({
        req: { headers: {}, socket: { remoteAddress: '::ffff:127.0.0.1' } },
        request: {},
    }), '127.0.0.1')
})
