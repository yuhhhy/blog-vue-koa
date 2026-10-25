<script setup>
import { computed } from 'vue'
import { mdiCheck, mdiSortVariant } from '@mdi/js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import AdminButton from '@/components/admin/AdminButton.vue'

const props = defineProps({
  options: { type: Array, required: true },
  label: { type: String, default: '排序' }
})
const model = defineModel({ type: String, required: true })
const currentLabel = computed(() => props.options.find(option => option.value === model.value)?.label || props.label)
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <AdminButton
        v-bind="menuProps"
        :icon="mdiSortVariant"
        variant="tonal"
        :aria-label="`${label}：${currentLabel}`"
      >{{ currentLabel }}</AdminButton>
    </template>
    <v-list class="admin-list-sort__menu" density="comfortable">
      <v-list-item
        v-for="option in options"
        :key="option.value"
        :active="model === option.value"
        color="primary"
        rounded="lg"
        @click="model = option.value"
      >
        <template #prepend>
          <MaterialIcon class="admin-list-sort__check" :class="{ 'is-hidden': model !== option.value }" :path="mdiCheck" />
        </template>
        <v-list-item-title>{{ option.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.admin-list-sort__check {
  width: 20px;
  height: 20px;
}

.admin-list-sort__menu {
  min-width: 188px;
  padding: 4px;
  border-radius: 12px !important;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-soft);
}

.admin-list-sort__check.is-hidden {
  visibility: hidden;
}
</style>
