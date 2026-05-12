import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '..', '..', 'public')
const uploadRootDir = path.join(publicDir, 'uploads')
const tmpDir = path.join(uploadRootDir, 'tmp')

const maxFileSize = 1024 * 1024 * 1024

const typeConfig = {
    video: {
        dir: path.join(uploadRootDir, 'videos'),
        urlPrefix: '/uploads/videos',
        extensions: ['.mp4', '.webm'],
        mimes: ['video/mp4', 'video/webm'],
    },
    doc: {
        dir: path.join(uploadRootDir, 'docs'),
        urlPrefix: '/uploads/docs',
        extensions: ['.pdf'],
        mimes: ['application/pdf'],
    },
    package: {
        dir: path.join(uploadRootDir, 'packages'),
        urlPrefix: '/uploads/packages',
        extensions: ['.zip'],
        mimes: [
            'application/zip',
            'application/x-zip-compressed',
            'multipart/x-zip',
            'application/octet-stream',
        ],
    },
}

const ensureDir = async (dir) => {
    await fsp.mkdir(dir, { recursive: true })
}

const isSafeHash = (fileHash) => /^[a-fA-F0-9]{32,64}$/.test(fileHash || '')

const toInteger = (value) => {
    const number = Number(value)
    return Number.isInteger(number) ? number : null
}

const sanitizeFilename = (filename) => {
    const basename = path.basename(filename || '')
    return basename.replace(/[\\/:*?"<>|]/g, '_').trim()
}

const getFileConfig = (filename, mime = '') => {
    const ext = path.extname(filename || '').toLowerCase()

    for (const [type, config] of Object.entries(typeConfig)) {
        const extensionMatched = config.extensions.includes(ext)
        const mimeMatched = !mime || config.mimes.includes(mime)

        if (extensionMatched && mimeMatched) {
            return { type, config, ext }
        }
    }

    return null
}

const buildStoredFilename = (filename, fileHash) => {
    const safeName = sanitizeFilename(filename)
    const ext = path.extname(safeName).toLowerCase()
    const name = path.basename(safeName, ext) || 'file'

    return `${name}-${fileHash.slice(0, 8)}${ext}`
}

const safeJoin = (dir, filename) => {
    const targetPath = path.join(dir, filename)
    const relative = path.relative(dir, targetPath)

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return null
    }

    return targetPath
}

const listChunkIndexes = async (fileHash) => {
    const chunkDir = path.join(tmpDir, fileHash)

    try {
        const files = await fsp.readdir(chunkDir)
        return files
            .map((file) => {
                const match = file.match(/^(\d+)\.part$/)
                return match ? Number(match[1]) : null
            })
            .filter((index) => Number.isInteger(index))
            .sort((a, b) => a - b)
    } catch (error) {
        if (error.code === 'ENOENT') return []
        throw error
    }
}

export const uploadLargeChunk = async (ctx) => {
    const file = ctx.request.file
    const { fileHash, chunkIndex, chunkTotal, filename, size, mime } = ctx.request.body
    const currentChunkIndex = toInteger(chunkIndex)
    const totalChunks = toInteger(chunkTotal)
    const fileSize = Number(size)
    const safeName = sanitizeFilename(filename)
    const fileConfig = getFileConfig(safeName, mime || file?.mimetype)

    if (!file) {
        ctx.status = 400
        ctx.body = { success: false, message: '缺少上传分片' }
        return
    }

    if (!isSafeHash(fileHash) || currentChunkIndex === null || totalChunks === null) {
        ctx.status = 400
        ctx.body = { success: false, message: '分片参数不合法' }
        return
    }

    if (currentChunkIndex < 0 || totalChunks <= 0 || currentChunkIndex >= totalChunks) {
        ctx.status = 400
        ctx.body = { success: false, message: '分片序号不合法' }
        return
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxFileSize) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件大小超出限制' }
        return
    }

    if (!fileConfig) {
        ctx.status = 400
        ctx.body = { success: false, message: '不支持的文件类型' }
        return
    }

    const chunkDir = path.join(tmpDir, fileHash)
    const chunkPath = safeJoin(chunkDir, `${currentChunkIndex}.part`)

    if (!chunkPath) {
        ctx.status = 400
        ctx.body = { success: false, message: '分片路径不合法' }
        return
    }

    await ensureDir(chunkDir)
    await fsp.writeFile(chunkPath, file.buffer)

    ctx.body = {
        success: true,
        chunkIndex: currentChunkIndex,
    }
}

export const getLargeUploadStatus = async (ctx) => {
    const { fileHash } = ctx.query

    if (!isSafeHash(fileHash)) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件 hash 不合法' }
        return
    }

    const uploadedChunks = await listChunkIndexes(fileHash)
    ctx.body = {
        success: true,
        uploadedChunks,
    }
}

