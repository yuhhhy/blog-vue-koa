<script setup>
import { computed } from 'vue'
import { mdiAlertCircleOutline, mdiCloseCircleOutline } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  focused: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  hasValue: { type: Boolean, default: false },
  leadingIcon: { type: String, default: '' },
  supportingText: { type: String, default: '' },
  errorMessage: { type: String, default: '' }
})

const emit = defineEmits(['focus-input', 'clear'])
const visibleMessage = computed(() => props.errorMessage || props.supportingText)
const labelText = computed(() => props.label)
const showClear = computed(() => props.clearable && props.hasValue && !props.disabled)
</script>

<template>
  <div
    v-bind="$attrs"
    class="material-field"
    :class="{
      'material-field--active': active,
      'material-field--focused': focused,
      'material-field--disabled': disabled,
      'material-field--error': errorMessage,
      'material-field--with-leading': leadingIcon
    }"
  >
    <div class="material-field__control" @click="!disabled && emit('focus-input')">
      <fieldset class="material-field__outline" aria-hidden="true">
        <legend><span>{{ labelText }}</span></legend>
      </fieldset>

      <MaterialIcon
        v-if="leadingIcon"
        class="material-field__leading-icon"
        :path="leadingIcon"
      />

      <label :id="`${fieldId}-label`" class="material-field__label" :for="fieldId">
        {{ labelText }}
      </label>

      <div class="material-field__body">
        <slot />
      </div>

      <MaterialIcon
        v-if="errorMessage"
        class="material-field__error-icon"
        :path="mdiAlertCircleOutline"
        title="输入有误"
      />

      <slot name="trailing" />

      <button
        v-if="showClear"
        class="material-field__clear"
        type="button"
        aria-label="清除输入内容"
        @click.stop="emit('clear')"
      >
        <MaterialIcon :path="mdiCloseCircleOutline" />
      </button>
    </div>

    <div
      v-if="visibleMessage"
      :id="`${fieldId}-supporting`"
      class="material-field__supporting"
      :role="errorMessage ? 'alert' : undefined"
    >
      {{ visibleMessage }}
    </div>
  </div>
</template>

<style scoped>
.material-field {
  width: 100%;
  min-width: 0;
  color: var(--admin-text);
}

.material-field__control {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  border-radius: 4px;
  cursor: text;
}

.material-field__outline {
  position: absolute;
  inset: 0;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0 8px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: inherit;
  pointer-events: none;
  transition: border-color 150ms ease, border-width 150ms ease;
}

.material-field__outline legend {
  width: auto;
  max-width: 0.01px;
  height: 0;
  padding: 0;
  overflow: hidden;
  color: transparent;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  visibility: hidden;
}

.material-field__outline legend span { padding: 0 4px; }

.material-field--active .material-field__outline legend {
  max-width: 100%;
  visibility: visible;
}

.material-field__label {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 16px;
  max-width: calc(100% - 32px);
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 16px;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  transform: translateY(-50%);
  transform-origin: left center;
  transition: color 150ms ease, font-size 150ms ease, left 150ms ease, top 150ms ease, transform 150ms ease;
}

.material-field--with-leading:not(.material-field--active) .material-field__label { left: 52px; }

.material-field--active .material-field__label {
  top: 0;
  left: 16px;
  max-width: calc(100% - 40px);
  font-size: 12px;
  line-height: 16px;
}

.material-field__leading-icon,
.material-field__error-icon {
  z-index: 1;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
}

.material-field__leading-icon {
  margin-left: 12px;
  margin-right: 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.material-field__error-icon {
  margin-right: 12px;
  color: var(--md-sys-color-error);
}

.material-field__body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 56px;
  flex: 1 1 auto;
}

.material-field__body :deep(.material-field__input) {
  width: 100%;
  min-width: 0;
  height: 56px;
  padding: 8px 16px 0;
  border: 0;
  outline: 0;
  color: var(--md-sys-color-on-surface);
  background: transparent;
  caret-color: var(--md-sys-color-primary);
  font: inherit;
  font-size: 16px;
  line-height: 24px;
}

.material-field--with-leading .material-field__body :deep(.material-field__input) { padding-left: 0; }
.material-field__body :deep(.material-field__input::placeholder) { color: var(--md-sys-color-on-surface-variant); opacity: 1; }
.material-field__body :deep(input[type='search']::-webkit-search-cancel-button) { display: none; }

.material-field__clear {
  position: relative;
  z-index: 2;
  display: inline-grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  place-items: center;
  color: var(--md-sys-color-on-surface-variant);
  background: transparent;
  cursor: pointer;
}

.material-field__control :deep(.material-field__trailing) {
  position: relative;
  z-index: 2;
  display: inline-grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  place-items: center;
  color: var(--md-sys-color-on-surface-variant);
  background: transparent;
  cursor: pointer;
}

.material-field__control :deep(.material-field__trailing:hover) {
  background: color-mix(in srgb, var(--admin-text) 8%, transparent);
}

.material-field__control :deep(.material-field__trailing:focus-visible) {
  outline: 3px solid color-mix(in srgb, var(--admin-primary) 34%, transparent);
  outline-offset: -4px;
}

.material-field__control :deep(.material-field__trailing .material-icon) { width: 24px; height: 24px; }

.material-field__clear .material-icon { width: 24px; height: 24px; }
.material-field__clear:hover { background: color-mix(in srgb, var(--admin-text) 8%, transparent); }
.material-field__clear:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--admin-primary) 34%, transparent);
  outline-offset: -4px;
}

.material-field:not(.material-field--focused, .material-field--error, .material-field--disabled) .material-field__control:hover .material-field__outline {
  border-color: var(--md-sys-color-on-surface);
}

.material-field--focused .material-field__outline {
  border-width: 3px;
  border-color: var(--md-sys-color-primary);
}

.material-field--focused .material-field__label,
.material-field--focused .material-field__leading-icon { color: var(--md-sys-color-primary); }

.material-field--error .material-field__outline { border-color: var(--md-sys-color-error); }
.material-field--error .material-field__label { color: var(--md-sys-color-error); }

.material-field--disabled { opacity: 0.38; }
.material-field--disabled .material-field__control { cursor: default; }
.material-field--disabled .material-field__outline { border-color: var(--md-sys-color-on-surface); }

.material-field__supporting {
  min-height: 16px;
  padding: 4px 16px 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
  line-height: 16px;
}

.material-field--error .material-field__supporting { color: var(--md-sys-color-error); }

@media (prefers-reduced-motion: reduce) {
  .material-field__outline,
  .material-field__label { transition: none; }
}
</style>
