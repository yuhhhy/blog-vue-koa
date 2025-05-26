<script setup>
import * as echarts from 'echarts'
import { onMounted } from 'vue'

onMounted(() => {
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById('main'))
  // 绘制图表
  myChart.setOption({
    title: {
      text: 'ECharts 入门示例'
    },
    tooltip: {},
    xAxis: {
      data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
    },
    yAxis: {},
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }
    ]
  })
})
</script>

<template>
  <div>
    Welcome!
    <div id="main" class="w-96 h-96"></div>
    <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
  </div>
</template>

<style scoped>
</style>
