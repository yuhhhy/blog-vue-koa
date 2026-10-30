export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
export const TOUCH_DRAG_DELAY = 160
export const TOUCH_MOVE_TOLERANCE = 12
export const linkKey = (link) => String(link.id || link.site)
export const safeSite = (site) => {
    try {
        const url = new URL(site)
        return ['https:', 'http:'].includes(url.protocol) ? url.href : null
    } catch { return null }
}
export const columnsForWidth = (width) => width >= 800 ? 3 : width >= 520 ? 2 : 1

// A handoff / reflow is a new reference frame, not a physical acceleration.
export const createMotionSampler = () => {
    let previous
    return {
        reset() { previous = undefined },
        sample(x, y, time, owner) {
            const last = previous
            previous = { x, y, time, owner, vx: 0, vy: 0 }
            const dt = last ? (time - last.time) / 1000 : 0
            if (!last || last.owner !== owner || dt <= 0 || dt > .1
                || Math.abs(x - last.x) > 180 || Math.abs(y - last.y) > 180) return { x: 0, y: 0 }
            const vx = (x - last.x) / dt
            const vy = (y - last.y) / dt
            previous.vx = vx; previous.vy = vy
            return {
                x: clamp((vx - last.vx) / dt / 16000, -1, 1),
                y: clamp((vy - last.vy) / dt / 16000, -1, 1),
            }
        },
    }
}

export const createGesture = (x, y, touch) => ({ x, y, touch, moved: false, dragging: false, cancelled: false })
export const moveGesture = (gesture, x, y) => {
    if (Math.hypot(x - gesture.x, y - gesture.y) > TOUCH_MOVE_TOLERANCE) {
        gesture.moved = true
        if (gesture.touch && !gesture.dragging) gesture.cancelled = true
    }
    return gesture
}
export const canVisit = (gesture) => !gesture.moved && !gesture.dragging && !gesture.cancelled
