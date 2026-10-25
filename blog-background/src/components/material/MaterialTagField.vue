<script setup>
import { computed, nextTick, ref, useId } from 'vue'
import { mdiClose } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import MaterialFieldFrame from './MaterialFieldFrame.vue'

const props = defineProps({
  label: { type: String, required: true },
  supportingText: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  required: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
})

const model = defineModel({ type: Array, default: () => [] })
const fieldId = `material-tag-field-${useId()}`
const inputRef = ref(null)
const inputValue = ref('')
const focused = ref(false)

const hasValue = computed(() => model.value.length > 0 || inputValue.value.length > 0)
const active = computed(() => focused.value || hasValue.value)
const visibleMessage = computed(() => props.errorMessage || props.supportingText)
const describedBy = computed(() => visibleMessage.value ? `${fieldId}-supporting` : undefined)

const focusInput = () => inputRef.value?.focus()

const addTag = () => {
  const tag = inputValue.value.trim()
  if (!tag) return
  if (!model.value.includes(tag)) model.value = [...model.value, tag]
  inputValue.value = ''
}

const removeTag = (index) => {
  model.value = model.value.filter((_, tagIndex) => tagIndex !== index)
}

const removeLastTag = () => {
  if (!inputValue.value && model.value.length) removeTag(model.value.length - 1)
}

const handleClear = async () => {
  model.value = []
  inputValue.value = ''
  await nextTick()
  focusInput()
}
</script>

<template>
  <MaterialFieldFrame
    class="material-tag-field"
    :field-id="fieldId"
    :label="label"
    :required="required"
    :active="active"
    :focused="focused"
    :disabled="disabled"
    :clearable="clearable"
    :has-value="hasValue"
    :supporting-text="supportingText"
    :error-message="errorMessage"
    @focus-input="focusInput"
    @clear="handleClear"
  >
    <div class="material-tag-field__values">
      <span v-for="(tag, index) in model" :key="tag" class="material-tag-field__chip">
        <span>{{ tag }}</span>
        <button type="button" :aria-label="`移除标签 ${tag}`" @click.stop="removeTag(index)">
          <MaterialIcon :path="mdiClose" />
        </button>
      </span>
      <input
        :id="fieldId"
        ref="inputRef"
        v-model="inputValue"
        class="material-field__input material-tag-field__input"
        type="text"
        autocomplete="off"
        :required="required && model.length === 0"
        :disabled="disabled"
        :aria-labelledby="`${fieldId}-label`"
        :aria-required="required || undefined"
        :aria-invalid="Boolean(errorMessage) || undefined"
        :aria-describedby="describedBy"
        @focus="focused = true"
        @blur="focused = false"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="removeLastTag"
      >
    </div>
  </MaterialFieldFrame>
</template>

<style scoped>
.material-tag-field__values {
  display: flex;
  align-items: center;
  align-content: center;
  gap: 6px;
  width: 100%;
  min-height: 56px;
  padding: 8px 8px 4px 16px;
  flex-wrap: wrap;
}

.material-tag-field__chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  max-width: 100%;
  padding-left: 12px;
  border-radius: 8px;
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
  font-size: 14px;
  line-height: 20px;
}

.material-tag-field__chip > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-tag-field__chip button {
  display: inline-grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  place-items: center;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.material-tag-field__chip button:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
.material-tag-field__chip button:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: -3px; }
.material-tag-field__chip .material-icon { width: 18px; height: 18px; }

.material-tag-field__input {
  min-width: 112px !important;
  height: 40px !important;
  padding: 8px 0 0 !important;
  flex: 1 1 112px;
}
</style>
