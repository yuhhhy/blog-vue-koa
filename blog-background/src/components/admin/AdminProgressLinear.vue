<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  indeterminate: { type: Boolean, default: false },
  tone: { type: String, default: 'primary' },
  height: { type: [Number, String], default: 4 },
  rounded: { type: Boolean, default: false }
})

const normalizedValue = computed(() => Math.min(100, Math.max(0, props.modelValue)))
const heightValue = computed(() => typeof props.height === 'number' ? `${props.height}px` : props.height)
</script>

<template>
  <div
    class="admin-progress"
    :class="[`admin-progress--${tone}`, { 'admin-progress--indeterminate': indeterminate, 'admin-progress--rounded': rounded }]"
    :style="{ height: heightValue }"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="indeterminate ? undefined : normalizedValue"
  >
    <span class="admin-progress__bar" :style="indeterminate ? undefined : { width: `${normalizedValue}%` }" />
  </div>
</template>

<style scoped>
.admin-progress {
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent);
}

.admin-progress__bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--md-sys-color-primary);
  transition: width 180ms ease;
}

.admin-progress--error {
  background: color-mix(in srgb, var(--md-sys-color-error) 18%, transparent);
}

.admin-progress--error .admin-progress__bar { background: var(--md-sys-color-error); }
.admin-progress--rounded { border-radius: 999px; }
.admin-progress--rounded .admin-progress__bar { border-radius: inherit; }

.admin-progress--indeterminate .admin-progress__bar {
  width: 45%;
  animation: admin-progress-indeterminate 1.2s ease-in-out infinite;
}

@keyframes admin-progress-indeterminate {
  from { transform: translateX(-110%); }
  to { transform: translateX(230%); }
}

@media (prefers-reduced-motion: reduce) {
  .admin-progress--indeterminate .admin-progress__bar { animation-duration: 2.4s; }
}
</style>
