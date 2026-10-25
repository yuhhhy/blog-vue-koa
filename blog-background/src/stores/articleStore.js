import { defineStore } from 'pinia'
import { ref } from 'vue'

const ARTICLE_CONTENT_KEY = 'createArticle'
const ARTICLE_FORM_KEY = 'createArticleForm'

const readStoredForm = () => {
    try {
        return JSON.parse(localStorage.getItem(ARTICLE_FORM_KEY) || '{}')
    } catch {
        return {}
    }
}

export const useArticleStore = defineStore('article', () => {
    const createArticle = ref(localStorage.getItem(ARTICLE_CONTENT_KEY) || '')
    const createArticleForm = ref(readStoredForm())

    function setCreateArticle(content) {
        createArticle.value = content
        localStorage.setItem(ARTICLE_CONTENT_KEY, content)
    }

    function setCreateArticleForm(form) {
        createArticleForm.value = form
        localStorage.setItem(ARTICLE_FORM_KEY, JSON.stringify(form))
    }

    function clearArticleDraft() {
        createArticle.value = ''
        createArticleForm.value = {}
        localStorage.removeItem(ARTICLE_CONTENT_KEY)
        localStorage.removeItem(ARTICLE_FORM_KEY)
        localStorage.removeItem('lastOneEdit')
    }

    return {
        createArticle,
        createArticleForm,
        setCreateArticle,
        setCreateArticleForm,
        clearArticleDraft,
    }
})
