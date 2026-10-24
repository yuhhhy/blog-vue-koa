<script setup>
import { ElButton } from 'element-plus'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <ElButton class="material-button" v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </ElButton>
</template>
