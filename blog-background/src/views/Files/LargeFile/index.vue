<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    CopyDocument,
    Delete,
    Document,
    Download,
    Files,
    Headset,
    Refresh,
    UploadFilled,
    VideoCamera,
    VideoPause,
    VideoPlay,
} from '@element-plus/icons-vue'
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
const maxFileSize = 1024 * 1024 * 1024
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
const fileList = ref([])
const selectedFile = ref(null)
const selectedType = ref('all')
const sortState = ref({
    prop: 'uploadTime',
    order: 'descending',
})
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
    const { prop, order } = sortState.value

    if (!prop || !order) return files

    const direction = order === 'ascending' ? 1 : -1

    return files.sort((a, b) => {
        if (prop === 'name') {
            return a.name.localeCompare(b.name) * direction
        }

        if (prop === 'size') {
            return ((a.size ?? 0) - (b.size ?? 0)) * direction
        }

        return (getFileTime(a) - getFileTime(b)) * direction
    })
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
        ElMessage.error('获取大文件列表失败')
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
        ElMessage.error('单个文件不能超过 1GB')
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
                progress.value = Math.min(99, nextProgress)
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
    progress.value = Math.min(99, (uploadedBytes.value / file.size) * 100)
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
        progress.value = Math.min(99, ((uploadedBytes.value + activeLoaded) / file.size) * 100)
    }

    const worker = async () => {
        while (!failed && !isPaused.value) {
            const chunkIndex = chunks[pointer]
            pointer += 1

            if (chunkIndex === undefined) return

            try {
                await uploadChunkWithRetry(file, fileHash, chunkIndex, chunkTotal, onChunkProgress)
                activeChunkLoaded.delete(chunkIndex)
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
        ElMessage.error(error?.response?.data?.message || '大文件上传失败')
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
    ElMessageBox.confirm(`确定要删除文件 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await apiDeleteLargeFile(row.type, row.name)
        await fetchLargeFiles()
        ElMessage.success('文件删除成功')
    }).catch(() => {})
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

const handleSortChange = ({ prop, order }) => {
    sortState.value = {
        prop,
        order,
    }
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
    if (type === 'video') return VideoCamera
    if (type === 'audio') return Headset
    if (type === 'doc') return Document
    return Files
}

onMounted(fetchLargeFiles)

onBeforeUnmount(() => {
    hashWorker.value?.terminate()
    uploadControllers.value.forEach((controller) => controller.abort())
    uploadControllers.value.clear()
})
</script>

<template>
    <div class="large-file-page">
        <el-card class="mb-4">
            <template #header>
                <div class="flex justify-between items-center">
                    <span>大文件上传</span>
                    <el-button :icon="Refresh" @click="fetchLargeFiles">刷新列表</el-button>
                </div>
            </template>

            <el-upload
                drag
                :auto-upload="false"
                :show-file-list="false"
                :accept="uploadAccept"
                :on-change="handleFileSelected"
            >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
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
                        <el-button
                            v-if="canPause"
                            :icon="VideoPause"
                            @click="pauseUpload"
                        >
                            暂停
                        </el-button>
                        <el-button
                            type="primary"
                            :icon="uploadStatus === 'paused' ? VideoPlay : UploadFilled"
                            :disabled="!canUpload"
                            @click="startUpload"
                        >
                            {{ uploadStatus === 'paused' ? '继续' : '开始上传' }}
                        </el-button>
                    </div>
                </div>
                <el-progress :percentage="Number(progress.toFixed(1))" :status="uploadStatus === 'error' ? 'exception' : undefined" />
            </div>
        </el-card>

        <el-card>
            <template #header>
                <div class="flex justify-between items-center">
                    <span>大文件管理</span>
                    <el-segmented
                        v-model="selectedType"
                        :options="[
                            { label: '全部', value: 'all' },
                            { label: '视频', value: 'video' },
                            { label: '音频', value: 'audio' },
                            { label: '文档', value: 'doc' },
                            { label: '压缩包', value: 'package' },
                            { label: '数据', value: 'data' },
                        ]"
                    />
                </div>
            </template>

            <el-table
                :data="sortedFiles"
                v-loading="loading"
                stripe
                empty-text="暂无大文件"
                :default-sort="{ prop: 'uploadTime', order: 'descending' }"
                @sort-change="handleSortChange"
            >
                <el-table-column label="类型" width="110">
                    <template #default="{ row }">
                        <el-tag>
                            <el-icon class="type-icon">
                                <component :is="getTypeIcon(row.type)" />
                            </el-icon>
                            {{ typeLabels[row.type] }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="文件名" min-width="220" sortable="custom" />
                <el-table-column prop="size" label="大小" width="120" sortable="custom">
                    <template #default="{ row }">{{ formatSize(row.size) }}</template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="180" sortable="custom">
                    <template #default="{ row }">{{ formatDate(row.uploadDate) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="260" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" :icon="CopyDocument" @click="handleCopyUrl(row)">复制</el-button>
                        <el-button size="small" :icon="Download" @click="handleDownload(row)">下载</el-button>
                        <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<style scoped>
.large-file-page {
    padding-bottom: 24px;
}

.upload-panel {
    margin-top: 16px;
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
    color: #64748b;
    font-size: 13px;
}

.upload-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.type-icon {
    margin-right: 4px;
    vertical-align: -2px;
}

@media (max-width: 768px) {
    .file-summary {
        align-items: stretch;
        flex-direction: column;
    }

    .file-name {
        max-width: 100%;
    }
}
</style>
