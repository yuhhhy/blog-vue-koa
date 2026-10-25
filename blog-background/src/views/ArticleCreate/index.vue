<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import VditorEditor from './components/VditorEditor.vue'
import ArticleForm from './components/ArticleForm.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import { useArticleStore } from '@/stores/articleStore.js'
import {
    apiCreateArticleDraft,
    apiGetArticleDraft,
    apiPublishArticleDraft,
    apiUpdateArticleDraft,
} from '@/api/articleDraft.js'

const AUTO_SAVE_DELAY = 2000

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const editorRef = ref(null)
const articleFormRef = ref(null)
const editorContent = ref(articleStore.createArticle || '')
const draftId = ref(null)
const draftVersion = ref(null)
const saveStatus = ref('local')
const submitting = ref(false)

let formDraft = { ...articleStore.createArticleForm }
let saveTimer = null
let saveInFlight = null
let saveAgain = false
let hydrating = true
let changeSequence = 0

const draftPayload = () => ({
    title: formDraft.title || '',
    author: formDraft.author || '',
    tags: Array.isArray(formDraft.tags) ? formDraft.tags : [],
    coverImage: formDraft.coverImg || '',
    content: editorContent.value || '',
})

const hasDraftContent = () => {
    const draft = draftPayload()
    return Boolean(
        draft.title.trim()
        || draft.author.trim()
        || draft.coverImage.trim()
        || draft.content.trim()
        || draft.tags.length
    )
}

const rememberCloudDraft = (draft) => {
    draftId.value = draft.id
    draftVersion.value = draft.version
    articleStore.setCloudDraft({ id: draft.id, version: draft.version })
}

const loadDraftIntoEditor = async (draft) => {
    hydrating = true
    editorContent.value = draft.content || ''
    formDraft = {
        title: draft.title || '',
        author: draft.author || '',
        tags: Array.isArray(draft.tags) ? [...draft.tags] : [],
        coverImg: draft.coverImage || '',
        coverImgUploaded: Boolean(draft.coverImage),
    }
    articleStore.setCreateArticle(editorContent.value)
    articleStore.setCreateArticleForm(formDraft)
    rememberCloudDraft(draft)
    await nextTick()
    articleFormRef.value?.loadForm(draft)
    await nextTick()
    hydrating = false
    changeSequence = 0
    saveStatus.value = 'saved'
}

const resolveConflict = async (cloudDraft) => {
    saveStatus.value = 'conflict'
    try {
        await ElMessageBox.confirm(
            '另一台设备保存了更新。加载云端版本会替换当前页面内容；选择“覆盖云端”会保留本机内容。',
            '草稿版本冲突',
            {
                confirmButtonText: '加载云端版本',
                cancelButtonText: '覆盖云端',
                distinguishCancelAndClose: true,
                type: 'warning',
            }
        )
        await loadDraftIntoEditor(cloudDraft)
    } catch (action) {
        if (action !== 'cancel') return
        try {
            const savedDraft = await apiUpdateArticleDraft(cloudDraft.id, {
                ...draftPayload(),
                version: cloudDraft.version,
                force: true,
            })
            rememberCloudDraft(savedDraft)
            saveStatus.value = 'saved'
            ElMessage.success('本机草稿已覆盖云端版本')
        } catch {
            saveStatus.value = 'conflict'
            ElMessage.error('覆盖云端失败，本地内容仍已保留')
        }
    }
}

const saveDraft = async ({ force = false, flush = false } = {}) => {
    if (hydrating || (!draftId.value && !hasDraftContent())) return null
    if (saveInFlight) {
        if (flush) {
            await saveInFlight
            saveAgain = false
            return saveDraft({ force })
        }
        saveAgain = true
        return saveInFlight
    }

    clearTimeout(saveTimer)
    saveStatus.value = 'saving'
    const savingSequence = changeSequence
    const payload = draftPayload()
    saveInFlight = (async () => {
        try {
            let savedDraft
            if (!draftId.value) {
                savedDraft = await apiCreateArticleDraft(payload)
                await router.replace({ query: { ...route.query, draft: savedDraft.id } })
            } else {
                savedDraft = await apiUpdateArticleDraft(draftId.value, {
                    ...payload,
                    version: draftVersion.value,
                    force,
                })
            }

            rememberCloudDraft(savedDraft)
            if (savingSequence === changeSequence) {
                saveStatus.value = 'saved'
            } else {
                saveStatus.value = 'unsaved'
                saveAgain = true
            }
            return savedDraft
        } catch (error) {
            if (error.response?.status === 409 && error.response.data?.draft) {
                await resolveConflict(error.response.data.draft)
            } else {
                saveStatus.value = navigator.onLine ? 'unsaved' : 'offline'
            }
            return null
        } finally {
            saveInFlight = null
            if (saveAgain) {
                saveAgain = false
                queueAutoSave()
            }
        }
    })()

    return saveInFlight
}

