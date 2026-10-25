<script setup>
defineOptions({ inheritAttrs: false })
</script>
<template><v-chip class="admin-chip" rounded="pill" v-bind="$attrs"><slot /></v-chip></template>
<style scoped>.admin-chip { font-weight: 650; }</style>
