<script setup>

</script>

<template>
  <div class="wrapper">
    <div class="side-bar"></div>
    <div class="main">
      <div class="head-nav">
        <div>面包屑</div>
        <div>用户</div>
      </div>
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  position: relative;
  .side-bar {
    position: fixed;
    width: 200px;
    height: 100vh;
    border-right: 1px solid #ccc;
    overflow-y: auto;
  }
  .main {
    margin-left: 200px;
    .head-nav {
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
    }
    .content {
      background-color: #f0f2f5;
      height: calc(100vh - 50px);
      overflow-y: auto;
    }
  }
}
</style>
