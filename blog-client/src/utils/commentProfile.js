const STORAGE_KEY = 'blog-comment-profile'
const fields = ['username', 'email', 'website', 'customAvatarUrl']

const normalizeProfile = (value) =>
    Object.fromEntries(
        fields.map((field) => [
            field,
            typeof value?.[field] === 'string' ? value[field] : '',
        ]),
    )

export const loadCommentProfile = (storage) => {
    try {
        return normalizeProfile(
            JSON.parse(
                (storage ?? globalThis.localStorage).getItem(STORAGE_KEY),
            ),
        )
    } catch {
        return normalizeProfile(null)
    }
}

export const saveCommentProfile = (profile, storage) => {
    try {
        ;(storage ?? globalThis.localStorage).setItem(
            STORAGE_KEY,
            JSON.stringify(normalizeProfile(profile)),
        )
        return true
    } catch {
        // Storage restrictions must not interrupt a successfully posted comment.
        return false
    }
}
