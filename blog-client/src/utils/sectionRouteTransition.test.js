import test from 'node:test'
import assert from 'node:assert/strict'
import { createSectionTransitionController, waitForVisualWork } from './sectionRouteTransition.js'

const deferred = () => {
    let resolve
    const promise = new Promise((done) => { resolve = done })
    return { promise, resolve }
}

test('a late old animation cannot replace the last route, even after a second leg starts', async () => {
    const firstLeg = deferred()
    const secondLeg = deferred()
    const enteredSecondLeg = deferred()
    const rendered = []
    const controller = createSectionTransitionController(async (target, source, signal) => {
        if (target === 'Essays') {
            await waitForVisualWork(firstLeg.promise, signal)
            enteredSecondLeg.resolve()
            await waitForVisualWork(secondLeg.promise, signal)
        }
        signal.throwIfAborted()
        rendered.push(target)
    })
    const old = controller.run('Essays', 'About')
    firstLeg.resolve()
    await enteredSecondLeg.promise
    await controller.run('Home', 'About')
    secondLeg.resolve()
    assert.equal(await old, false)
    assert.deepEqual(rendered, ['Home'])
})

test('cancellation settles waiting work without needing an animationend event', async () => {
    const never = new Promise(() => {})
    const controller = createSectionTransitionController(async (_, __, signal) => {
        await waitForVisualWork(never, signal)
        assert.fail('cancelled animation continued')
    })
    const running = controller.run('About', 'Home')
    controller.cancel()
    assert.equal(await running, false)
})

test('old cleanup cannot detach the newer request from cancellation', async () => {
    const gate = deferred()
    const controller = createSectionTransitionController(
        (_, __, signal) => waitForVisualWork(gate.promise, signal),
    )
    const first = controller.run('About', 'Home')
    const second = controller.run('Archive', 'About')
    assert.equal(await first, false)
    controller.cancel()
    assert.equal(await second, false)
})
