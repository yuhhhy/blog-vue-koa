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

    const empty = await fetch(base)
    assert.deepEqual(await empty.json(), [])

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
    assert.deepEqual((await listed.json()).map((item) => item.id), [essay.id])

    const updated = await fetch(`${base}/${essay.id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ title: '后来想到的标题', content: '修改后的正文' }),
    })
    assert.equal(updated.status, 200)
    assert.equal((await updated.json()).title, '后来想到的标题')

    const deleted = await fetch(`${base}/${essay.id}`, { method: 'DELETE', headers: jsonHeaders })
    assert.equal(deleted.status, 204)
    assert.deepEqual(await (await fetch(base)).json(), [])
})
