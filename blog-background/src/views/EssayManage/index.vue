<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { mdiPlus } from '@mdi/js'
import {
    apiCreateEssay,
    apiCreateEssayDraft,
    apiDeleteEssay,
    apiDeleteEssayDraft,
    apiGetEssayDraft,
    apiGetEssays,
    apiUpdateEssay,
    apiUpdateEssayDraft,
} from '@/api/essays.js'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'

const essays = ref([])
const loading = ref(true)
const loadError = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)
const editingId = ref('')
const draftId = ref('')
const draftVersion = ref(0)
const cloudSaveState = ref('')
const contentError = ref('')
const form = reactive({ title: '', content: '' })
const rowActions = [
    { key: 'edit', label: '编辑' },
    { key: 'delete', label: '删除', danger: true },
]
const ESSAY_DRAFT_REFERENCE_KEY = 'essay-cloud-draft'
let autoSaveTimer
let cloudSavePromise
let saveQueued = false
let hydrating = false

const rememberDraft = (draft) => {
    draftId.value = draft.id
    draftVersion.value = draft.version
    localStorage.setItem(ESSAY_DRAFT_REFERENCE_KEY, JSON.stringify({ id: draft.id }))
}

const clearDraftReference = () => {
    draftId.value = ''
    draftVersion.value = 0
    localStorage.removeItem(ESSAY_DRAFT_REFERENCE_KEY)
}

const draftPayload = () => ({
    sourceEssayId: editingId.value,
    title: form.title,
    content: form.content,
})

const persistCloudDraft = async () => {
    clearTimeout(autoSaveTimer)
    if (!form.title.trim() && !form.content.trim()) return null
    if (cloudSavePromise) {
        saveQueued = true
        await cloudSavePromise.catch(() => {})
        if (saveQueued) {
            saveQueued = false
            return persistCloudDraft()
        }
        return null
    }

    cloudSaveState.value = 'saving'
    cloudSavePromise = (draftId.value
        ? apiUpdateEssayDraft(draftId.value, { ...draftPayload(), version: draftVersion.value })
        : apiCreateEssayDraft(draftPayload()))
        .then((draft) => {
            rememberDraft(draft)
            cloudSaveState.value = 'saved'
            return draft
        })
        .catch((error) => {
            cloudSaveState.value = 'error'
            throw error
        })
        .finally(() => {
            cloudSavePromise = null
        })
    return cloudSavePromise
}

const scheduleCloudSave = () => {
    if (hydrating) return
    cloudSaveState.value = 'pending'
    clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => persistCloudDraft().catch(() => {}), 800)
}

const restoreCloudDraft = async () => {
    let reference
    try {
        reference = JSON.parse(localStorage.getItem(ESSAY_DRAFT_REFERENCE_KEY) || 'null')
    } catch {
        clearDraftReference()
    }
    if (!reference?.id) return

    try {
        const draft = await apiGetEssayDraft(reference.id)
        hydrating = true
        rememberDraft(draft)
        editingId.value = draft.sourceEssayId || ''
        form.title = draft.title || ''
        form.content = draft.content || ''
        cloudSaveState.value = 'saved'
        await nextTick()
        hydrating = false
    } catch {
        clearDraftReference()
    }
}

const formatDate = (value) => new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
}).format(new Date(value))

