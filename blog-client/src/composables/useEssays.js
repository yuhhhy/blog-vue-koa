import { ref } from 'vue'
import { apiGetEssays } from '@/api/essays.js'

const essays = ref([])
const loading = ref(true)
const loadError = ref(false)
let isLoaded = false
let loadingPromise = null

const loadEssays = async ({ force = false } = {}) => {
    if (isLoaded && !force) return essays.value
    if (loadingPromise && !force) return loadingPromise

    loading.value = true
    loadError.value = false
    loadingPromise = apiGetEssays()
        .then((response) => {
            essays.value = response
            isLoaded = true
            return essays.value
        })
        .catch((error) => {
            loadError.value = true
            throw error
        })
        .finally(() => {
            loading.value = false
            loadingPromise = null
        })

    return loadingPromise
}

export const useEssays = () => ({
    essays,
    loading,
    loadError,
    loadEssays,
})
