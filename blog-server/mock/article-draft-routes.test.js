import test from 'node:test'
import assert from 'node:assert/strict'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './router.js'

test('article drafts can be published without a cover image', async (t) => {
    const app = new Koa()
    app.use(bodyParser())
    app.use(router.routes())
    const server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    t.after(() => new Promise((resolve) => server.close(resolve)))

    const base = `http://127.0.0.1:${server.address().port}/api`
    const createdResponse = await fetch(`${base}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: '无封面文章',
            author: '作者',
            tags: ['写作'],
            content: '这是一篇没有封面的文章。',
        }),
    })
    assert.equal(createdResponse.status, 201)
    const draft = await createdResponse.json()
    assert.equal(draft.coverImage, '')

    const publishedResponse = await fetch(`${base}/drafts/${draft.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: draft.version }),
    })
    assert.equal(publishedResponse.status, 201)

    const blogs = await (await fetch(`${base}/blog/bloglist`)).json()
    const blog = blogs.find((item) => item.id === draft.id)
    assert.ok(blog)
    assert.equal(blog.coverImage, '')

    const content = await (await fetch(`${base}/blogcontent/${draft.id}`)).json()
    assert.equal(content.coverImage, '')
})
