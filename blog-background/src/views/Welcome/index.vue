<script setup>
</script>

<template>
  <div class="wrapper">
    Welcome!
    <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
}
</style>
