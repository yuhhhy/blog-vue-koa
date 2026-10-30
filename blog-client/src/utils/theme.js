export const DEFAULT_THEME = 'light'
export const THEME_STORAGE_KEY = 'theme'
export const THEME_STORAGE_VERSION_KEY = 'theme-version'
export const THEME_STORAGE_VERSION = '2'

const supportedThemes = new Set(['light', 'dark'])

export const readStoredTheme = (storage = localStorage) => {
    const storedTheme = storage.getItem(THEME_STORAGE_KEY)
    const storedVersion = storage.getItem(THEME_STORAGE_VERSION_KEY)

    if (storedVersion === THEME_STORAGE_VERSION && supportedThemes.has(storedTheme)) {
        return storedTheme
    }

    storage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME)
    storage.setItem(THEME_STORAGE_VERSION_KEY, THEME_STORAGE_VERSION)
    return DEFAULT_THEME
}

export const applyTheme = (theme, root = document.documentElement, storage = localStorage) => {
    const nextTheme = supportedThemes.has(theme) ? theme : DEFAULT_THEME
    root.classList.remove('light', 'dark')
    root.classList.add(nextTheme)
    root.style.colorScheme = nextTheme
    storage.setItem(THEME_STORAGE_KEY, nextTheme)
    storage.setItem(THEME_STORAGE_VERSION_KEY, THEME_STORAGE_VERSION)
    return nextTheme
}

export const initializeTheme = (root = document.documentElement, storage = localStorage) => (
    applyTheme(readStoredTheme(storage), root, storage)
)
