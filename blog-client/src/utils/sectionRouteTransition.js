export const sectionByRouteName = {
    About: 'about',
    Essays: 'essays',
    Archive: 'archive',
}

// Only confirmed routes start visual work. A renderer never commits navigation.
// One signal owns every asynchronous step, including the final page handoff.
export const createSectionTransitionController = (render, onError = console.error) => {
    let current

    const cancel = () => {
        current?.abort()
        current = null
    }

    return {
        cancel,
        async run(target, source) {
            cancel()
            const request = new AbortController()
            current = request
            try {
                await render(target, source, request.signal)
                return !request.signal.aborted
            } catch (error) {
                if (request.signal.aborted) return false
                onError(error)
                return false
            } finally {
                if (current === request) current = null
            }
        },
    }
}

export const waitForVisualWork = (work, signal) => new Promise((resolve, reject) => {
    if (signal.aborted) {
        reject(signal.reason)
        return
    }
    const abort = () => {
        signal.removeEventListener('abort', abort)
        reject(signal.reason)
    }
    signal.addEventListener('abort', abort, { once: true })
    Promise.resolve(work).then(
        (result) => {
            signal.removeEventListener('abort', abort)
            if (signal.aborted) reject(signal.reason)
            else resolve(result)
        },
        (error) => {
            signal.removeEventListener('abort', abort)
            reject(error)
        },
    )
})
