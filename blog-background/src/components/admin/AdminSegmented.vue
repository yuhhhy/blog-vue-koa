<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  options: { type: Array, required: true },
  label: { type: String, default: '选择选项' },
  appearance: {
    type: String,
    default: 'connected',
    validator: (value) => ['connected', 'pill'].includes(value)
  }
})
const model = defineModel()
const group = ref(null)
let resizeObserver

const updateIndicator = async () => {
  if (props.appearance !== 'pill') return

  await nextTick()
  const selectedButton = group.value?.querySelector('.is-selected')

  if (!selectedButton) return

  group.value.style.setProperty('--indicator-x', `${selectedButton.offsetLeft}px`)
  group.value.style.setProperty('--indicator-width', `${selectedButton.offsetWidth}px`)
  group.value.style.setProperty('--indicator-opacity', '1')
}

watch([model, () => props.options], updateIndicator, { deep: true })

onMounted(() => {
  updateIndicator()
  resizeObserver = new ResizeObserver(updateIndicator)
  resizeObserver.observe(group.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>
<template>
  <div
    ref="group"
    v-bind="$attrs"
    class="admin-button-group"
    :class="`admin-button-group--${appearance}`"
    role="radiogroup"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option.value"
      class="admin-button-group__button"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      :class="{ 'is-selected': model === option.value }"
      @click="model = option.value"
    >{{ option.label }}</button>
  </div>
</template>
<style scoped>
.admin-button-group {
  display: inline-flex;
  max-width: 100%;
  gap: 2px;
  overflow-x: auto;
}

.admin-button-group__button {
  min-width: 48px;
  min-height: 40px;
  flex: 1 0 auto;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  line-height: 20px;
  white-space: nowrap;
  transition: border-radius 150ms ease, color 150ms ease, background-color 150ms ease;
}

.admin-button-group__button:first-child { border-radius: 999px 8px 8px 999px; }
.admin-button-group__button:last-child { border-radius: 8px 999px 999px 8px; }
.admin-button-group__button:only-child { border-radius: 999px; }

.admin-button-group__button:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-secondary-container) 8%, var(--md-sys-color-secondary-container));
}

.admin-button-group__button:active { border-radius: 8px; }

.admin-button-group__button.is-selected {
  border-radius: 8px;
  color: var(--md-sys-color-on-secondary);
  background: var(--md-sys-color-primary);
  font-weight: 700;
}

.admin-button-group__button:focus-visible {
  z-index: 1;
  outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 32%, transparent);
  outline-offset: -1px;
}

.admin-button-group--pill {
  --indicator-opacity: 0;
  --indicator-width: 0px;
  --indicator-x: 0px;
  position: relative;
  gap: 0;
  padding: 4px;
  border-radius: 999px;
  background: var(--md-sys-color-secondary-container);
}

.admin-button-group--pill::before {
  position: absolute;
  z-index: 0;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: var(--indicator-width);
  border-radius: 999px;
  background: var(--md-sys-color-secondary);
  content: '';
  opacity: var(--indicator-opacity);
  transform: translateX(var(--indicator-x));
  transition:
    width 260ms cubic-bezier(.2, 0, 0, 1),
    transform 260ms cubic-bezier(.2, 0, 0, 1),
    opacity 120ms ease;
}

.admin-button-group--pill .admin-button-group__button,
.admin-button-group--pill .admin-button-group__button:first-child,
.admin-button-group--pill .admin-button-group__button:last-child {
  position: relative;
  z-index: 1;
  min-height: 40px;
  border-radius: 999px;
  background: transparent;
  transition: color 180ms ease;
}

.admin-button-group--pill .admin-button-group__button:hover {
  background: color-mix(in srgb, var(--md-sys-color-on-secondary-container) 8%, transparent);
}

.admin-button-group--pill .admin-button-group__button.is-selected {
  color: var(--md-sys-color-on-primary);
  background: transparent;
}

.admin-button-group--pill .admin-button-group__button:active { border-radius: 999px; }

@media (prefers-reduced-motion: reduce) {
  .admin-button-group--pill::before,
  .admin-button-group--pill .admin-button-group__button { transition: none; }
}
</style>
