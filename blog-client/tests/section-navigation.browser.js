// Run with Vite at /tests/section-navigation.html. This separate HTML entry is
// not included in the production build. It mounts the real app and router.
history.replaceState({}, '', '/')
await import('../src/main.js')
const { default: router } = await import('../src/router/index.js')
await router.isReady()
const output = document.querySelector('#results')
const runButton = document.querySelector('#run')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const frame = () => new Promise(requestAnimationFrame)
const errors = []
window.addEventListener('error', (event) => errors.push(event.message))
window.addEventListener('unhandledrejection', (event) => errors.push(String(event.reason)))
const assert = (value, message) => { if (!value) throw new Error(message) }
const scene = () => document.querySelector('.home-viewport')
const visible = (element) => element && getComputedStyle(element).display !== 'none'
    && getComputedStyle(element).visibility !== 'hidden'

async function settle(path) {
    const deadline = performance.now() + 4000
    while (performance.now() < deadline) {
        await frame()
        const moving = scene().getAnimations({ subtree: true }).some((a) => a.playState === 'running')
        const home = path === '/'
        const staleHomeState = home && scene().querySelector('.is-selected, .is-returning, .is-color-restoring')
        if (!moving && !staleHomeState && visible(scene()) === home
            && router.currentRoute.value.path === path) break
    }
    assert(router.currentRoute.value.path === path, 'router mismatch: ' + router.currentRoute.value.path)
    assert(location.pathname === path, 'URL mismatch: ' + location.pathname)
    assert(visible(scene()) === (path === '/'), 'wrong visible renderer for ' + path)
    const panels = document.querySelector('.home-sections')
    if (path === '/') {
        assert(!panels.querySelector('.is-selected, .is-returning, .is-color-restoring'), 'stale home state')
        for (const name of ['about', 'essays', 'archive']) {
            const panel = panels.querySelector('.home-section--' + name)
            assert(visible(panel), 'hidden home panel: ' + name)
        }
    } else {
        const page = document.querySelector('[data-route-content] .page-heading h1')
        const label = { '/about': '关于', '/essays': '随笔', '/archive': '归档' }[path]
        assert(visible(page) && page.textContent.trim() === label, 'wrong page content')
    }
    assert(!errors.length, errors.join('\n'))
}

async function goHome() {
    await router.push('/')
    await settle('/')
}

function returnButton() {
    return visible(scene())
        ? document.querySelector('.screen-toggle--explore')
        : document.querySelector('.home-corner-return')
}

output.textContent = '就绪；点击运行（约 1 分钟）。'
runButton.addEventListener('click', async () => {
    runButton.disabled = true
    errors.length = 0
    const lines = []
    const historyLog = []
    const stopLog = router.afterEach((to, from, failure) => {
        if (!failure) historyLog.push(to.path)
    })
    const report = (line) => { lines.push(line); output.textContent = lines.join('\n') }
    const test = async (name, run) => {
        await goHome()
        const start = historyLog.length
        await run(historyLog, start)
        report('PASS ' + name)
    }
    try {
        for (const section of ['about', 'essays', 'archive']) {
            await test(section + ' color fades only after geometry in both directions', async () => {
                const panel = document.querySelector('.home-section--' + section)
                const opacity = () => Number(getComputedStyle(panel, '::before').opacity)
                const geometryRunning = () => scene().getAnimations({ subtree: true }).some(
                    (a) => a.playState === 'running'
                        && ['clip-path', 'transform', 'top', 'left', 'width', 'font-size'].includes(a.transitionProperty),
                )
                const waitForFade = async (from) => {
                    const deadline = performance.now() + 2500
                    while (opacity() === from && performance.now() < deadline) await frame()
                    assert(!geometryRunning(), 'color changed before geometry ended')
                    await sleep(100)
                    assert(opacity() > 0 && opacity() < 1, 'color snapped instead of fading')
                }
                await router.push('/' + section)
                await sleep(250)
                assert(geometryRunning() && opacity() === 0, 'opening changed color during motion')
                await waitForFade(0)
                await settle('/' + section)
                await router.push('/')
                await sleep(250)
                assert(geometryRunning() && opacity() === 1, 'return changed color during motion')
                await waitForFade(1)
                await settle('/')
            })
        }

        await test('essays rotates and reverses along the same path', async () => {
            await router.push('/essays')
            await sleep(350)
            const panel = document.querySelector('.home-section--essays')
            const coordinates = () => getComputedStyle(panel).clipPath.match(/[\d.]+/g).map(Number)
            const opening = coordinates()
            assert(visible(scene()), 'opening already snapped to destination')
            assert(opening[4] > 0 && opening[4] < 100 && opening[5] === 100,
                'essays must sweep its third vertex along the bottom, not widen at the left')
            returnButton().click()
            await sleep(30)
            const reversing = coordinates()
            assert(reversing[4] >= opening[4] && reversing[4] < 100,
                'return must reverse from the current rotation')
            await settle('/')
        })

        for (const path of ['/about', '/essays', '/archive']) {
            for (const delay of [0, 16, 60, 450, 880, 930]) {
                await test(path + ' → home at ' + delay + 'ms', async (log, start) => {
                    await router.push(path)
                    await sleep(delay)
                    const button = returnButton()
                    assert(button && !button.disabled, 'return button unavailable')
                    button.click()
                    await settle('/')
                    assert(log.slice(start).every((p) => p === '/' || p === path), 'unsolicited navigation')
                })
            }
        }

        await test('reverse return after 16ms', async () => {
            await router.push('/about')
            await settle('/about')
            returnButton().click()
            await sleep(16)
            document.querySelector('.home-section--about').click()
            await settle('/about')
            await sleep(1300)
            await settle('/about')
        })

        await test('change target during second leg', async (log, start) => {
            await router.push('/about')
            await settle('/about')
            await router.push('/essays')
            await sleep(1050)
            await router.push('/archive')
            await sleep(60)
            await router.push('/')
            await settle('/')
            await sleep(1300)
            await settle('/')
            assert(log.slice(start).join(',') === '/about,/essays,/archive,/', 'late route commit')
        })

        await test('three sections rapidly, latest wins', async (log, start) => {
            for (const path of ['/about', '/archive', '/essays', '/about']) {
                await router.push(path)
                await sleep(16)
            }
            await settle('/about')
            await sleep(1300)
            await settle('/about')
            assert(log.slice(start).join(',') === '/about,/archive,/essays,/about', 'extra route or intermediate home')
        })

        await test('back / forward while opening', async () => {
            await router.push('/archive')
            await sleep(16)
            router.back()
            await sleep(30)
            router.forward()
            await sleep(30)
            router.back()
            await settle('/')
            await sleep(1300)
            await settle('/')
        })

        await test('same destination and keyboard entry', async () => {
            const panel = document.querySelector('.home-section--about')
            panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
            await sleep(16)
            await router.push('/about')
            await settle('/about')
        })

        await test('cancel color restoration', async () => {
            await router.push('/archive')
            await settle('/archive')
            await router.push('/')
            await sleep(1000)
            await router.push('/about')
            await settle('/about')
            await sleep(800)
            await settle('/about')
        })
        await goHome()
        report('DONE ' + lines.length + ' passed; no runtime errors.')
    } catch (error) {
        report('FAIL ' + error.message)
    } finally {
        stopLog()
        runButton.disabled = false
    }
})
