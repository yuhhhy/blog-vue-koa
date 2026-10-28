import { ref } from 'vue'
import { getLinks } from '@/api/links.js'

const links = ref([])
let loadPromise

const loadLinks = async ({ force = false } = {}) => {
    if (force || !loadPromise) {
        loadPromise = getLinks().then((result) => {
            links.value = result.map((link) => ({
                ...link,
                category: link.category || 'friend',
            }))
            return links.value
        })
    }
    return loadPromise
}

export const useLinks = () => ({
    links,
    loadLinks,
})
