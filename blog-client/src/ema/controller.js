import { ref } from 'vue'
export function createEmaController() {
    const regions = new Set()
    return {
        ready: ref(false), regions, runtime: null,
        register(region) { regions.add(region); return () => { regions.delete(region); this.invalidate() } },
        invalidate() { this.runtime?.invalidate() },
    }
}
