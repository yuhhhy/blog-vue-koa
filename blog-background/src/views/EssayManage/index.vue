<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { toEssayTimeInput, fromEssayTimeInput } from '@/utils/essayTime.js'
import { apiUploadImage } from '@/api/files.js'
import AdminFileButton from '@/components/admin/AdminFileButton.vue'
import { mdiPlus } from '@mdi/js'
import {
    apiCreateEssay,
    apiCreateEssayDraft,
    apiDeleteEssay,
    apiDeleteEssayDraft,
    apiGetEssayDraft,
    apiGetEssayDrafts,
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
import EssayFullscreenEditor from './components/EssayFullscreenEditor.vue'

const essays = ref([])
const drafts = ref([])
const loading = ref(true)
const draftsLoading = ref(true)
const loadError = ref(false)
const draftsLoadError = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)
const pendingDraftDelete = ref(null)
const draftDeleteDialogVisible = ref(false)
const editingId = ref('')
const draftId = ref('')
const draftVersion = ref(0)
const cloudSaveState = ref('')
const contentError = ref('')
const fullscreenEditorOpen = ref(false)
const contentInput = ref(null)
const contentSelection = ref([0, 0])
const form = reactive({ title: '', content: '', images: [], createTime: '' })
const uploading = ref(false)
const removingImage = ref(false)
const imageList = ref(null)
const draggingImage = ref('')
const imageDropTarget = ref('')
let uploadController
const rowActions = [
    { key: 'edit', label: '编辑' },
    { key: 'delete', label: '删除', danger: true },
]
const draftActions = [
    { key: 'edit', label: '继续编辑' },
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
    localStorage.setItem(
        ESSAY_DRAFT_REFERENCE_KEY,
        JSON.stringify({ id: draft.id }),
    )
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
    createTime: fromEssayTimeInput(form.createTime),
    images: [...form.images],
})

const persistCloudDraft = async () => {
    clearTimeout(autoSaveTimer)
    if (
        !form.title.trim() &&
        !form.content.trim() &&
        !form.images.length &&
        !form.createTime &&
        !draftId.value
    )
        return null
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
    cloudSavePromise = (
        draftId.value
            ? apiUpdateEssayDraft(draftId.value, {
                  ...draftPayload(),
                  version: draftVersion.value,
              })
            : apiCreateEssayDraft(draftPayload())
    )
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
        reference = JSON.parse(
            localStorage.getItem(ESSAY_DRAFT_REFERENCE_KEY) || 'null',
        )
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
        form.createTime = toEssayTimeInput(draft.createTime)
        form.images = [...(draft.images || [])]
        cloudSaveState.value = 'saved'
        await nextTick()
        hydrating = false
    } catch {
        clearDraftReference()
    }
}

