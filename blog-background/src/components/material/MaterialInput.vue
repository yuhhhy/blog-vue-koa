<script setup>
import { ElInput } from 'element-plus'

defineOptions({ inheritAttrs: false })

const model = defineModel()
</script>

<template>
  <ElInput v-model="model" class="material-input" v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </ElInput>
</template>
