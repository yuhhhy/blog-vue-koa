<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
    mdiCloudUploadOutline,
    mdiFileDocumentOutline,
    mdiFileMultipleOutline,
    mdiHeadphones,
    mdiPause,
    mdiPlay,
    mdiVideoOutline
} from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminListSort from '@/components/admin/AdminListSort.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import AdminSegmented from '@/components/admin/AdminSegmented.vue'
import {
    apiDeleteLargeFile,
    apiGetLargeFileList,
    apiInitLargeUpload,
    apiMergeLargeFile,
    apiUploadLargeChunk,
} from '@/api/files.js'
import cfg from '@/config/index.js'

const chunkSize = 5 * 1024 * 1024
const uploadConcurrency = 6
const chunkUploadTimeout = 30 * 1000
const maxFileSize = 5 * 1024 * 1024 * 1024
const allowedExtensions = [
    '.mp4',
    '.webm',
    '.mov',
    '.mp3',
    '.wav',
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    '.zip',
    '.rar',
    '.7z',
    '.json',
    '.csv',
    '.txt',
    '.md',
]
const typeLabels = {
    video: '视频',
    audio: '音频',
    doc: '文档',
    package: '压缩包',
    data: '数据',
}

const uploadAccept = allowedExtensions.join(',')

const staticBase = cfg.baseApi.endsWith('/api') ? cfg.baseApi.slice(0, -4) : ''

const loading = ref(false)
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)
const deleting = ref(false)
const fileList = ref([])
const selectedFile = ref(null)
const selectedType = ref('all')
const sortBy = ref('upload-desc')
const uploadStatus = ref('idle')
const progress = ref(0)
const speedText = ref('0 B/s')
const hashProgress = ref(0)
const currentFileHash = ref('')
const isPaused = ref(false)
const uploadedBytes = ref(0)
const startTime = ref(0)
const uploadControllers = ref(new Set())
const hashWorker = ref(null)
const typeOptions = [
    { label: '全部', value: 'all' }, { label: '视频', value: 'video' },
    { label: '音频', value: 'audio' }, { label: '文档', value: 'doc' },
    { label: '压缩包', value: 'package' }, { label: '数据', value: 'data' },
]
const sortOptions = [
    { label: '最近上传', value: 'upload-desc' },
    { label: '最早上传', value: 'upload-asc' },
    { label: '文件名 A–Z', value: 'name-asc' },
    { label: '文件名 Z–A', value: 'name-desc' },
    { label: '文件从大到小', value: 'size-desc' },
    { label: '文件从小到大', value: 'size-asc' },
]
const rowActions = [
    { key: 'copy', label: '复制链接' },
    { key: 'download', label: '下载' },
    { key: 'delete', label: '删除', danger: true },
]

const filteredFiles = computed(() => {
    if (selectedType.value === 'all') return fileList.value
    return fileList.value.filter((file) => file.type === selectedType.value)
})

const getFileTime = (file) => {
    const time = Number(file.uploadTime ?? new Date(file.uploadDate).getTime())
    return Number.isFinite(time) ? time : 0
}

const sortedFiles = computed(() => {
    const files = [...filteredFiles.value]

    if (sortBy.value === 'name-asc') return files.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy.value === 'name-desc') return files.sort((a, b) => b.name.localeCompare(a.name))
    if (sortBy.value === 'size-asc') return files.sort((a, b) => (a.size ?? 0) - (b.size ?? 0))
    if (sortBy.value === 'size-desc') return files.sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
    if (sortBy.value === 'upload-asc') return files.sort((a, b) => getFileTime(a) - getFileTime(b))
    return files.sort((a, b) => getFileTime(b) - getFileTime(a))
})

const uploadStatusText = computed(() => {
    const statusMap = {
        idle: '等待选择',
        hashing: '计算指纹',
        uploading: '上传中',
        paused: '已暂停',
        merging: '合并中',
        success: '上传完成',
        error: '上传失败',
    }

    return statusMap[uploadStatus.value] || '等待选择'
})