const formatDate = (value) =>
    new Intl.DateTimeFormat('zh-CN', {
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

const loadDrafts = async () => {
    draftsLoading.value = true
    draftsLoadError.value = false
    try {
        drafts.value = await apiGetEssayDrafts()
    } catch {
        draftsLoadError.value = true
    } finally {
        draftsLoading.value = false
    }
}

const resetForm = (afterSave = false) => {
    if (
        uploading.value ||
        removingImage.value ||
        (saving.value && afterSave !== true)
    )
        return
    clearTimeout(autoSaveTimer)
    hydrating = true
    editingId.value = ''
    clearDraftReference()
    form.title = ''
    form.content = ''
    form.createTime = ''
    form.images = []
    contentError.value = ''
    cloudSaveState.value = ''
    nextTick(() => {
        hydrating = false
    })
}

const editEssay = (essay) => {
    if (uploading.value || removingImage.value || saving.value) return
    clearTimeout(autoSaveTimer)
    hydrating = true
    clearDraftReference()
    editingId.value = essay.id
    form.title = essay.title
    form.content = essay.content
    form.createTime = toEssayTimeInput(essay.createTime)
    form.images = [...(essay.images || [])]
    contentError.value = ''
    cloudSaveState.value = ''
    nextTick(() => {
        hydrating = false
    })
    document
        .getElementById('essay-editor')
        ?.scrollIntoView({ behavior: 'smooth' })
}

const editDraft = async (summary) => {
    if (uploading.value || removingImage.value || saving.value) return
    clearTimeout(autoSaveTimer)
    try {
        const draft = await apiGetEssayDraft(summary.id)
        hydrating = true
        rememberDraft(draft)
        editingId.value = draft.sourceEssayId || ''
        form.title = draft.title || ''
        form.content = draft.content || ''
        form.createTime = toEssayTimeInput(draft.createTime)
        form.images = [...(draft.images || [])]
        contentError.value = ''
        cloudSaveState.value = 'saved'
        await nextTick()
        hydrating = false
        document
            .getElementById('essay-editor')
            ?.scrollIntoView({ behavior: 'smooth' })
    } catch {
        await loadDrafts()
    }
}

const saveAsDraft = async () => {
    if (uploading.value || removingImage.value || saving.value) return
    if (
        !form.title.trim() &&
        !form.content.trim() &&
        !form.images.length &&
        !form.createTime
    ) {
        ElMessage.warning('请先写一些内容')
        return
    }
    try {
        await persistCloudDraft()
        await loadDrafts()
        ElMessage.success('随笔草稿已保存')
    } catch {
        // 请求层会展示错误信息，编辑内容继续保留。
    }
}

const saveEssay = async () => {
    if (saving.value || uploading.value || removingImage.value) return
    contentError.value = form.content.trim() ? '' : '请输入随笔正文'
    if (contentError.value) return

    saving.value = true
    try {
        await persistCloudDraft()
        const data = {
            title: form.title.trim(),
            content: form.content.trim(),
            createTime: fromEssayTimeInput(form.createTime),
            images: [...form.images],
        }
        if (editingId.value) {
            await apiUpdateEssay(editingId.value, data)
            ElMessage.success('随笔已更新')
        } else {
            await apiCreateEssay(data)
            ElMessage.success('随笔已发布')
        }
        const publishedDraftId = draftId.value
        if (publishedDraftId)
            await apiDeleteEssayDraft(publishedDraftId).catch(() => {})
        resetForm(true)
        await Promise.all([loadEssays(), loadDrafts()])
    } catch {
        // 请求层会展示错误信息，保留表单以便重试。
    } finally {
        saving.value = false
    }
}

const handleDraftAction = (action, draft) => {
    if (uploading.value || removingImage.value || saving.value) return
    if (action === 'edit') editDraft(draft)
    if (action === 'delete') {
        pendingDraftDelete.value = draft
        draftDeleteDialogVisible.value = true
    }
}

const confirmDraftDelete = async () => {
    if (!pendingDraftDelete.value || deleting.value) return
    deleting.value = true
    try {
        const deletingId = pendingDraftDelete.value.id
        await apiDeleteEssayDraft(deletingId)
        if (draftId.value === deletingId) resetForm()
        draftDeleteDialogVisible.value = false
        pendingDraftDelete.value = null
        ElMessage.success('随笔草稿已删除')
        await loadDrafts()
    } catch {
        // 请求层会展示错误信息，保留删除弹窗以便重试。
    } finally {
        deleting.value = false
    }
}

const handleRowAction = (action, essay) => {
    if (uploading.value || removingImage.value || saving.value) return
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

const uploadImages = async (files) => {
    if (uploading.value || removingImage.value || saving.value) return
    if (files.some((file) => !file.type.startsWith('image/'))) {
        ElMessage.warning('请选择图片文件')
        return
    }
    uploading.value = true
    uploadController = new AbortController()
    let uploaded = 0
    try {
        for (const file of files) {
            const body = new FormData()
            body.append('file', file, `${crypto.randomUUID()}-${file.name}`)
            body.append('convertToAvif', 'true')
            const data = await apiUploadImage(body, uploadController.signal)
            if (!data?.filename) throw new Error('上传响应缺少图片地址')
            form.images.push(`/images/${encodeURIComponent(data.filename)}`)
            uploaded++
        }
        await persistCloudDraft()
        ElMessage.success(`${uploaded} 张图片上传成功`)
    } catch (error) {
        if (!uploadController.signal.aborted) {
            ElMessage.warning(
                uploaded === files.length
                    ? '图片已上传，草稿保存失败，请重试保存'
                    : `已添加 ${uploaded} 张图片，其余图片未上传成功，请重新选择上传`,
            )
        }
    } finally {
        uploading.value = false
    }
}

const removeImage = async (index) => {
    if (uploading.value || removingImage.value || saving.value) return
    removingImage.value = true
    try {
        // Persist the reference first, even if this upload preceded autosave.
        await persistCloudDraft()
        form.images.splice(index, 1)
        await persistCloudDraft()
    } catch {
        // Keep the editor available for retry; the request layer reports errors.
    } finally {
        removingImage.value = false
    }
}

const finishImageDrag = () => {
    draggingImage.value = ''
    imageDropTarget.value = ''
}

const reorderImage = (image, targetIndex) => {
    if (uploading.value || removingImage.value || saving.value) return
    const sourceIndex = form.images.indexOf(image)
    if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= form.images.length ||
        sourceIndex === targetIndex
    )
        return
    const images = [...form.images]
    images.splice(sourceIndex, 1)
    images.splice(targetIndex, 0, image)
    form.images = images
}

const startImageDrag = (event, image) => {
    if (event.defaultPrevented) return
    if (uploading.value || removingImage.value || saving.value) {
        event.preventDefault()
        return
    }
    draggingImage.value = image
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', image)
}

const dragOverImages = (event) => {
    if (!draggingImage.value || !imageList.value) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const { left, right } = imageList.value.getBoundingClientRect()
    if (event.clientX < left + 40) imageList.value.scrollLeft -= 24
    else if (event.clientX > right - 40) imageList.value.scrollLeft += 24
}

const dropImage = (index) => {
    if (draggingImage.value) reorderImage(draggingImage.value, index)
    finishImageDrag()
}

const openFullscreenEditor = () => {
    if (saving.value) return
    const input = contentInput.value
    contentSelection.value = [
        input?.selectionStart || 0,
        input?.selectionEnd || 0,
    ]
    fullscreenEditorOpen.value = true
}

watch(
    () => [form.title, form.content, form.createTime, ...form.images],
    scheduleCloudSave,
)

onMounted(async () => {
    await Promise.all([loadEssays(), loadDrafts(), restoreCloudDraft()])
})

onBeforeUnmount(() => {
    clearTimeout(autoSaveTimer)
    uploadController?.abort()
})
</script>

<template>
    <AdminPage class="essay-manage-page">
        <AdminCard
            id="essay-editor"
            :title="editingId ? '编辑随笔' : draftId ? '编辑草稿' : '写随笔'"
        >
            <form class="essay-form" @submit.prevent="saveEssay">
                <div class="essay-field">
                    <label class="essay-field-label" for="essay-title"
                        >标题<span>（可选）</span></label
                    >
                    <el-input
                        id="essay-title"
                        v-model="form.title"
                        :disabled="saving"
                        :maxlength="120"
                        placeholder="输入随笔标题"
                        clearable
                        aria-describedby="essay-title-help"
                    />
                    <p id="essay-title-help" class="essay-field-help">
                        留空时，发布后自动使用日期作为标题。
                    </p>
                </div>
                <div class="essay-field essay-time-field">
                    <label class="essay-field-label" for="essay-time"
                        >日期和时间<span>（可选）</span></label
                    >
                    <el-date-picker
                        id="essay-time"
                        v-model="form.createTime"
                        type="datetime"
                        value-format="YYYY-MM-DDTHH:mm:ss.SSS"
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="留空使用当前时间"
                        :disabled="saving"
                        clearable
                        aria-describedby="essay-time-help"
                    />
                    <p id="essay-time-help" class="essay-field-help">
                        北京时间。留空时使用发布或保存当下的时间。
                    </p>
                </div>
                <div class="essay-field essay-content-field">
                    <div class="essay-content-toolbar">
                        <label class="essay-field-label" for="essay-content"
                            >正文</label
                        >
                        <AdminButton
                            class="essay-content-fullscreen-button"
                            variant="text"
                            :disabled="saving"
                            aria-haspopup="dialog"
                            @click="openFullscreenEditor"
                            >全屏编辑</AdminButton
                        >
                    </div>
                    <textarea
                        id="essay-content"
                        ref="contentInput"
                        v-model="form.content"
                        :disabled="saving"
                        rows="12"
                        placeholder="写下今天想记录的内容…"
                        :aria-invalid="Boolean(contentError) || undefined"
                        :aria-describedby="
                            contentError ? 'essay-content-error' : undefined
                        "
                        @input="contentError = ''"
                    />
                    <p
                        v-if="contentError"
                        id="essay-content-error"
                        class="essay-content-error"
                    >
                        {{ contentError }}
                    </p>
                </div>
                <div class="essay-field essay-image-field">
                    <div class="essay-image-toolbar">
                        <span class="essay-field-label"
                            >图片<span>（可选）</span></span
                        >
                        <AdminFileButton
                            accept="image/*"
                            multiple
                            :disabled="uploading || removingImage || saving"
                            :label="uploading ? '上传中…' : '上传图片'"
                            @select="uploadImages"
                        />
                    </div>
                    <p class="essay-field-help">
                        拖动图片调整展示顺序，点击图片可放大查看。也可选中排序按钮后按左右方向键调整。
                    </p>
                    <div
                        v-if="form.images.length"
                        ref="imageList"
                        class="essay-image-list"
                        @dragover="dragOverImages"
                        @drop.prevent="finishImageDrag"
                    >
                        <div
                            v-for="(image, index) in form.images"
                            :key="image"
                            class="essay-image-item"
                            :class="{
                                'essay-image-item--dragging':
                                    draggingImage === image,
                                'essay-image-item--target':
                                    imageDropTarget === image &&
                                    draggingImage !== image,
                            }"
                            :draggable="!uploading && !removingImage && !saving"
                            @dragstart="startImageDrag($event, image)"
                            @dragenter.prevent="
                                draggingImage && (imageDropTarget = image)
                            "
                            @drop.prevent.stop="dropImage(index)"
                            @dragend="finishImageDrag"
                        >
                            <el-image
                                :src="image"
                                :preview-src-list="form.images"
                                :initial-index="index"
                                preview-teleported
                                fit="cover"
                            />
                            <div class="essay-image-actions">
                                <button
                                    type="button"
                                    class="essay-image-sort"
                                    :disabled="
                                        uploading || removingImage || saving
                                    "
                                    :aria-label="`调整第 ${index + 1} 张图片顺序，按左右方向键移动`"
                                    title="拖动排序，或按左右方向键调整"
                                    @keydown.left.prevent="
                                        reorderImage(image, index - 1)
                                    "
                                    @keydown.right.prevent="
                                        reorderImage(image, index + 1)
                                    "
                                >
                                    <span aria-hidden="true"
                                        >⠿ {{ index + 1 }}</span
                                    >
                                </button>
                                <AdminButton
                                    variant="text"
                                    :disabled="
                                        uploading || removingImage || saving
                                    "
                                    :aria-label="`移除第 ${index + 1} 张图片`"
                                    @click="removeImage(index)"
                                    @dragstart.prevent
                                    >移除</AdminButton
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div class="essay-form-actions">
                    <span class="essay-cloud-state" role="status">
                        {{
                            cloudSaveState === 'saving'
                                ? '正在保存到云端…'
                                : cloudSaveState === 'pending'
                                  ? '等待保存…'
                                  : cloudSaveState === 'saved'
                                    ? '已保存到云端'
                                    : cloudSaveState === 'error'
                                      ? '云端保存失败'
                                      : ''
                        }}
                    </span>
                    <AdminButton
                        v-if="editingId || draftId"
                        variant="text"
                        :disabled="saving || uploading || removingImage"
                        @click="resetForm"
                        >取消编辑</AdminButton
                    >
                    <AdminButton
                        variant="text"
                        :disabled="saving || uploading || removingImage"
                        @click="saveAsDraft"
                        >保存为草稿</AdminButton
                    >
                    <AdminButton
                        tone="primary"
                        type="submit"
                        :disabled="saving || uploading || removingImage"
                    >
                        {{
                            saving
                                ? '保存中…'
                                : editingId
                                  ? '保存更改'
                                  : '发布随笔'
                        }}
                    </AdminButton>
                </div>
            </form>
        </AdminCard>

        <AdminCard title="随笔草稿">
            <div class="essay-list-toolbar">
                <span>{{ drafts.length }} 篇草稿</span>
            </div>
            <p v-if="draftsLoadError" class="essay-load-error">
                草稿加载失败。<button type="button" @click="loadDrafts">
                    重试
                </button>
            </p>
            <AdminList
                v-if="!draftsLoadError"
                :items="drafts"
                :loading="draftsLoading"
                empty-text="暂无草稿"
                item-label="篇草稿"
            >
                <template #item="{ item }">
                    <AdminListItem
                        :headline="item.title || '无标题随笔'"
                        :supporting-text="item.content || '尚未填写正文'"
                        :overline="`更新于 ${formatDate(item.updatedAt)}`"
                    >
                        <template #actions>
                            <AdminActionMenu
                                :actions="draftActions"
                                @select="handleDraftAction($event, item)"
                            />
                        </template>
                    </AdminListItem>
                </template>
            </AdminList>
        </AdminCard>

        <AdminCard title="已发布的随笔">
            <div class="essay-list-toolbar">
                <span>{{ essays.length }} 篇随笔</span>
                <AdminButton variant="text" :icon="mdiPlus" @click="resetForm"
                    >写新随笔</AdminButton
                >
            </div>
            <p v-if="loadError" class="essay-load-error">
                随笔加载失败。<button type="button" @click="loadEssays">
                    重试
                </button>
            </p>
            <AdminList
                v-if="!loadError"
                :items="essays"
                :loading="loading"
                empty-text="暂无随笔"
                item-label="篇随笔"
            >
                <template #item="{ item }">
                    <AdminListItem
                        :headline="item.title"
                        :supporting-text="item.content"
                        :overline="formatDate(item.createTime)"
                    >
                        <template #actions>
                            <AdminActionMenu
                                :actions="rowActions"
                                @select="handleRowAction($event, item)"
                            />
                        </template>
                    </AdminListItem>
                </template>
            </AdminList>
        </AdminCard>

        <EssayFullscreenEditor
            v-model="form.content"
            v-model:open="fullscreenEditorOpen"
            :save-state="cloudSaveState"
            :selection="contentSelection"
            @input="contentError = ''"
        />

        <AdminConfirmDialog
            v-model="deleteDialogVisible"
            title="删除随笔"
            :message="`确定删除“${pendingDelete?.title || ''}”吗？此操作无法撤销。`"
            confirm-text="删除"
            danger
            :loading="deleting"
            @confirm="confirmDelete"
        />

        <AdminConfirmDialog
            v-model="draftDeleteDialogVisible"
            title="删除随笔草稿"
            :message="`确定删除“${pendingDraftDelete?.title || '无标题随笔'}”吗？此操作无法撤销。`"
            confirm-text="删除"
            danger
            :loading="deleting"
            @confirm="confirmDraftDelete"
        />
    </AdminPage>
</template>

<style scoped>
.essay-content-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.essay-content-toolbar .essay-content-fullscreen-button {
    display: none;
}
@media (max-width: 768px) {
    .essay-content-toolbar .essay-content-fullscreen-button {
        display: inline-flex;
    }
}
.essay-field {
    display: grid;
    gap: 8px;
    min-width: 0;
}
.essay-field-label {
    margin: 0;
    color: var(--md-sys-color-on-surface);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
}
.essay-field-label > span {
    color: var(--md-sys-color-on-surface-variant);
    font-weight: 400;
}
.essay-field-help {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12px;
    line-height: 1.5;
}
.essay-field :deep(.el-input) {
    /* Match the 48px input wrapper used by the admin theme, so the grid
       reserves its full height instead of the date picker's default 32px. */
    --el-input-height: 48px;
    height: 48px;
}
.essay-time-field :deep(.el-date-editor) {
    width: 100%;
    max-width: 360px;
}

.essay-image-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.essay-image-list {
    display: flex;
    gap: 12px;
    overflow-x: auto;
}
.essay-image-item {
    display: grid;
    flex: 0 0 140px;
    gap: 4px;
    border-radius: 12px;
    cursor: grab;
}
.essay-image-item--dragging {
    opacity: 0.45;
}
.essay-image-item--target {
    outline: 2px dashed var(--md-sys-color-primary);
    outline-offset: -2px;
}
.essay-image-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.essay-image-sort {
    min-width: 44px;
    min-height: 40px;
    padding: 0 10px;
    border: 0;
    border-radius: 8px;
    color: var(--md-sys-color-on-surface-variant);
    background: transparent;
    font: inherit;
    cursor: grab;
}
.essay-image-sort:active {
    cursor: grabbing;
}
.essay-image-sort:disabled {
    opacity: 0.38;
    cursor: not-allowed;
}
.essay-image-sort:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: -2px;
}
.essay-image-item :deep(img) {
    -webkit-user-drag: none;
    user-select: none;
}
.essay-image-item :deep(.el-image) {
    width: 140px;
    height: 120px;
    border-radius: 12px;
}

.essay-form {
    display: grid;
    max-width: 900px;
    gap: 24px;
}
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
.essay-content-field textarea:focus {
    border-color: var(--md-sys-color-primary);
}
.essay-content-field textarea[aria-invalid='true'] {
    border-color: var(--md-sys-color-error);
}
.essay-content-error {
    margin: 0;
    color: var(--md-sys-color-error);
    font-size: 13px;
}
.essay-form-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}
.essay-cloud-state {
    margin-right: auto;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12px;
}
.essay-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13px;
}
.essay-load-error {
    color: var(--md-sys-color-error);
}
.essay-load-error button {
    border: 0;
    color: var(--md-sys-color-primary);
    background: none;
    cursor: pointer;
    text-decoration: underline;
}
</style>
