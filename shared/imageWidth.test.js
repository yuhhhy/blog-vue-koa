import test from 'node:test'
import assert from 'node:assert/strict'
import { parseImageWidth, setImageWidth } from './imageWidth.js'

test('parses image width metadata while preserving a regular title', () => {
    assert.deepEqual(parseImageWidth('示例图片 | width=50%'), { title: '示例图片', width: 50 })
    assert.deepEqual(parseImageWidth('width=75%'), { title: '', width: 75 })
    assert.deepEqual(parseImageWidth('普通标题'), { title: '普通标题', width: null })
})

test('sets, replaces and removes image width metadata', () => {
    assert.equal(setImageWidth('示例图片', 25), '示例图片 | width=25%')
    assert.equal(setImageWidth('示例图片 | width=25%', 100), '示例图片 | width=100%')
    assert.equal(setImageWidth('示例图片 | width=50%', null), '示例图片')
})

test('keeps alternate text separate and restores the visible title', () => {
    const storedTitle = setImageWidth('山间日落', 50)
    assert.equal(storedTitle, '山间日落 | width=50%')
    assert.deepEqual(parseImageWidth(storedTitle), { title: '山间日落', width: 50 })
})