const canUpload = computed(() => selectedFile.value && ['idle', 'paused', 'error', 'success'].includes(uploadStatus.value))
const canPause = computed(() => uploadStatus.value === 'uploading')

const encodeUrlPath = (url) => {
    return url
        .split('/')
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join('/')
}

const resolveFileUrl = (url) => {
    if (/^https?:\/\//.test(url)) return url

    const base = staticBase || window.location.origin
    return `${base}${encodeUrlPath(url)}`
}

const resolveDownloadUrl = (row) => {
    const base = staticBase || window.location.origin
    return `${base}/download${encodeUrlPath(row.url)}`
}

const fetchLargeFiles = async () => {
    loading.value = true
    try {
        const res = await apiGetLargeFileList()
        fileList.value = res.data || []
    } catch (error) {
        ElMessage.error('获取文件列表失败')
    } finally {
        loading.value = false
    }
}

const getExtension = (filename) => {
    const index = filename.lastIndexOf('.')
    return index >= 0 ? filename.slice(index).toLowerCase() : ''
}

const validateFile = (file) => {
    if (!file) return false

    if (file.size > maxFileSize) {
        ElMessage.error('单个文件不能超过 5GB')
        return false
    }

    if (!allowedExtensions.includes(getExtension(file.name))) {
        ElMessage.error('不支持该文件类型')
        return false
    }

    return true
}

const handleFileSelected = (uploadFile) => {
    const file = uploadFile.raw

    if (!validateFile(file)) return

    selectedFile.value = file
    currentFileHash.value = ''
    progress.value = 0
    speedText.value = '0 B/s'
    hashProgress.value = 0
    uploadedBytes.value = 0
    uploadStatus.value = 'idle'
    isPaused.value = false
}
const handleRowAction = (action, row) => {
    if (action === 'copy') handleCopyUrl(row)
    if (action === 'download') handleDownload(row)
    if (action === 'delete') handleDelete(row)
}

const calculateHash = async (file) => {
    hashWorker.value?.terminate()
    hashProgress.value = 0

    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./hashWorker.js', import.meta.url), {
            type: 'module',
        })

        hashWorker.value = worker

        worker.onmessage = (event) => {
            const { type, progress: nextProgress, hash, message } = event.data

            if (type === 'progress') {
                hashProgress.value = nextProgress
                return
            }

            worker.terminate()
            hashWorker.value = null

            if (type === 'success') {
                hashProgress.value = 100
                resolve(hash)
                return
            }

            reject(new Error(message || '文件 hash 计算失败'))
        }

        worker.onerror = (error) => {
            worker.terminate()
            hashWorker.value = null
            reject(error)
        }

        worker.postMessage({
            file,
            chunkSize,
        })
    })
}

const getChunkRange = (index, totalSize) => {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, totalSize)

    return { start, end, size: end - start }
}

const updateUploadProgress = (loadedBytes, totalBytes) => {
    const nextProgress = Math.min(99, (loadedBytes / totalBytes) * 100)
    progress.value = Math.max(progress.value, nextProgress)
}

const updateSpeed = () => {
    const elapsedSeconds = Math.max((Date.now() - startTime.value) / 1000, 1)
    speedText.value = `${formatSize(uploadedBytes.value / elapsedSeconds)}/s`
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const getUploadErrorStatus = (error) => error?.response?.status || error?.status

const isRetryableUploadError = (error) => {
    if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        return !isPaused.value
    }

    const status = getUploadErrorStatus(error)

    if (!status) return true
    if (status === 429) return true
    if (status >= 500) return true

    return false
}

const getRetryDelay = (retryCount) => {
    const baseDelay = 1000
    const jitter = 1 + Math.random() * 0.3

    return baseDelay * 2 ** retryCount * jitter
}

