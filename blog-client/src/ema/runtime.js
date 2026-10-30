import * as THREE from 'three'
import { standingLeg } from './cordPath.js'
import { boardKnotPath, nailKnotPath } from './knots.js'
import { EMA } from './model.js'
import { BraidedCord } from './BraidedCord.js'
import { createMaterials } from './materials.js'
import { createPhysics, STEP } from './physics.js'
import { clamp, linkKey, safeSite, createMotionSampler, createGesture, moveGesture, canVisit, TOUCH_DRAG_DELAY } from './interaction.js'

export async function createEmaRuntime(canvas, controller) {
    let renderer, materials, physics
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'default' })
        materials = await createMaterials()
        physics = await createPhysics()
    } catch (error) {
        renderer?.dispose(); materials?.dispose(); physics?.dispose()
        throw error
    }
    renderer.setClearColor(0, 0)
    renderer.autoClear = false
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const rows = new Map(), records = new Map()
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2()
    const sampler = createMotionSampler()
    const abort = new AbortController()
    const listen = (target, name, fn, options = {}) => target.addEventListener(name, fn, { ...options, signal: abort.signal })
    let owner = null, disposed = false, lost = false, raf = 0, last = 0, accumulator = 0, nextSlot = 0
    let views = [], gesture = null, longPress = 0, activeHit = null, dragZ = 0, lastPointer = null
    let oldOverflow = '', oldOverscroll = '', draggingScroll = false
    let width = 0, height = 0, ratio = Math.min(devicePixelRatio, 1.75), slowFrames = 0, frameCount = 0
    let restorationAttempts = 0, restoreTimer
    let settleUntil = 0, captureTarget = null, captureId = null
    const endGesture = () => {
        clearTimeout(longPress); physics.endDrag()
        if (captureTarget?.hasPointerCapture?.(captureId)) captureTarget.releasePointerCapture(captureId)
        captureTarget = null; captureId = null
        settleUntil = performance.now() + 5000
        if (draggingScroll) {
            document.documentElement.style.overflow = oldOverflow
            document.documentElement.style.overscrollBehavior = oldOverscroll
            draggingScroll = false
        }
        gesture = null; activeHit = null
    }
    const invalidate = () => { sampler.reset(); last = 0; accumulator = 0; endGesture() }
    const makeRow = (key) => {
        const scene = new THREE.Scene()
        scene.add(new THREE.HemisphereLight('#fffdf8', '#b5a693', 1.6))
        const light = new THREE.DirectionalLight('#fffaf2', 2.2)
        light.position.set(-3, 5, 8); light.castShadow = true
        light.shadow.mapSize.set(1024, 1024)
        Object.assign(light.shadow.camera, { left: -6, right: 6, top: 4, bottom: -4, near: .1, far: 20 })
        light.shadow.bias = -.001; light.shadow.normalBias = .025
        scene.add(light)
        const rail = new THREE.Mesh(materials.railGeometry, materials.rail)
        rail.position.set(0, EMA.nailY, -.14); rail.castShadow = true; rail.receiveShadow = true; scene.add(rail)
        const shadowGeometry = new THREE.PlaneGeometry(22, 10)
        const shadowMaterial = new THREE.ShadowMaterial({ opacity: .13 })
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial); shadow.position.set(0, -.5, -.6); shadow.receiveShadow = true; scene.add(shadow)
        const camera = new THREE.PerspectiveCamera(24, 1, .1, 30)
        camera.position.set(0, .08, 8.8)
        camera.lookAt(0, -.02, 0)
        const row = { key, scene, light, rail, camera, offset: -nextSlot++ * 12, items: [], shadowGeometry, shadowMaterial }
        rows.set(key, row)
        return row
    }
    const updateFront = (record, link) => {
        const signature = JSON.stringify([link.name, link.description, link.avatar, link.category])
        if (record.signature === signature) return
        record.signature = signature; record.loaded = false
        materials.front(link).then((material) => {
            if (!material) return
            if (disposed || records.get(record.key) !== record || record.signature !== signature) { materials.releaseFront(material); return }
            if (record.front.material !== materials.wood) materials.releaseFront(record.front.material)
            record.front.material = material; record.loaded = true
        }).catch((error) => { console.warn('绘马印绘生成失败', error); record.loaded = false })
    }
    const addRecord = (link, row, x) => {
        const key = linkKey(link)
        const group = new THREE.Group()
        const board = new THREE.Mesh(materials.board, [materials.wood, materials.edge]); board.castShadow = true; board.receiveShadow = true
        group.add(board)
        const faceZ = EMA.thickness/2 + EMA.bevel + .001
        const front = new THREE.Mesh(materials.face, materials.wood); front.position.z = faceZ; group.add(front)
        const back = new THREE.Mesh(materials.face, materials.back); back.position.z = -faceZ; back.rotation.y = Math.PI; group.add(back)
        const nail = new THREE.Group()
        const head = new THREE.Mesh(materials.nailGeometry, materials.nailMaterial)
        head.rotation.x = Math.PI/2; head.position.z = .32; head.castShadow = true
        const stem = new THREE.Mesh(materials.nailStem, materials.nailMaterial)
        stem.rotation.x = Math.PI/2; stem.position.z = .2; stem.castShadow = true
        nail.add(stem, head); nail.position.set(x, EMA.nailY, 0)
        const cord = new BraidedCord(materials.rope)
        row.scene.add(group, cord, nail)
        const p = physics.add(x, row.offset)
        const record = { key, link, group, front, back, nail, board, cord, p, row, loaded: false }
        for (const mesh of [board, front, back]) mesh.userData.record = record
        records.set(key, record); updateFront(record, link)
        return record
    }
    const removeRecord = (record) => {
        physics.remove(record.p); record.group.removeFromParent(); record.nail.removeFromParent(); record.cord.removeFromParent(); record.cord.dispose()
        if (record.front.material !== materials.wood) materials.releaseFront(record.front.material)
        records.delete(record.key)
    }
    const measure = () => {
        const nextViews = [], present = new Set(), rowKeys = new Set()
        const active = [...controller.regions].filter((region) => region.preview === (owner === 'preview'))
        // Both hosts share the same data. Only the active host determines geometry.
        for (const region of controller.regions) for (const link of region.links()) present.add(linkKey(link))
        for (const [key, record] of records) if (!present.has(key)) removeRecord(record)
        if (!owner) { views = []; return }
        for (const region of active) {
            const links = region.links(), columns = region.columns()
            for (const element of region.element.querySelectorAll('[data-ema-row]')) {
                const index = Number(element.dataset.emaRow)
                const key = `${region.group}:${index}`; rowKeys.add(key)
                const bounds = element.getBoundingClientRect()
                const rect = { left:bounds.left, right:bounds.right, width:bounds.width, top:bounds.top-160, bottom:bounds.bottom+160, height:bounds.height+320 }
                if (rect.bottom < -340 || rect.top > innerHeight + 340 || rect.right <= 0 || rect.left >= innerWidth) continue
                const row = rows.get(key) || makeRow(key)
                const items = links.slice(index * columns, (index + 1) * columns)
                row.items = items.map((link, i) => {
                    const x = (i - (columns - 1) / 2) * 2.65
                    const record = records.get(linkKey(link)) || addRecord(link, row, x)
                    if (record.row !== row) { row.scene.add(record.group, record.cord, record.nail); record.row = row }
                    physics.relocate(record.p, x, row.offset)
                    record.nail.position.set(x, EMA.nailY, 0)
                    record.link = link; updateFront(record, link)
                    return record
                })
                const worldWidth = columns * 2.65 + .25
                const aspect = rect.width / rect.height
                const fitHeight = Math.max(3.25, worldWidth * bounds.height / bounds.width * 1.08) * rect.height / bounds.height
                row.camera.aspect = aspect
                row.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(fitHeight / (2 * row.camera.position.z)))
                // Expand the projection to the whole screen, preserving the
                // rack's pixel scale. A plaque is never clipped to its DOM row.
                row.camera.setViewOffset(rect.width, rect.height, -rect.left, -rect.top, width, height)
                row.camera.updateProjectionMatrix()
                row.rail.scale.x = worldWidth - .1
                nextViews.push({ row, rect, element, columns, region })
            }
        }
        for (const [key, row] of rows) {
            if (rowKeys.has(key) || [...records.values()].some((record) => record.row === row)) continue
            row.shadowGeometry.dispose(); row.shadowMaterial.dispose(); row.light.shadow.map?.dispose(); rows.delete(key)
        }
        const enabled = new Set(nextViews.flatMap(({row}) => row.items))
        for (const record of records.values()) {
            physics.enable(record.p, enabled.has(record))
            record.group.visible = enabled.has(record)
            record.cord.visible = record.nail.visible = enabled.has(record)
        }
        for(const {row,columns} of nextViews) row.items.forEach((record,index)=>{
            physics.configureRack(record.p,0,(columns*2.65+.15)/2,index===0)
        })
        views = nextViews
    }
    const sync = (record) => {
        const {p, group, row} = record, t = p.body.translation()
        group.position.set(t.x, t.y-row.offset, t.z); group.quaternion.copy(p.body.rotation())
        group.updateMatrixWorld(true)
        const z = EMA.thickness/2+EMA.bevel
        const boardPoints=boardKnotPath().map(point=>group.localToWorld(point))
        const nailPoints=nailKnotPath().map(point=>point.add(new THREE.Vector3(p.x,0,0)))
        // Work in each attachment's local coordinates. The old world-axis
        // offsets could cross the two legs as soon as the plaque rotated.
        const centerline=[p.anchor,...p.cords].map(body=>{
            const t=body.translation();return new THREE.Vector3(t.x,t.y-row.offset,t.z)
        })
        const backExit=group.localToWorld(new THREE.Vector3(.02,EMA.holeY,-z-.035))
        const frontLeg=standingLeg([...centerline].reverse(),boardPoints.at(-1),nailPoints[0])
        const backLeg=standingLeg(centerline,nailPoints.at(-1),backExit)
        // Match the tangent on both sides of each splice. Without these two
        // short fairing points, Catmull-Rom correctly follows each section but
        // creates a visible kink where the fixed knot meets the moving line.
        const fair = (fixed, moving) => {
            const tangent = fixed.at(-1).clone().sub(fixed.at(-2)).normalize()
            const length = fixed.at(-1).distanceTo(moving[1])
            moving[0].copy(fixed.at(-1))
            moving[1].copy(fixed.at(-1)).addScaledVector(tangent, Math.min(.12, length * .22))
            moving[2].lerp(moving[1], .18)
        }
        fair(boardPoints, frontLeg)
        fair(nailPoints, backLeg)
        const threading=[backExit,
            group.localToWorld(new THREE.Vector3(0,EMA.holeY,0)),boardPoints[0]]
        record.cord.update([
            {points:boardPoints,segments:88},
            {points:frontLeg,segments:24},
            {points:nailPoints,segments:56},
            {points:backLeg,segments:56},
            {points:threading,segments:16},
        ])
    }
    const tick = (time) => {
        if (disposed || lost) return
        raf = requestAnimationFrame(tick)
        if (document.hidden || !owner) { last = 0; return }
        const dt = last ? Math.min((time-last)/1000, .05) : 0; last = time
        if (width !== innerWidth || height !== innerHeight) {
            width = innerWidth; height = innerHeight
            renderer.setPixelRatio(ratio); renderer.setSize(width, height, false); invalidate()
        }
        measure()
        const first = views[0]
        if (first && !reduced.matches) {
            const motion = sampler.sample(first.rect.left, first.rect.top, time, `${owner}:${first.row.key}:${first.rect.width}`)
            if (Math.abs(motion.x) + Math.abs(motion.y) > .025) {
                for (const {row} of views) for (const record of row.items) physics.impulse(record.p, -motion.x * .055, motion.y * .018, motion.y * .027)
            }
        }
        if (!reduced.matches || gesture?.dragging || time < settleUntil) {
            accumulator += dt
            let steps = 0
            while (accumulator >= STEP && steps++ < 3) { physics.step(!reduced.matches); accumulator -= STEP }
        }
        renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true)
        for (const view of views) {
            const {row, rect, element} = view
            row.items.forEach(sync)
            const ready = row.items.every((record) => record.loaded)
            element.dataset.rendered = ready ? 'true' : 'false'
            element.setAttribute('aria-busy', String(!ready))
            if (!ready || rect.bottom <= 0 || rect.top >= height) continue
            renderer.setViewport(0, 0, width, height)
            // During page transitions only clip to the moving exploration page,
            // never to a rack/card boundary.
            const host = view.region.preview ? view.element.closest('.explore-screen')?.getBoundingClientRect() : null
            const left = host ? Math.max(0,host.left) : 0
            const right = host ? Math.min(width,host.right) : width
            renderer.setScissor(left, 0, Math.max(0,right-left), height)
            row.light.shadow.autoUpdate = false; row.light.shadow.needsUpdate = frameCount % 2 === 0
            renderer.clearDepth()
            renderer.render(row.scene, row.camera)
        }
        frameCount++
        if (dt > .027) slowFrames++; else slowFrames = Math.max(0, slowFrames-1)
        if (slowFrames > 90 && ratio > 1) { ratio = Math.max(1, ratio-.25); width = 0; slowFrames = 0 }
    }
    const hitTest = (event) => {
        if (!controller.ready.value || owner !== 'page' || lost || document.hidden) return null
        // Controls and keyboard focus keep their ordinary DOM behavior.
        if (event.target.closest?.('button, input, textarea, select')) return null
        for (const view of views) {
            const {rect, row, element} = view
            if (element.dataset.rendered !== 'true') continue
            pointer.set(event.clientX/width*2-1, -event.clientY/height*2+1)
            raycaster.setFromCamera(pointer, row.camera)
            const hits = raycaster.intersectObjects(row.items.flatMap((r) => [r.board, r.front, r.back]), false)
            if (hits[0]) return { record: hits[0].object.userData.record, point: hits[0].point, view }
        }
        return null
    }
    const beginDrag = () => {
        if (!gesture || gesture.cancelled || !activeHit) return
        gesture.dragging = true
        gesture.lastX = gesture.x; gesture.lastY = gesture.y
        captureTarget = activeHit.view.element; captureId = gesture.pointerId
        captureTarget.setPointerCapture(captureId)
        const {record, point} = activeHit
        const local = record.group.worldToLocal(point.clone())
        dragZ = point.z
        physics.startDrag(record.p, {x: point.x, y: point.y+record.row.offset, z:point.z}, local)
        if (gesture.touch) {
            oldOverflow = document.documentElement.style.overflow; oldOverscroll = document.documentElement.style.overscrollBehavior
            document.documentElement.style.overflow = 'hidden'; document.documentElement.style.overscrollBehavior = 'none'; draggingScroll = true
        }
    }
    listen(document, 'dragstart', (event) => { if (event.target.closest?.('.ema-rack')) event.preventDefault() }, {capture:true})
    listen(document, 'pointerdown', (event) => {
        if (!event.isPrimary || event.button !== 0) { endGesture(); return }
        const hit = hitTest(event)
        if (!hit) return
        if (event.pointerType === 'mouse') event.preventDefault()
        activeHit = hit
        gesture = { ...createGesture(event.clientX,event.clientY,event.pointerType !== 'mouse'), pointerId: event.pointerId }
        if (gesture.touch) longPress = setTimeout(beginDrag, TOUCH_DRAG_DELAY)
    }, {capture:true,passive:false})
    listen(document, 'pointermove', (event) => {
        if (gesture && gesture.pointerId === event.pointerId) {
            moveGesture(gesture,event.clientX,event.clientY)
            if (gesture.cancelled) clearTimeout(longPress)
            if (gesture.moved && !gesture.touch && !gesture.dragging) beginDrag()
            if (gesture.dragging) {
                event.preventDefault()
                const view = views.find((view) => view.row === activeHit.record.row)
                if (!view) { endGesture(); return }
                pointer.set(event.clientX/width*2-1, -event.clientY/height*2+1)
                raycaster.setFromCamera(pointer, view.row.camera)
                const target = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1), -dragZ), new THREE.Vector3())
                if (target) {
                    physics.moveDrag({x:target.x,y:target.y+view.row.offset,z:target.z})
                    const dx = event.clientX - (gesture.lastX || event.clientX)
                    const dy = event.clientY - (gesture.lastY || event.clientY)
                    physics.twist(activeHit.record.p, dy * .0005, dx * .0008, dx * .0002)
                    gesture.lastX = event.clientX; gesture.lastY = event.clientY
                }
            }
            return
        }
        if (event.pointerType !== 'mouse' || reduced.matches) return
        const hit = hitTest(event)
        if (hit && lastPointer) {
            const now = performance.now()
            if (now - (hit.record.lastPoke || 0) > 90) {
                const dx = clamp(event.clientX-lastPointer.x,-18,18), dy = clamp(event.clientY-lastPointer.y,-18,18)
                physics.impulse(hit.record.p, dx*.006, -dy*.002, Math.abs(dx)*.004)
                physics.twist(hit.record.p, -dy*.001, dx*.0015, -dx*.0008)
                hit.record.lastPoke = now
            }
        }
        lastPointer = { x:event.clientX, y:event.clientY }
    }, {capture:true,passive:false})
    // touch-action is resolved at touch start, so a non-passive touchmove is needed
    // to cancel scrolling only AFTER the long press has become a drag.
    listen(document, 'touchmove', (event) => { if (gesture?.dragging) event.preventDefault() }, {passive:false,capture:true})
    let suppressClickUntil = 0
    listen(document, 'pointerup', (event) => {
        if (!gesture || gesture.pointerId !== event.pointerId) return
        const visit = canVisit(gesture), hit = hitTest(event)
        if (visit && hit?.record === activeHit?.record) {
            const site = safeSite(hit.record.link.site)
            if (site) window.open(site, '_blank', 'noopener,noreferrer')
        }
        suppressClickUntil = performance.now()+600
        endGesture()
    }, {capture:true})
    listen(document, 'click', (event) => {
        if (event.detail === 0) return
        if (performance.now() < suppressClickUntil && event.target.closest?.('.ema-rack')) { event.preventDefault(); event.stopPropagation(); return }
        // Empty space in a moving plaque's original DOM slot must not navigate.
        if (controller.ready.value && event.target.closest?.('.ema-row[data-rendered="true"] .ema-link')) event.preventDefault()
    }, {capture:true})
    listen(document, 'contextmenu', (event) => { if (gesture?.touch && activeHit) event.preventDefault() }, {capture:true})
    listen(document, 'pointercancel', endGesture, {capture:true})
    listen(window, 'blur', endGesture)
    listen(document, 'visibilitychange', invalidate)
    listen(reduced, 'change', invalidate)
    const fallback = () => { lost = true; controller.ready.value = false; cancelAnimationFrame(raf); endGesture(); canvas.style.visibility = 'hidden' }
    listen(canvas, 'webglcontextlost', (event) => {
        event.preventDefault(); fallback()
        restoreTimer = setTimeout(fallback, 8000)
    })
    listen(canvas, 'webglcontextrestored', () => {
        clearTimeout(restoreTimer)
        if (++restorationAttempts > 2) return
        lost = false; canvas.style.visibility = ''; controller.ready.value = true; invalidate(); raf = requestAnimationFrame(tick)
    })
    raf = requestAnimationFrame(tick)
    return {
        invalidate,
        setOwner(next) {
            if (owner === next) return
            owner = next; invalidate()
            renderer.setScissorTest(false); renderer.clear()
        },
        dispose() {
            if (disposed) return
            disposed = true; clearTimeout(restoreTimer); cancelAnimationFrame(raf); endGesture(); abort.abort()
            for (const record of [...records.values()]) removeRecord(record)
            for (const row of rows.values()) { row.shadowGeometry.dispose(); row.shadowMaterial.dispose(); row.light.shadow.map?.dispose() }
            rows.clear(); physics.dispose(); materials.dispose(); renderer.dispose()
            for (const region of controller.regions) for (const row of region.element.querySelectorAll('[data-rendered]')) delete row.dataset.rendered
        },
    }
}
