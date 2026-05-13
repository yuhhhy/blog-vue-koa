import SparkMD5 from 'spark-md5'

const readChunk = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => resolve(event.target.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(blob)
    })
}

self.onmessage = async (event) => {
    const { file, chunkSize } = event.data

    if (!file) {
        self.postMessage({ type: 'error', message: '缺少文件' })
        return
    }

    try {
        const spark = new SparkMD5.ArrayBuffer()
        const totalChunks = Math.ceil(file.size / chunkSize)

        for (let index = 0; index < totalChunks; index += 1) {
            const start = index * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const chunk = file.slice(start, end)
            const buffer = await readChunk(chunk)

            spark.append(buffer)
            self.postMessage({
                type: 'progress',
                progress: Math.round(((index + 1) / totalChunks) * 100),
            })
        }

        self.postMessage({
            type: 'success',
            hash: spark.end(),
        })
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: error?.message || '文件 hash 计算失败',
        })
    }
}
