<script setup>
import { computed } from 'vue'
import { mdiChevronLeft, mdiChevronRight, mdiPageFirst, mdiPageLast } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  itemLabel: { type: String, default: '条记录' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const currentPage = computed(() => Math.min(Math.max(props.modelValue, 1), pageCount.value))
const rangeStart = computed(() => props.total ? (currentPage.value - 1) * props.pageSize + 1 : 0)
const rangeEnd = computed(() => Math.min(currentPage.value * props.pageSize, props.total))
const isFirstPage = computed(() => currentPage.value <= 1)
const isLastPage = computed(() => currentPage.value >= pageCount.value)
const pageActions = computed(() => [
  { key: 'first', label: '第一页', icon: mdiPageFirst, page: 1, disabled: isFirstPage.value },
  { key: 'previous', label: '上一页', icon: mdiChevronLeft, page: currentPage.value - 1, disabled: isFirstPage.value },
  { key: 'next', label: '下一页', icon: mdiChevronRight, page: currentPage.value + 1, disabled: isLastPage.value },
  { key: 'last', label: '最后一页', icon: mdiPageLast, page: pageCount.value, disabled: isLastPage.value }
])

const changePage = (page) => {
  if (props.disabled) return
  const nextPage = Math.min(Math.max(page, 1), pageCount.value)
  if (nextPage !== props.modelValue) emit('update:modelValue', nextPage)
}

</script>

<template>
  <nav v-if="total > pageSize" class="admin-pagination" aria-label="分页导航">
    <span class="admin-pagination__range" aria-live="polite">
      {{ rangeStart }}–{{ rangeEnd }} / {{ total }} {{ itemLabel }}
    </span>

    <div class="admin-pagination__actions" role="group" aria-label="翻页操作">
      <v-tooltip v-for="action in pageActions" :key="action.key" :text="action.label" location="top">
        <template #activator="{ props: activatorProps }">
          <button
            v-bind="activatorProps"
            type="button"
            :disabled="disabled || action.disabled"
            :aria-label="`转到${action.label}`"
            @click="changePage(action.page)"
          ><MaterialIcon :path="action.icon" /></button>
        </template>
      </v-tooltip>
    </div>
  </nav>
</template>

<style scoped>
.admin-pagination {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 24px;
  margin-top: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 13px;
}

.admin-pagination__actions button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 32%, transparent);
  outline-offset: 2px;
}

.admin-pagination__range {
  margin-left: auto;
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.admin-pagination__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.admin-pagination__actions button {
  position: relative;
  display: inline-grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--md-sys-color-on-surface-variant);
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.admin-pagination__actions button:hover:not(:disabled) {
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
}

.admin-pagination__actions button:active:not(:disabled) {
  background: var(--md-sys-color-surface-container-highest);
}

.admin-pagination__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.admin-pagination__actions .material-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 600px) {
  .admin-pagination {
    flex-wrap: wrap;
    gap: 12px 20px;
  }

  .admin-pagination__range { margin-left: auto; }

  .admin-pagination__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
