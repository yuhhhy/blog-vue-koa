<script setup>
import { computed } from 'vue'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  tone: { type: String, default: 'default' },
  variant: { type: String, default: '' },
  size: { type: String, default: 'small' },
  type: { type: String, default: 'button' },
  icon: { type: String, default: '' }
})

const resolvedVariant = computed(() => {
  if (props.variant) return props.variant
  if (props.tone === 'primary') return 'filled'
  if (props.tone === 'danger') return 'danger'
  return 'tonal'
})
</script>

<template>
  <button
    v-bind="$attrs"
    class="admin-button"
    :class="[`admin-button--${resolvedVariant}`, `admin-button--${size}`]"
    :type="type"
  >
    <MaterialIcon v-if="icon" class="admin-button__icon" :path="icon" />
    <span class="admin-button__label"><slot /></span>
  </button>
</template>

<style scoped>
.admin-button {
  position: relative;
  display: inline-flex;
  min-width: 64px;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 20px;
  text-decoration: none;
  white-space: nowrap;
  transition: border-radius 120ms ease, box-shadow 150ms ease, background-color 150ms ease;
}

.admin-button::before {
  position: absolute;
  inset: 0;
  background: currentColor;
  content: '';
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
}

.admin-button:hover::before { opacity: 0.08; }
.admin-button:active { border-radius: 8px; }
.admin-button:active::before { opacity: 0.12; }

.admin-button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 32%, transparent);
  outline-offset: 2px;
}

.admin-button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
  pointer-events: none;
}

.admin-button--medium {
  min-height: 48px;
  padding-inline: 24px;
  font-size: 14px;
}

.admin-button--filled {
  color: var(--md-sys-color-on-primary);
  background: var(--md-sys-color-primary);
}

.admin-button--tonal {
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
}

.admin-button--outlined {
  border: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
  background: transparent;
}

.admin-button--text {
  min-width: 48px;
  padding-inline: 12px;
  color: var(--md-sys-color-primary);
  background: transparent;
}

.admin-button--elevated {
  color: var(--md-sys-color-primary);
  background: var(--md-sys-color-surface-container-low);
  box-shadow: var(--admin-shadow-soft);
}

.admin-button--danger {
  color: var(--admin-on-danger-container);
  background: var(--admin-danger-soft);
}

.admin-button--danger-text {
  min-width: 48px;
  padding-inline: 12px;
  color: var(--md-sys-color-error);
  background: transparent;
}

.admin-button__icon {
  position: relative;
  z-index: 1;
  width: 18px;
  height: 18px;
}

.admin-button__label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
