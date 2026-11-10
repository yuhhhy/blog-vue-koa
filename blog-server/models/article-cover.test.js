import test from 'node:test'
import assert from 'node:assert/strict'
import { Blog } from './BlogSchema.js'
import { BlogContent } from './BlogContentSchema.js'

test('published article models allow an empty cover image', () => {
    const article = {
        id: 'article-without-cover',
        title: '无封面文章',
        author: '作者',
        tags: ['写作'],
        content: '正文',
        wordCount: 2,
        link: '/blog/article-without-cover',
    }

    const blog = new Blog(article)
    const blogContent = new BlogContent(article)

    assert.equal(blog.validateSync(), undefined)
    assert.equal(blogContent.validateSync(), undefined)
    assert.equal(blog.coverImage, '')
    assert.equal(blogContent.coverImage, '')
})