const loadEssays = async () => {
    loading.value = true
    loadError.value = false
    try {
        essays.value = await apiGetEssays()
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    clearTimeout(autoSaveTimer)
    hydrating = true
    editingId.value = ''
    clearDraftReference()
    form.title = ''
    form.content = ''
    contentError.value = ''
    cloudSaveState.value = ''
    nextTick(() => { hydrating = false })
}

const editEssay = (essay) => {
    clearTimeout(autoSaveTimer)
    hydrating = true
    clearDraftReference()
    editingId.value = essay.id
    form.title = essay.title
    form.content = essay.content
    contentError.value = ''
    cloudSaveState.value = ''
    nextTick(() => { hydrating = false })
    document.getElementById('essay-editor')?.scrollIntoView({ behavior: 'smooth' })
}

const saveEssay = async () => {
    if (saving.value) return
    contentError.value = form.content.trim() ? '' : '请输入随笔正文'
    if (contentError.value) return

    saving.value = true
    try {
        await persistCloudDraft()
        const data = { title: form.title.trim(), content: form.content.trim() }
        if (editingId.value) {
            await apiUpdateEssay(editingId.value, data)
            ElMessage.success('随笔已更新')
        } else {
            await apiCreateEssay(data)
            ElMessage.success('随笔已发布')
        }
        const publishedDraftId = draftId.value
        if (publishedDraftId) await apiDeleteEssayDraft(publishedDraftId).catch(() => {})
        resetForm()
        await loadEssays()
    } catch {
        // 请求层会展示错误信息，保留表单以便重试。
    } finally {
        saving.value = false
    }
}

const handleRowAction = (action, essay) => {
    if (action === 'edit') editEssay(essay)
    if (action === 'delete') {
        pendingDelete.value = essay
        deleteDialogVisible.value = true
    }
}

const confirmDelete = async () => {
    if (!pendingDelete.value || deleting.value) return
    deleting.value = true
    try {
        await apiDeleteEssay(pendingDelete.value.id)
        if (editingId.value === pendingDelete.value.id) resetForm()
        deleteDialogVisible.value = false
        pendingDelete.value = null
        ElMessage.success('随笔已删除')
        await loadEssays()
    } catch {
        // 请求层会展示错误信息，保留删除弹窗以便重试。
    } finally {
        deleting.value = false
    }
}

watch(() => [form.title, form.content], scheduleCloudSave)

onMounted(async () => {
    await Promise.all([loadEssays(), restoreCloudDraft()])
})

onBeforeUnmount(() => clearTimeout(autoSaveTimer))
</script>

<template>
    <AdminPage class="essay-manage-page">
        <AdminCard id="essay-editor" :title="editingId ? '编辑随笔' : '写随笔'">
            <form class="essay-form" @submit.prevent="saveEssay">
                <MaterialTextField
                    v-model="form.title"
                    label="标题（可选）"
                    :maxlength="120"
                    supporting-text="留空时，发布后自动使用日期作为标题"
                />
                <div class="essay-content-field">
                    <label for="essay-content">正文</label>
                    <textarea
                        id="essay-content"
                        v-model="form.content"
                        rows="12"
                        placeholder="写下今天想记录的内容…"
                        :aria-invalid="Boolean(contentError) || undefined"
                        :aria-describedby="contentError ? 'essay-content-error' : undefined"
                        @input="contentError = ''"
                    />
                    <p v-if="contentError" id="essay-content-error" class="essay-content-error">{{ contentError }}</p>
                </div>
                <div class="essay-form-actions">
                    <span class="essay-cloud-state" role="status">
                        {{ cloudSaveState === 'saving' ? '正在保存到云端…' : cloudSaveState === 'pending' ? '等待保存…' : cloudSaveState === 'saved' ? '已保存到云端' : cloudSaveState === 'error' ? '云端保存失败' : '' }}
                    </span>
                    <AdminButton v-if="editingId" variant="text" @click="resetForm">取消编辑</AdminButton>
                    <AdminButton tone="primary" type="submit" :disabled="saving">
                        {{ saving ? '保存中…' : editingId ? '保存更改' : '发布随笔' }}
                    </AdminButton>
                </div>
            </form>
        </AdminCard>

        <AdminCard title="已发布的随笔">
            <div class="essay-list-toolbar">
                <span>{{ essays.length }} 篇随笔</span>
                <AdminButton variant="text" :icon="mdiPlus" @click="resetForm">写新随笔</AdminButton>
            </div>
            <p v-if="loadError" class="essay-load-error">
                随笔加载失败。<button type="button" @click="loadEssays">重试</button>
            </p>
            <AdminList v-if="!loadError" :items="essays" :loading="loading" empty-text="暂无随笔" item-label="篇随笔">
                <template #item="{ item }">
                    <AdminListItem :headline="item.title" :supporting-text="item.content" :overline="formatDate(item.createTime)">
                        <template #actions>
                            <AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" />
                        </template>
                    </AdminListItem>
                </template>
            </AdminList>
        </AdminCard>

        <AdminConfirmDialog
            v-model="deleteDialogVisible"
            title="删除随笔"
            :message="`确定删除“${pendingDelete?.title || ''}”吗？此操作无法撤销。`"
            confirm-text="删除"
            danger
            :loading="deleting"
            @confirm="confirmDelete"
        />
    </AdminPage>
</template>

<style scoped>
.essay-form { display: grid; max-width: 900px; gap: 24px; }
.essay-content-field { display: grid; gap: 8px; }
.essay-content-field label { color: var(--md-sys-color-on-surface); font-size: 14px; font-weight: 600; }
.essay-content-field textarea {
    width: 100%;
    min-height: 240px;
    padding: 16px;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 12px;
    outline: none;
    color: var(--md-sys-color-on-surface);
    background: var(--md-sys-color-surface-container-low);
    font: inherit;
    line-height: 1.7;
    resize: vertical;
}
.essay-content-field textarea:focus { border-color: var(--md-sys-color-primary); }
.essay-content-field textarea[aria-invalid="true"] { border-color: var(--md-sys-color-error); }
.essay-content-error { margin: 0; color: var(--md-sys-color-error); font-size: 13px; }
.essay-form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.essay-cloud-state { margin-right: auto; color: var(--md-sys-color-on-surface-variant); font-size: 12px; }
.essay-list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.essay-load-error { color: var(--md-sys-color-error); }
.essay-load-error button { border: 0; color: var(--md-sys-color-primary); background: none; cursor: pointer; text-decoration: underline; }
</style>
