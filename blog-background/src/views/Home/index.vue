<script setup>
import Layout from '@/Layout/index.vue';
import { onMounted } from 'vue';
import { apiCreateVisitor } from '@/api/visitor.js';

const role = 'client';
const page = 'home';

onMounted(() => {
  // apiCreateVisitor({ role, page }).then(res => 
  //   console.log('response', res)
  // )
})


</script>

<template>
  <Layout />
</template>

<style scoped>
</style>