export const mergeLargeFile = async (ctx) => {
    const { fileHash, chunkTotal, filename, size, mime } = ctx.request.body
    const totalChunks = toInteger(chunkTotal)
    const fileSize = Number(size)
    const safeName = sanitizeFilename(filename)
    const fileConfig = getFileConfig(safeName, mime)

    if (!isSafeHash(fileHash) || totalChunks === null || totalChunks <= 0) {
        ctx.status = 400
        ctx.body = { success: false, message: '合并参数不合法' }
        return
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxFileSize) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件大小超出限制' }
        return
    }

    if (!fileConfig) {
        ctx.status = 400
        ctx.body = { success: false, message: '不支持的文件类型' }
        return
    }

    const uploadedChunks = await listChunkIndexes(fileHash)
    const uploadedSet = new Set(uploadedChunks)

    for (let index = 0; index < totalChunks; index += 1) {
        if (!uploadedSet.has(index)) {
            ctx.status = 400
            ctx.body = { success: false, message: `缺少第 ${index} 个分片` }
            return
        }
    }

    await ensureDir(fileConfig.config.dir)

    const storedFilename = buildStoredFilename(safeName, fileHash)
    const finalPath = safeJoin(fileConfig.config.dir, storedFilename)

    if (!finalPath) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件路径不合法' }
        return
    }

    await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(finalPath)

        writeStream.on('error', reject)
        writeStream.on('finish', resolve)

        const appendChunk = (index) => {
            if (index >= totalChunks) {
                writeStream.end()
                return
            }

            const chunkPath = path.join(tmpDir, fileHash, `${index}.part`)
            const readStream = fs.createReadStream(chunkPath)

            readStream.on('error', reject)
            readStream.on('end', () => appendChunk(index + 1))
            readStream.pipe(writeStream, { end: false })
        }

        appendChunk(0)
    })

    const stats = await fsp.stat(finalPath)

    if (stats.size !== fileSize) {
        await fsp.unlink(finalPath)
        ctx.status = 400
        ctx.body = { success: false, message: '合并后文件大小不一致' }
        return
    }

    await fsp.rm(path.join(tmpDir, fileHash), { recursive: true, force: true })

    ctx.body = {
        success: true,
        type: fileConfig.type,
        filename: storedFilename,
        url: `${fileConfig.config.urlPrefix}/${storedFilename}`,
        size: stats.size,
        uploadDate: stats.birthtime,
    }
}

export const getLargeFiles = async (ctx) => {
    const fileList = []

    for (const [type, config] of Object.entries(typeConfig)) {
        await ensureDir(config.dir)
        const files = await fsp.readdir(config.dir)

        for (const file of files) {
            const filePath = path.join(config.dir, file)
            const stats = await fsp.stat(filePath)

            if (stats.isFile()) {
                fileList.push({
                    type,
                    name: file,
                    url: `${config.urlPrefix}/${file}`,
                    size: stats.size,
                    uploadDate: stats.birthtime,
                })
            }
        }
    }

    fileList.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    ctx.body = { success: true, data: fileList }
}

export const deleteLargeFile = async (ctx) => {
    const { type, filename } = ctx.params
    const config = typeConfig[type]

    if (!config) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件类型不合法' }
        return
    }

    const safeName = sanitizeFilename(filename)
    const filePath = safeJoin(config.dir, safeName)

    if (!filePath) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件路径不合法' }
        return
    }

    try {
        await fsp.unlink(filePath)
        ctx.body = { success: true, message: '删除成功' }
    } catch (error) {
        ctx.status = error.code === 'ENOENT' ? 404 : 500
        ctx.body = {
            success: false,
            message: error.code === 'ENOENT' ? '文件不存在' : '删除失败',
        }
    }
}

export const downloadLargeFile = async (ctx) => {
    const { type, filename } = ctx.params
    const config = typeConfig[type]

    if (!config) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件类型不合法' }
        return
    }

    const safeName = sanitizeFilename(filename)
    const filePath = safeJoin(config.dir, safeName)

    if (!filePath) {
        ctx.status = 400
        ctx.body = { success: false, message: '文件路径不合法' }
        return
    }

    try {
        const stats = await fsp.stat(filePath)
        ctx.attachment(safeName)
        ctx.length = stats.size
        ctx.type = path.extname(safeName)
        ctx.body = fs.createReadStream(filePath)
    } catch (error) {
        ctx.status = error.code === 'ENOENT' ? 404 : 500
        ctx.body = {
            success: false,
            message: error.code === 'ENOENT' ? '文件不存在' : '下载失败',
        }
    }
}
