<script setup>
defineOptions({ inheritAttrs: false })
defineProps({ title: { type: String, required: true } })
const model = defineModel({ type: Boolean, default: false })
</script>
<template>
  <v-dialog v-model="model" v-bind="$attrs">
    <v-card class="admin-dialog" rounded="xl">
      <div class="admin-dialog__header"><h2>{{ title }}</h2></div>
      <div class="admin-dialog__body"><slot /></div>
      <div v-if="$slots.actions" class="admin-dialog__actions"><slot name="actions" /></div>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.admin-dialog { border: 0; background: var(--md-sys-color-surface-container-high); }
.admin-dialog__header { padding: 24px 24px 8px; }
h2 { margin: 0; font-size: 22px; font-weight: 650; }
.admin-dialog__body { display: grid; gap: 12px; padding: 16px 24px; }
.admin-dialog__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 8px 24px 24px; }
</style>
