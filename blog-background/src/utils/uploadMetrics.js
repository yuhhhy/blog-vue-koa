export const getChunkRange = (index, totalSize, chunkSize) => {
  const start = index * chunkSize
  const end = Math.min(start + chunkSize, totalSize)

  return { start, end, size: Math.max(0, end - start) }
}

export const calculateUploadProgress = (currentProgress, loadedBytes, totalBytes, maximum = 99) => {
  if (!Number.isFinite(totalBytes) || totalBytes <= 0) return currentProgress

  const nextProgress = Math.min(maximum, (Math.max(0, loadedBytes) / totalBytes) * 100)
  return Math.max(currentProgress, nextProgress)
}

export const createUploadSpeedTracker = ({
  sampleWindow = 1500,
  now = () => performance.now(),
} = {}) => {
  let transferredBytes = 0
  let samples = []

  const reset = () => {
    transferredBytes = 0
    samples = [{ time: now(), bytes: 0 }]
  }

  const record = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return null
    if (!samples.length) reset()

    transferredBytes += bytes
    const currentTime = now()
    samples.push({ time: currentTime, bytes: transferredBytes })

    const cutoff = currentTime - sampleWindow
    while (samples.length > 2 && samples[1].time <= cutoff) {
      samples.shift()
    }

    const firstSample = samples[0]
    const elapsedSeconds = (currentTime - firstSample.time) / 1000
    if (elapsedSeconds <= 0) return null

    return (transferredBytes - firstSample.bytes) / elapsedSeconds
  }

  return { reset, record }
}
