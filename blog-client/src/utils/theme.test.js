import assert from 'node:assert/strict'
import test from 'node:test'
import {
    DEFAULT_THEME,
    THEME_STORAGE_VERSION,
    applyTheme,
    readStoredTheme,
} from './theme.js'

const createStorage = (initial = {}) => {
    const values = new Map(Object.entries(initial))
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        values,
    }
}

test('legacy theme preferences are reset to the current safe default', () => {
    const storage = createStorage({ theme: 'dark' })

    assert.equal(readStoredTheme(storage), DEFAULT_THEME)
    assert.equal(storage.values.get('theme'), DEFAULT_THEME)
    assert.equal(storage.values.get('theme-version'), THEME_STORAGE_VERSION)
})

test('unsupported theme values cannot remove the color variables', () => {
    const storage = createStorage({ theme: 'colorful', 'theme-version': THEME_STORAGE_VERSION })

    assert.equal(readStoredTheme(storage), DEFAULT_THEME)
})

test('current theme preferences are preserved and applied exclusively', () => {
    const storage = createStorage({ theme: 'dark', 'theme-version': THEME_STORAGE_VERSION })
    const classes = new Set(['light', 'unrelated'])
    const root = {
        classList: {
            add: (value) => classes.add(value),
            remove: (...values) => values.forEach((value) => classes.delete(value)),
        },
        style: {},
    }

    assert.equal(readStoredTheme(storage), 'dark')
    assert.equal(applyTheme('dark', root, storage), 'dark')
    assert.deepEqual([...classes].sort(), ['dark', 'unrelated'])
    assert.equal(root.style.colorScheme, 'dark')
})