const uploadChunk = async (file, fileHash, chunkIndex, chunkTotal, onChunkProgress) => {
    const { start, end } = getChunkRange(chunkIndex, file.size)
    const chunk = file.slice(start, end, file.type)
    const formData = new FormData()

    formData.append('fileHash', fileHash)
    formData.append('chunkIndex', String(chunkIndex))
    formData.append('chunkTotal', String(chunkTotal))
    formData.append('filename', file.name)
    formData.append('size', String(file.size))
    formData.append('mime', file.type)
    formData.append('file', chunk, file.name)

    const controller = new AbortController()
    uploadControllers.value.add(controller)
    const timeoutTimer = setTimeout(() => {
        controller.abort()
    }, chunkUploadTimeout)

    try {
        await apiUploadLargeChunk(
            formData,
            (event) => {
                onChunkProgress?.(chunkIndex, event.loaded || 0)
            },
            controller.signal,
        )
    } finally {
        clearTimeout(timeoutTimer)
        uploadControllers.value.delete(controller)
    }

    uploadedBytes.value += chunk.size
    updateSpeed()
}

const uploadChunkWithRetry = async (file, fileHash, chunkIndex, chunkTotal, onChunkProgress) => {
    let retryCount = 0

    while (retryCount < 5) {
        try {
            await uploadChunk(file, fileHash, chunkIndex, chunkTotal, onChunkProgress)
            return
        } catch (error) {
            if (isPaused.value) throw error
            if (!isRetryableUploadError(error)) throw error

            retryCount += 1
            if (retryCount >= 5) throw error

            await sleep(getRetryDelay(retryCount - 1))
        }
    }
}

const uploadAllChunks = async (chunks, file, fileHash, chunkTotal) => {
    let pointer = 0
    let failed = null
    const activeChunkLoaded = new Map()
    const onChunkProgress = (chunkIndex, loaded) => {
        activeChunkLoaded.set(chunkIndex, loaded)
        const activeLoaded = Array.from(activeChunkLoaded.values()).reduce((total, size) => total + size, 0)
        updateUploadProgress(uploadedBytes.value + activeLoaded, file.size)
    }

    const worker = async () => {
        while (!failed && !isPaused.value) {
            const chunkIndex = chunks[pointer]
            pointer += 1

            if (chunkIndex === undefined) return

            try {
                await uploadChunkWithRetry(file, fileHash, chunkIndex, chunkTotal, onChunkProgress)
                activeChunkLoaded.delete(chunkIndex)
                updateUploadProgress(uploadedBytes.value, file.size)
            } catch (error) {
                activeChunkLoaded.delete(chunkIndex)
                failed = error
                throw error
            }
        }
    }

    const workers = Array.from(
        { length: Math.min(uploadConcurrency, chunks.length) },
        () => worker(),
    )

    await Promise.all(workers)

    if (failed) throw failed
}

