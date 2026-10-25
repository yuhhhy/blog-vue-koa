import { defineStore } from 'pinia'
import { ref } from 'vue'

const ARTICLE_CONTENT_KEY = 'createArticle'
const ARTICLE_FORM_KEY = 'createArticleForm'
const ARTICLE_CLOUD_KEY = 'createArticleCloudDraft'

const readStoredForm = () => {
    try {
        return JSON.parse(localStorage.getItem(ARTICLE_FORM_KEY) || '{}')
    } catch {
        return {}
    }
}

const readCloudDraft = () => {
    try {
        return JSON.parse(localStorage.getItem(ARTICLE_CLOUD_KEY) || 'null')
    } catch {
        return null
    }
}

export const useArticleStore = defineStore('article', () => {
    const createArticle = ref(localStorage.getItem(ARTICLE_CONTENT_KEY) || '')
    const createArticleForm = ref(readStoredForm())
    const cloudDraft = ref(readCloudDraft())

    function setCreateArticle(content) {
        createArticle.value = content
        localStorage.setItem(ARTICLE_CONTENT_KEY, content)
    }

    function setCreateArticleForm(form) {
        createArticleForm.value = form
        localStorage.setItem(ARTICLE_FORM_KEY, JSON.stringify(form))
    }

    function setCloudDraft(draft) {
        cloudDraft.value = draft
        if (draft) localStorage.setItem(ARTICLE_CLOUD_KEY, JSON.stringify(draft))
        else localStorage.removeItem(ARTICLE_CLOUD_KEY)
    }

    function clearArticleDraft() {
        createArticle.value = ''
        createArticleForm.value = {}
        cloudDraft.value = null
        localStorage.removeItem(ARTICLE_CONTENT_KEY)
        localStorage.removeItem(ARTICLE_FORM_KEY)
        localStorage.removeItem(ARTICLE_CLOUD_KEY)
        localStorage.removeItem('lastOneEdit')
    }

    return {
        createArticle,
        createArticleForm,
        cloudDraft,
        setCreateArticle,
        setCreateArticleForm,
        setCloudDraft,
        clearArticleDraft,
    }
})
