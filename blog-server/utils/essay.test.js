import test from 'node:test'
import assert from 'node:assert/strict'
import {
    defaultEssayTitle,
    normalizeEssayImages,
    normalizeEssayInput,
} from './essay.js'

test('untitled essays use the publishing date in China', () => {
    const date = new Date('2026-10-27T17:30:00.000Z')
    assert.equal(defaultEssayTitle(date), '10月28日随笔')
    assert.deepEqual(
        normalizeEssayInput({ title: '  ', content: '  今天的记录  ' }, date),
        {
            title: '10月28日随笔',
            content: '今天的记录',
            images: [],
        },
    )
})

test('essay content is required and custom titles are kept', () => {
    assert.deepEqual(normalizeEssayInput({ title: '标题', content: '  ' }), {
        error: '随笔正文不能为空',
    })
    assert.deepEqual(
        normalizeEssayInput({
            title: ' 我的标题 ',
            content: ' 第一段\n第二段 ',
        }),
        {
            title: '我的标题',
            content: '第一段\n第二段',
            images: [],
        },
    )
})

test('essay images preserve order and support removing all attachments', () => {
    const images = ['/images/first.avif', '/images/second.png']
    assert.deepEqual(
        normalizeEssayInput({ content: '配图', images }).images,
        images,
    )
    assert.deepEqual(
        normalizeEssayInput({ content: '移除配图', images: [] }).images,
        [],
    )
    assert.deepEqual(normalizeEssayImages(), { images: [] })
})

test('rejects malformed image collections and non-image URL schemes', () => {
    for (const images of [
        null,
        'image.png',
        [null],
        [{}],
        ['javascript:alert(1)'],
        ['data:image/png;base64,a'],
        ['//example.com/a.png'],
    ]) {
        assert.equal(
            normalizeEssayInput({ content: '配图', images }).error,
            '随笔图片地址无效',
        )
    }
})