const startUpload = async () => {
    const file = selectedFile.value
    if (!validateFile(file)) return

    try {
        isPaused.value = false
        startTime.value = Date.now()
        uploadStatus.value = currentFileHash.value ? 'uploading' : 'hashing'

        const fileHash = currentFileHash.value || await calculateHash(file)
        currentFileHash.value = fileHash
        progress.value = 0
        const chunkTotal = Math.ceil(file.size / chunkSize)

        const initRes = await apiInitLargeUpload({
            fileHash,
            filename: file.name,
            size: file.size,
            mime: file.type,
            chunkTotal,
        })

        if (initRes.exists || initRes.uploaded) {
            progress.value = 100
            uploadStatus.value = 'success'
            speedText.value = '秒传'
            ElMessage.success(`文件 "${initRes.file?.filename || file.name}" 秒传成功`)
            await fetchLargeFiles()
            return
        }

        const uploadedSet = new Set(initRes.uploadedIndices || initRes.uploadedChunks || [])

        uploadedBytes.value = Array.from(uploadedSet).reduce((total, index) => {
            return total + getChunkRange(index, file.size).size
        }, 0)
        progress.value = Math.min(99, (uploadedBytes.value / file.size) * 100)
        uploadStatus.value = 'uploading'

        const pendingChunks = []

        for (let index = 0; index < chunkTotal; index += 1) {
            if (!uploadedSet.has(index)) pendingChunks.push(index)
        }

        await uploadAllChunks(pendingChunks, file, fileHash, chunkTotal)

        if (isPaused.value) {
            uploadStatus.value = 'paused'
            return
        }

        uploadStatus.value = 'merging'
        const res = await apiMergeLargeFile({
            fileHash,
            chunkTotal,
            filename: file.name,
            size: file.size,
            mime: file.type,
        })

        progress.value = 100
        uploadStatus.value = 'success'
        ElMessage.success(`文件 "${res.filename}" 上传完成`)
        await fetchLargeFiles()
    } catch (error) {
        if (isPaused.value) {
            uploadStatus.value = 'paused'
            return
        }

        uploadStatus.value = 'error'
        ElMessage.error(error?.response?.data?.message || '文件上传失败')
    } finally {
        uploadControllers.value.clear()
    }
}

const pauseUpload = () => {
    isPaused.value = true
    uploadControllers.value.forEach((controller) => controller.abort())
    uploadControllers.value.clear()
    uploadStatus.value = 'paused'
    ElMessage.info('上传已暂停')
}

const handleDelete = (row) => {
    pendingDelete.value = row
    deleteDialogVisible.value = true
}

const confirmDelete = async () => {
    if (!pendingDelete.value || deleting.value) return
    deleting.value = true
    try {
        await apiDeleteLargeFile(pendingDelete.value.type, pendingDelete.value.name)
        await fetchLargeFiles()
        deleteDialogVisible.value = false
        pendingDelete.value = null
        ElMessage.success('文件删除成功')
    } finally {
        deleting.value = false
    }
}

const handleDownload = (row) => {
    const link = document.createElement('a')

    link.href = resolveDownloadUrl(row)
    link.download = row.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success(`已交给浏览器下载 "${row.name}"`)
}

const handleCopyUrl = async (row) => {
    await navigator.clipboard.writeText(resolveFileUrl(row.url))
    ElMessage.success('访问地址已复制')
}

const formatSize = (size) => {
    if (!size || size <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
    return `${(size / Math.pow(1024, index)).toFixed(2)} ${units[index]}`
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString))
}

const getTypeIcon = (type) => {
    if (type === 'video') return mdiVideoOutline
    if (type === 'audio') return mdiHeadphones
    if (type === 'doc') return mdiFileDocumentOutline
    return mdiFileMultipleOutline
}

onMounted(fetchLargeFiles)

onBeforeUnmount(() => {
    hashWorker.value?.terminate()
    uploadControllers.value.forEach((controller) => controller.abort())
    uploadControllers.value.clear()
})
</script>

