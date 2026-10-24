<script setup>
import { ElDialog } from 'element-plus'

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: Boolean, default: false })
</script>

<template>
  <ElDialog v-model="model" class="material-dialog" v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </ElDialog>
</template>
