<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    CopyDocument,
    Delete,
    Document,
    Download,
    Files,
    Refresh,
    UploadFilled,
    VideoCamera,
    VideoPause,
    VideoPlay,
} from '@element-plus/icons-vue'
import {
    apiDeleteLargeFile,
    apiGetLargeFileList,
    apiGetLargeUploadStatus,
    apiMergeLargeFile,
    apiUploadLargeChunk,
    apiVerifyLargeFile,
} from '@/api/files.js'
import cfg from '@/config/index.js'

const chunkSize = 5 * 1024 * 1024
const maxFileSize = 1024 * 1024 * 1024
const allowedExtensions = ['.mp4', '.webm', '.pdf', '.zip']
const typeLabels = {
    video: '视频',
    doc: 'PDF',
    package: '压缩包',
}

const staticBase = cfg.baseApi.endsWith('/api') ? cfg.baseApi.slice(0, -4) : ''

const loading = ref(false)
const fileList = ref([])
const selectedFile = ref(null)
const selectedType = ref('all')
const uploadStatus = ref('idle')
const progress = ref(0)
const speedText = ref('0 B/s')
const hashProgress = ref(0)
const currentFileHash = ref('')
const isPaused = ref(false)
const uploadedBytes = ref(0)
const startTime = ref(0)
const abortController = ref(null)
const hashWorker = ref(null)

const filteredFiles = computed(() => {
    if (selectedType.value === 'all') return fileList.value
    return fileList.value.filter((file) => file.type === selectedType.value)
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
        ElMessage.error('仅支持 mp4、webm、pdf、zip 文件')
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

const uploadChunk = async (file, fileHash, chunkIndex, chunkTotal) => {
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

    abortController.value = new AbortController()

    await apiUploadLargeChunk(
        formData,
        (event) => {
            const currentLoaded = event.loaded || 0
            progress.value = Math.min(99, ((uploadedBytes.value + currentLoaded) / file.size) * 100)
        },
        abortController.value.signal,
    )

    uploadedBytes.value += chunk.size
    progress.value = Math.min(99, (uploadedBytes.value / file.size) * 100)
    updateSpeed()
}

const uploadChunkWithRetry = async (file, fileHash, chunkIndex, chunkTotal) => {
    let retryCount = 0

    while (retryCount < 3) {
        try {
            await uploadChunk(file, fileHash, chunkIndex, chunkTotal)
            return
        } catch (error) {
            if (isPaused.value) throw error
            retryCount += 1
            if (retryCount >= 3) throw error
        }
    }
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

        const verifyRes = await apiVerifyLargeFile({
            fileHash,
            filename: file.name,
            size: file.size,
            mime: file.type,
        })

        if (verifyRes.uploaded) {
            progress.value = 100
            uploadStatus.value = 'success'
            speedText.value = '秒传'
            ElMessage.success(`文件 "${verifyRes.file?.filename || file.name}" 秒传成功`)
            await fetchLargeFiles()
            return
        }

        const chunkTotal = Math.ceil(file.size / chunkSize)
        const statusRes = await apiGetLargeUploadStatus(fileHash)
        const uploadedSet = new Set(statusRes.uploadedChunks || [])

        uploadedBytes.value = Array.from(uploadedSet).reduce((total, index) => {
            return total + getChunkRange(index, file.size).size
        }, 0)
        progress.value = Math.min(99, (uploadedBytes.value / file.size) * 100)
        uploadStatus.value = 'uploading'

        for (let index = 0; index < chunkTotal; index += 1) {
            if (isPaused.value) {
                uploadStatus.value = 'paused'
                return
            }

            if (uploadedSet.has(index)) continue

            await uploadChunkWithRetry(file, fileHash, index, chunkTotal)
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
        abortController.value = null
    }
}

const pauseUpload = () => {
    isPaused.value = true
    abortController.value?.abort()
    uploadStatus.value = 'paused'
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
    if (type === 'doc') return Document
    return Files
}

onMounted(fetchLargeFiles)

onBeforeUnmount(() => {
    hashWorker.value?.terminate()
    abortController.value?.abort()
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
                accept=".mp4,.webm,.pdf,.zip"
                :on-change="handleFileSelected"
            >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">选择 MP4、WebM、PDF 或 ZIP 文件</div>
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
                            { label: 'PDF', value: 'doc' },
                            { label: '压缩包', value: 'package' },
                        ]"
                    />
                </div>
            </template>

            <el-table :data="filteredFiles" v-loading="loading" stripe empty-text="暂无大文件">
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
                <el-table-column prop="name" label="文件名" min-width="220" sortable />
                <el-table-column label="大小" width="120" sortable :sort-by="row => row.size">
                    <template #default="{ row }">{{ formatSize(row.size) }}</template>
                </el-table-column>
                <el-table-column label="上传时间" width="180" sortable :sort-by="row => new Date(row.uploadDate).getTime()">
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
