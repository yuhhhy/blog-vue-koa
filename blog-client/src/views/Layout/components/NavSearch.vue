<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Charset, Document } from 'flexsearch'
import { apiGetBlogContentList, apiGetBlogContentSearchIndex } from '@/api/blogContent.js'

const route = useRoute()

const isOpen = ref(false)
const isLoading = ref(false)
const loadError = ref('')
const query = ref('')
const results = ref([])
const searchInput = ref(null)
const searchRoot = ref(null)

let searchIndex = null
let searchDocuments = new Map()
let searchReadyPromise = null

const hasQuery = computed(() => query.value.trim().length > 0)

const normalizeContent = (content = '') => {
    return content
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#>*_~|[\](){}-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

const createExcerpt = (content, keyword) => {
    const text = normalizeContent(content)
    const trimmedKeyword = keyword.trim().toLowerCase()
    const lowerText = text.toLowerCase()
    const matchIndex = trimmedKeyword ? lowerText.indexOf(trimmedKeyword) : -1
    const start = matchIndex > 28 ? matchIndex - 28 : 0
    const excerpt = text.slice(start, start + 96)

    if (!excerpt) return '暂无摘要'

    return `${start > 0 ? '...' : ''}${excerpt}${start + 96 < text.length ? '...' : ''}`
}

const normalizeSearchItem = (item) => {
    const contentText = normalizeContent(item.content)

    return {
        id: item.id,
        title: item.title,
        tags: item.tags || [],
        tagsText: (item.tags || []).join(' '),
        contentText,
        createTime: item.createTime,
        link: item.link || `/blog/${item.id}`,
        excerpt: createExcerpt(item.content, query.value)
    }
}

const fetchSearchIndexData = async () => {
    try {
        return await apiGetBlogContentSearchIndex()
    } catch (error) {
        return apiGetBlogContentList()
    }
}

const ensureSearchReady = async () => {
    if (searchReadyPromise) return searchReadyPromise

    searchReadyPromise = (async () => {
        isLoading.value = true
        loadError.value = ''

        try {
            const searchIndexData = await fetchSearchIndexData()

            searchIndex = new Document({
                charset: Charset.CJK,
                tokenize: 'full',
                document: {
                    id: 'id',
                    index: ['title', 'tagsText', 'contentText']
                }
            })

            searchDocuments = new Map()
            searchIndexData.map(normalizeSearchItem).forEach((item) => {
                searchDocuments.set(item.id, item)
                searchIndex.add(item)
            })
        } catch (error) {
            loadError.value = '搜索暂时不可用'
            searchReadyPromise = null
        } finally {
            isLoading.value = false
        }
    })()

    return searchReadyPromise
}

const runSearch = () => {
    const keyword = query.value.trim()

    if (!keyword || !searchIndex) {
        results.value = []
        return
    }

    const seen = new Set()
    const mergedResults = []

    searchIndex.search(keyword, { enrich: true, limit: 8 }).forEach((fieldResult) => {
        fieldResult.result.forEach((id) => {
            if (seen.has(id)) return

            const item = searchDocuments.get(id)
            if (!item) return

            seen.add(id)
            mergedResults.push({
                ...item,
                excerpt: createExcerpt(item.contentText, keyword)
            })
        })
    })

    results.value = mergedResults.slice(0, 8)
}

const openSearch = async () => {
    isOpen.value = true
    await nextTick()
    searchInput.value?.focus()
}

const closeSearch = () => {
    isOpen.value = false
    query.value = ''
    results.value = []
    loadError.value = ''
}

const toggleSearch = () => {
    if (isOpen.value) {
        closeSearch()
        return
    }

    openSearch()
}

const handleDocumentClick = (event) => {
    if (!isOpen.value || searchRoot.value?.contains(event.target)) return
    closeSearch()
}

const handleKeydown = (event) => {
    if (event.key === 'Escape') closeSearch()
}

watch(query, async () => {
    if (!hasQuery.value) {
        results.value = []
        loadError.value = ''
        return
    }

    await ensureSearchReady()
    runSearch()
})

watch(() => route.fullPath, () => {
    closeSearch()
})

onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div ref="searchRoot" class="nav-search" :class="{ 'nav-search--open': isOpen }">
        <button
            type="button"
            class="nav-search-toggle"
            :aria-label="isOpen ? '关闭搜索' : '打开搜索'"
            :aria-expanded="isOpen"
            @click.stop="toggleSearch"
        >
            <svg v-if="!isOpen" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5"></circle>
                <path d="M16 16l4 4"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12"></path>
                <path d="M18 6L6 18"></path>
            </svg>
        </button>

        <div class="nav-search-panel">
            <div class="nav-search-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5"></circle>
                    <path d="M16 16l4 4"></path>
                </svg>
                <input
                    ref="searchInput"
                    v-model="query"
                    type="text"
                    placeholder="搜索文章"
                    aria-label="搜索文章"
                >
            </div>

            <div v-if="isOpen && (hasQuery || isLoading)" class="nav-search-results">
                <div v-if="isLoading" class="nav-search-status">正在准备搜索...</div>
                <div v-else-if="loadError" class="nav-search-status">{{ loadError }}</div>
                <div v-else-if="hasQuery && results.length === 0" class="nav-search-status">没有找到相关文章</div>
                <RouterLink
                    v-for="item in results"
                    v-else
                    :key="item.id"
                    :to="item.link"
                    class="nav-search-result"
                >
                    <span class="nav-search-result-title">{{ item.title }}</span>
                    <span class="nav-search-result-excerpt">{{ item.excerpt }}</span>
                    <span v-if="item.tags.length" class="nav-search-result-tags">
                        <span v-for="tag in item.tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
                    </span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.nav-search {
    position: relative;
    width: 36px;
    height: 36px;

    .nav-search-toggle {
        position: relative;
        z-index: 3;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--dark);
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease;

        &:hover {
            background-color: var(--icon-background);
            color: var(--nav-active-color);
        }

        svg {
            width: 18px;
            height: 18px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
    }

    .nav-search-panel {
        position: absolute;
        z-index: 2;
        top: 0;
        right: 0;
        width: 36px;
        opacity: 0;
        pointer-events: none;
        transform-origin: right center;
        transition: width 0.22s ease, opacity 0.16s ease;
    }

    .nav-search-input-wrap {
        height: 36px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--border-color);
        border-radius: 999px;
        background-color: var(--white);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        padding: 0 42px 0 14px;

        svg {
            width: 16px;
            height: 16px;
            flex: 0 0 auto;
            fill: none;
            stroke: var(--quote-color);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        input {
            width: 100%;
            min-width: 0;
            border: 0;
            outline: none;
            background: transparent;
            color: var(--dark);
            font-size: 0.9rem;
            line-height: 1;
        }
    }

    .nav-search-results {
        position: absolute;
        top: 44px;
        right: 0;
        width: min(420px, calc(100vw - 32px));
        max-height: min(460px, calc(100vh - 92px));
        overflow: auto;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--white);
        box-shadow: 0 16px 38px rgba(0, 0, 0, 0.14);
        padding: 8px;
    }

    .nav-search-status {
        padding: 18px 16px;
        color: var(--quote-color);
        font-size: 0.9rem;
        text-align: center;
    }

    .nav-search-result {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        border-radius: 6px;
        color: var(--dark);
        transition: background-color 0.2s ease;

        &::after {
            display: none;
        }

        &:hover {
            background-color: var(--c1);
        }
    }

    .nav-search-result-title {
        font-size: 0.96rem;
        font-weight: 700;
        line-height: 1.45;
    }

    .nav-search-result-excerpt {
        color: var(--quote-color);
        font-size: 0.84rem;
        line-height: 1.55;
    }

    .nav-search-result-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        color: var(--nav-active-color);
        font-size: 0.78rem;
        line-height: 1.4;
    }
}

.nav-search--open {
    .nav-search-panel {
        width: min(320px, calc(100vw - 110px));
        opacity: 1;
        pointer-events: auto;
    }
}

@media (max-width: 768px) {
    .nav-search {
        position: relative;

        .nav-search-panel {
            position: absolute;
            top: 0;
            right: 0;
            width: 36px;
        }

        .nav-search-results {
            position: fixed;
            top: 58px;
            left: 14px;
            right: 14px;
            width: auto;
            max-height: min(420px, calc(100vh - 84px));
        }
    }

    .nav-search--open {
        .nav-search-panel {
            width: min(260px, calc(100vw - 116px));
        }
    }
}
</style>
