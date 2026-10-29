import test from 'node:test'
import assert from 'node:assert/strict'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import jwt from 'jsonwebtoken'
import KEY from '../config/key.js'
import router from './router.js'

test('essay routes support publishing, editing, listing and deleting', async (t) => {
    const app = new Koa()
    app.use(bodyParser())
    app.use(router.routes())
    const server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    t.after(() => new Promise((resolve) => server.close(resolve)))

    const base = `http://127.0.0.1:${server.address().port}/api/essays`
    const token = jwt.sign({ role: 'admin' }, KEY)
    const jsonHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    const initialResponse = await fetch(base)
    const initialEssays = await initialResponse.json()
    assert.ok(initialEssays.length >= 3)

    const unauthorized = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '第一篇' }),
    })
    assert.equal(unauthorized.status, 401)

    const invalid = await fetch(base, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ content: ' ' }),
    })
    assert.equal(invalid.status, 422)

    const created = await fetch(base, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ content: ' 第一段\n第二段 ' }),
    })
    assert.equal(created.status, 201)
    const essay = await created.json()
    assert.match(essay.title, /^\d{4}年\d{1,2}月\d{1,2}日随笔$/)
    assert.equal(essay.content, '第一段\n第二段')

    const listed = await fetch(base)
    const listedEssays = await listed.json()
    assert.equal(listedEssays.length, initialEssays.length + 1)
    assert.ok(listedEssays.some((item) => item.id === essay.id))

    const updated = await fetch(`${base}/${essay.id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ title: '后来想到的标题', content: '修改后的正文' }),
    })
    assert.equal(updated.status, 200)
    assert.equal((await updated.json()).title, '后来想到的标题')

    const deleted = await fetch(`${base}/${essay.id}`, { method: 'DELETE', headers: jsonHeaders })
    assert.equal(deleted.status, 204)
    assert.deepEqual(
        (await (await fetch(base)).json()).map((item) => item.id),
        initialEssays.map((item) => item.id),
    )
})

test('essay drafts survive separate requests and reject stale updates', async (t) => {
    const app = new Koa()
    app.use(bodyParser())
    app.use(router.routes())
    const server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    t.after(() => new Promise((resolve) => server.close(resolve)))

    const base = `http://127.0.0.1:${server.address().port}/api/essay-drafts`
    const token = jwt.sign({ role: 'admin' }, KEY)
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const createdResponse = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: '未完成', content: '云端内容' }),
    })
    assert.equal(createdResponse.status, 201)
    const created = await createdResponse.json()

    const restored = await (await fetch(`${base}/${created.id}`, { headers })).json()
    assert.equal(restored.content, '云端内容')

    const updatedResponse = await fetch(`${base}/${created.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: created.version, content: '刷新后继续写' }),
    })
    assert.equal(updatedResponse.status, 200)
    const updated = await updatedResponse.json()
    assert.equal(updated.version, 2)

    const staleResponse = await fetch(`${base}/${created.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: created.version, content: '旧页面内容' }),
    })
    assert.equal(staleResponse.status, 409)
    assert.equal((await staleResponse.json()).draft.content, '刷新后继续写')
})
