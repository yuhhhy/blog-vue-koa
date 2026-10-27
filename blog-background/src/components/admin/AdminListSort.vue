<script setup>
import { computed, ref } from 'vue'
import { mdiCheck, mdiSortVariant } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import AdminButton from '@/components/admin/AdminButton.vue'

const props = defineProps({
  options: { type: Array, required: true },
  label: { type: String, default: '排序' }
})
const model = defineModel({ type: String, required: true })
const visible = ref(false)
const currentLabel = computed(() => props.options.find(option => option.value === model.value)?.label || props.label)

const selectOption = (value) => {
  model.value = value
  visible.value = false
}
</script>

<template>
  <el-popover v-model:visible="visible" placement="bottom-end" :width="188" trigger="click" popper-class="admin-list-sort__popover">
    <template #reference>
      <AdminButton
        :icon="mdiSortVariant"
        variant="tonal"
        :aria-label="`${label}：${currentLabel}`"
        :aria-expanded="visible"
      >{{ currentLabel }}</AdminButton>
    </template>
    <div class="admin-list-sort__menu" role="menu">
      <button
        v-for="option in options"
        :key="option.value"
        class="admin-list-sort__option"
        :class="{ 'is-active': model === option.value }"
        type="button"
        role="menuitemradio"
        :aria-checked="model === option.value"
        @click="selectOption(option.value)"
      >
        <MaterialIcon class="admin-list-sort__check" :class="{ 'is-hidden': model !== option.value }" :path="mdiCheck" />
        <span>{{ option.label }}</span>
      </button>
    </div>
  </el-popover>
</template>

<style scoped>
.admin-list-sort__check {
  width: 20px;
  height: 20px;
}

.admin-list-sort__menu {
  padding: 4px;
}

.admin-list-sort__option {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  color: var(--md-sys-color-on-surface);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.admin-list-sort__option:hover { background: var(--md-sys-color-surface-container-highest); }
.admin-list-sort__option.is-active { color: var(--md-sys-color-on-secondary-container); background: var(--md-sys-color-secondary-container); }

.admin-list-sort__check.is-hidden {
  visibility: hidden;
}

:global(.admin-list-sort__popover.el-popper) {
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-soft);
}
</style>