const queueAutoSave = () => {
    clearTimeout(saveTimer)
    if (hydrating) return
    if (!draftId.value && !hasDraftContent()) {
        saveStatus.value = 'local'
        return
    }
    saveStatus.value = navigator.onLine ? 'unsaved' : 'offline'
    saveTimer = setTimeout(() => saveDraft(), AUTO_SAVE_DELAY)
}

const handleContentChange = (content) => {
    editorContent.value = content
    if (!hydrating) {
        changeSequence += 1
        queueAutoSave()
    }
}

const handleFormChange = (form) => {
    formDraft = { ...form, tags: [...(form.tags || [])] }
    if (!hydrating) {
        changeSequence += 1
        queueAutoSave()
    }
}

const clearCurrentDraft = async () => {
    clearTimeout(saveTimer)
    hydrating = true
    articleStore.clearArticleDraft()
    draftId.value = null
    draftVersion.value = null
    editorContent.value = ''
    formDraft = {}
    changeSequence = 0
    articleFormRef.value?.resetForm()
    editorRef.value?.clearContent()
    saveStatus.value = 'local'
    await router.replace({ query: {} })
    await nextTick()
    hydrating = false
}

const startNewDraft = async () => {
    if (hasDraftContent() && saveStatus.value !== 'saved') {
        await saveDraft({ flush: true })
        if (saveStatus.value !== 'saved') return
    }
    await clearCurrentDraft()
}

const submitHandler = async (formData) => {
    formDraft = { ...formData, tags: [...(formData.tags || [])] }
    if (!editorContent.value.trim()) {
        ElMessage.error('文章内容不能为空')
        return
    }

    submitting.value = true
    try {
        const savedDraft = await saveDraft({ flush: true })
        if (!savedDraft || saveStatus.value !== 'saved') {
            ElMessage.error('请先解决草稿保存问题后再发布')
            return
        }

        await apiPublishArticleDraft(draftId.value, draftVersion.value)
        articleStore.clearArticleDraft()
        ElMessage.success('文章发布成功')
        await router.push('/article/list')
    } catch (error) {
        if (error.response?.status === 409 && error.response.data?.draft) {
            await resolveConflict(error.response.data.draft)
        } else {
            ElMessage.error(error.response?.data?.message || '发布失败，草稿仍已保留')
        }
    } finally {
        submitting.value = false
    }
}

const restoreInitialDraft = async () => {
    const requestedId = route.query.draft || articleStore.cloudDraft?.id
    if (!requestedId) {
        hydrating = false
        if (hasDraftContent()) queueAutoSave()
        return
    }

    try {
        const draft = await apiGetArticleDraft(requestedId)
        await loadDraftIntoEditor(draft)
        if (route.query.draft !== draft.id) {
            await router.replace({ query: { ...route.query, draft: draft.id } })
        }
    } catch (error) {
        if (error.response?.status === 404) articleStore.setCloudDraft(null)
        hydrating = false
        saveStatus.value = hasDraftContent() ? 'unsaved' : 'local'
        if (hasDraftContent()) queueAutoSave()
    }
}

const handleOnline = () => {
    if (saveStatus.value === 'offline' || saveStatus.value === 'unsaved') queueAutoSave()
}

const flushPendingDraft = () => {
    if (!hydrating && saveStatus.value !== 'saved' && navigator.onLine) {
        void saveDraft({ flush: true })
    }
}

const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') flushPendingDraft()
}

onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('pagehide', flushPendingDraft)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    restoreInitialDraft()
})

onBeforeRouteLeave(async () => {
    clearTimeout(saveTimer)
    if (!hydrating && saveStatus.value !== 'saved' && navigator.onLine) {
        await saveDraft({ flush: true })
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('pagehide', flushPendingDraft)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    clearTimeout(saveTimer)
    flushPendingDraft()
})
</script>

<template>
    <AdminPage class="article-create-page">
        <AdminCard title="文章正文" class="editor-card">
            <VditorEditor ref="editorRef" :content="editorContent" @vblur="handleContentChange" />
        </AdminCard>
        <ArticleForm
            ref="articleFormRef"
            :submitting="submitting"
            @draft-change="handleFormChange"
            @new-draft="startNewDraft"
            @article-submit="submitHandler"
        />
    </AdminPage>
</template>

<style scoped>
.editor-card { overflow: visible; }
</style>
