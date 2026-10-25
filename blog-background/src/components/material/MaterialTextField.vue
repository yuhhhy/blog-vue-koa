<script setup>
import { computed, nextTick, ref, useAttrs, useId } from 'vue'
import { mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import MaterialFieldFrame from './MaterialFieldFrame.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  supportingText: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  leadingIcon: { type: String, default: '' },
  prefix: { type: String, default: '' },
  revealable: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['focus', 'blur', 'clear'])
const model = defineModel({ type: String, default: '' })
const attrs = useAttrs()
const generatedId = useId()
const inputRef = ref(null)
const focused = ref(false)
const revealed = ref(false)

const fieldId = computed(() => String(attrs.id || `material-text-field-${generatedId}`))
const hasValue = computed(() => model.value.length > 0)
const active = computed(() => focused.value || hasValue.value || Boolean(props.prefix))
const effectiveType = computed(() => props.revealable && revealed.value ? 'text' : props.type)
const visibleMessage = computed(() => props.errorMessage || props.supportingText)
const inputAttrs = computed(() => {
  const { class: _class, style: _style, id: _id, 'aria-describedby': _describedBy, ...rest } = attrs
  return rest
})
const describedBy = computed(() => {
  const ids = [attrs['aria-describedby'], visibleMessage.value && `${fieldId.value}-supporting`].filter(Boolean)
  return ids.join(' ') || undefined
})

const focusInput = () => inputRef.value?.focus()

const handleFocus = (event) => {
  focused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  focused.value = false
  emit('blur', event)
}

const handleClear = async () => {
  model.value = ''
  emit('clear')
  await nextTick()
  focusInput()
}
</script>

<template>
  <MaterialFieldFrame
    :class="['material-text-field', $attrs.class]"
    :style="$attrs.style"
    :field-id="fieldId"
    :label="label"
    :required="required"
    :active="active"
    :focused="focused"
    :disabled="disabled"
    :clearable="clearable"
    :has-value="hasValue"
    :leading-icon="leadingIcon"
    :supporting-text="supportingText"
    :error-message="errorMessage"
    @focus-input="focusInput"
    @clear="handleClear"
  >
    <span v-if="prefix && active" class="material-text-field__prefix">{{ prefix }}</span>
    <input
      :id="fieldId"
      ref="inputRef"
      v-bind="inputAttrs"
      v-model="model"
      class="material-field__input"
      :type="effectiveType"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :aria-required="required || undefined"
      :aria-invalid="Boolean(errorMessage) || undefined"
      :aria-describedby="describedBy"
      @focus="handleFocus"
      @blur="handleBlur"
    >
    <template v-if="revealable" #trailing>
      <button
        class="material-field__trailing"
        type="button"
        :aria-label="revealed ? '隐藏密码' : '显示密码'"
        :aria-pressed="revealed"
        @click.stop="revealed = !revealed"
      >
        <MaterialIcon :path="revealed ? mdiEyeOffOutline : mdiEyeOutline" />
      </button>
    </template>
  </MaterialFieldFrame>
</template>

<style scoped>
.material-text-field__prefix {
  margin-left: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
}

.material-text-field__prefix + .material-field__input { padding-left: 4px; }
</style>
