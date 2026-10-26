const SCROLLING_CLASS = 'is-scrolling'
const MANAGED_CLASS = 'has-auto-hide-scrollbar'
const HIDE_DELAY = 900
const hideTimers = new WeakMap()

const getScrollElement = (target) => {
  if (target instanceof Element) return target
  if (target instanceof Document) return target.scrollingElement || document.documentElement
  return null
}

const showScrollbar = (event) => {
  const element = getScrollElement(event.target)
  if (!element) return

  window.clearTimeout(hideTimers.get(element))
  element.classList.add(MANAGED_CLASS, SCROLLING_CLASS)
  hideTimers.set(element, window.setTimeout(() => {
    element.classList.remove(SCROLLING_CLASS)
    hideTimers.delete(element)
  }, HIDE_DELAY))
}

export const setupAutoHideScrollbars = () => {
  document.addEventListener('scroll', showScrollbar, true)
}