<template>
    <AdminPage class="large-file-page">
        <AdminCard title="文件上传（支持大文件）">
            <el-upload
                class="large-file-upload"
                drag
                :auto-upload="false"
                :show-file-list="false"
                :accept="uploadAccept"
                :on-change="handleFileSelected"
            >
                <MaterialIcon class="el-icon--upload" :path="mdiCloudUploadOutline" />
                <div class="el-upload__text">选择视频、音频、文档、压缩包或数据文件</div>
            </el-upload>

            <div v-if="selectedFile" class="upload-panel">
                <div class="file-summary">
                    <div>
                        <div class="file-name">{{ selectedFile.name }}</div>
                        <div class="file-meta">
                            {{ formatSize(selectedFile.size) }} · {{ uploadStatusText }}
                            <span v-if="uploadStatus === 'hashing'"> · {{ hashProgress }}%</span>
                            <span v-else> · {{ speedText }}</span>
                        </div>
                    </div>
                    <div class="upload-actions">
                        <AdminButton
                            v-if="canPause"
                            :icon="mdiPause"
                            @click="pauseUpload"
                        >暂停</AdminButton>
                        <AdminButton
                            tone="primary"
                            :icon="uploadStatus === 'paused' ? mdiPlay : mdiCloudUploadOutline"
                            :disabled="!canUpload"
                            @click="startUpload"
                        >{{ uploadStatus === 'paused' ? '继续' : '开始上传' }}</AdminButton>
                    </div>
                </div>
                <v-progress-linear :model-value="Number(progress.toFixed(1))" :color="uploadStatus === 'error' ? 'error' : 'primary'" height="10" rounded />
            </div>
        </AdminCard>

        <AdminCard title="文件列表">
            <div class="list-toolbar">
                <span>{{ sortedFiles.length }} 个文件</span>
                <div class="list-toolbar__actions">
                    <AdminSegmented v-model="selectedType" :options="typeOptions" label="文件类型筛选" appearance="pill" />
                    <AdminListSort v-model="sortBy" :options="sortOptions" />
                </div>
            </div>
            <AdminList :items="sortedFiles" item-key="name" :loading="loading" empty-text="暂无文件">
                <template #item="{ item }">
                    <AdminListItem
                        :headline="item.name"
                        :supporting-text="`${formatSize(item.size)} · ${formatDate(item.uploadDate)}`"
                    >
                        <template #leading><MaterialIcon class="file-type-icon" :path="getTypeIcon(item.type)" /></template>
                        <template #overline><AdminListLabel>{{ typeLabels[item.type] || '文件' }}</AdminListLabel></template>
                        <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
                    </AdminListItem>
                </template>
            </AdminList>
        </AdminCard>
    </AdminPage>
    <AdminConfirmDialog
        v-model="deleteDialogVisible"
        title="删除文件"
        :message="`确定删除“${pendingDelete?.name || ''}”吗？此操作无法撤销。`"
        confirm-text="删除"
        danger
        :loading="deleting"
        @confirm="confirmDelete"
    />
</template>

<style scoped>
.upload-panel {
    margin-top: 16px;
}

.large-file-upload { width: 100%; }
.large-file-upload :deep(.el-upload) { width: 100%; }
.large-file-upload :deep(.el-upload-dragger) {
    display: grid;
    min-height: 210px;
    place-content: center;
    place-items: center;
    gap: 16px;
    border: 2px dashed var(--md-sys-color-outline-variant);
    background: var(--md-sys-color-surface-container);
}
.large-file-upload :deep(.el-icon--upload) {
    width: 64px;
    height: 64px;
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
}
.large-file-upload :deep(.el-upload__text) { max-width: 100%; text-align: center; }
.large-file-upload :deep(.el-upload-dragger:hover),
.large-file-upload :deep(.el-upload-dragger.is-dragover) {
    border-color: var(--md-sys-color-primary);
    background: var(--md-sys-color-primary-container);
}

.file-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
}

.file-name {
    max-width: 520px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-meta {
    margin-top: 4px;
    color: var(--admin-text-muted);
    font-size: 13px;
}

.upload-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.list-toolbar { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.list-toolbar__actions { display: flex; min-width: 0; align-items: center; gap: 8px; }
.file-type-icon { width: 28px; height: 28px; }

@media (max-width: 768px) {
    .file-summary {
        align-items: stretch;
        flex-direction: column;
    }

    .file-name {
        max-width: 100%;
    }

    .list-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }

    .list-toolbar__actions {
        width: 100%;
        flex-wrap: wrap;
    }

    .upload-actions {
        flex-wrap: wrap;
    }

    .large-file-upload :deep(.el-upload-dragger) {
        min-height: 180px;
        padding-inline: 16px;
    }
}
</style>
