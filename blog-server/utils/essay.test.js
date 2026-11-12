import test from 'node:test'
import assert from 'node:assert/strict'
import {
    defaultEssayTitle,
    normalizeEssayImages,
    normalizeEssayInput,
    normalizeEssayTime,
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

test('validates selected timestamps and keeps empty draft times unset', () => {
    const now = new Date('2026-11-12T07:00:00Z')
    assert.equal(
        normalizeEssayTime(null, now).createTime.valueOf(),
        now.valueOf(),
    )
    assert.equal(normalizeEssayTime(null, null).createTime, null)
    assert.equal(
        normalizeEssayTime(
            '2026-11-12T15:30:00+08:00',
        ).createTime.toISOString(),
        '2026-11-12T07:30:00.000Z',
    )
    for (const invalid of [
        'not-a-date',
        '2026-02-30T12:00:00Z',
        '2026-11-12T24:00:00Z',
        '2026-11-12T15:00:00',
        0,
        {},
        true,
    ]) {
        assert.equal(normalizeEssayTime(invalid).error, '随笔日期和时间无效')
    }
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
