import test from 'node:test'
import assert from 'node:assert/strict'
import { loadCommentProfile, saveCommentProfile } from './commentProfile.js'

const memoryStorage = () => {
    const entries = new Map()
    return {
        getItem: (key) => entries.get(key) ?? null,
        setItem: (key, value) => entries.set(key, value),
    }
}

test('restores comment identity and custom avatar without retaining comment text', () => {
    const storage = memoryStorage()
    const profile = {
        username: '访客',
        email: 'visitor@example.com',
        website: 'https://example.com',
        customAvatarUrl: 'https://example.com/avatar.png',
    }
    assert.equal(
        saveCommentProfile(
            { ...profile, content: '不保存正文', avatar: '不固定邮箱头像' },
            storage,
        ),
        true,
    )
    assert.deepEqual(loadCommentProfile(storage), profile)
})

test('removing the custom avatar replaces the previous preference', () => {
    const storage = memoryStorage()
    saveCommentProfile(
        {
            email: 'visitor@example.com',
            customAvatarUrl: 'https://example.com/avatar.png',
        },
        storage,
    )
    saveCommentProfile(
        { email: 'visitor@example.com', customAvatarUrl: '' },
        storage,
    )
    assert.equal(loadCommentProfile(storage).customAvatarUrl, '')
})

test('corrupt or unavailable storage does not break commenting', () => {
    const empty = { username: '', email: '', website: '', customAvatarUrl: '' }
    assert.deepEqual(loadCommentProfile({ getItem: () => '{invalid' }), empty)
    assert.deepEqual(
        loadCommentProfile({ getItem: () => '{"username":42,"email":null}' }),
        empty,
    )
    const blocked = {
        getItem() {
            throw new Error('blocked')
        },
        setItem() {
            throw new Error('blocked')
        },
    }
    assert.deepEqual(loadCommentProfile(blocked), empty)
    assert.equal(saveCommentProfile({ username: '访客' }, blocked), false)
})
