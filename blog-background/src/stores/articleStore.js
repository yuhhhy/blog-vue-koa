import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useArticleStore = defineStore('article', () => {
    
    const createArticle = ref(localStorage.getItem('createArticle') || '')
    const lastOneEdit = ref(localStorage.getItem('lastOneEdit') || false)

    function setCreateArticle(content) {
        createArticle.value = content
        localStorage.setItem('createArticle', content)
    }
    function setLastOneEdit(boolean) {
        localStorage.setItem('lastOneEdit', boolean)
    }

    return {
        createArticle,
        lastOneEdit,
        setCreateArticle,
        setLastOneEdit
    }
})