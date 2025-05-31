<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetWebsiteData } from '@/api/websiteData.js'

onMounted(() => {
  fetchData()
})

// 统计数据
const statistics = ref({
  view: { 
    total: 0, 
    data: [], // 存储每日数据
    rate: 10
  },
  visit: { 
    total: 0, 
    data: [] 
  },
  comment: { 
    total: 0, 
    data: [] 
  }
})

// 时间范围选择
const timeRange = ref('all')
const timeRanges = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

watch(timeRange, () => {
  fetchData()
})

// 数据类型选择
const dataType = ref('views')
const dataTypes = [
  { label: '浏览量', value: 'views' },
  { label: '访问量', value: 'visits' },
  { label: '评论数', value: 'comments' }
]

// 添加数据加载状态
const loading = ref(false)

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const websiteData = await apiGetWebsiteData('all')
    console.log("websiteData", websiteData)
    

    // 更新统计数据
    statistics.value.view = {
      total: websiteData.view.total,
      data: websiteData.view.data
    }
    
    statistics.value.visit = {
      total: websiteData.visit.total,
      data: websiteData.visit.data
    }

    statistics.value.comment = {
      total: websiteData.comment.total,
      data: websiteData.comment.data
    }

    console.log("statistics", statistics.value)

    // 初始化图表
    initCards()
    initMainChart()
    initArticleChart()
    // initNotificationChart()
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('数据获取失败')
  } finally {
    loading.value = false
  }
}

// 计算增长率（模拟，实际应该从后端获取）
function calculateGrowthRate(current) {
  return ((current / (current * 0.9) - 1) * 100).toFixed(1)
}


// 初始化顶部卡片图表
const initCards = () => {
  
  // 浏览量折线图
  const viewChart = echarts.init(document.getElementById('viewChart'))
  viewChart.setOption({
    grid: { top: 0, right: 0, bottom: 0, left: 0 },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: false,
      // data: statistics.value.view.data,
      data: [1,23,54,22],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16,185,129,0.8)' },
          { offset: 1, color: 'rgba(16,185,129,0.1)' }
        ])
      },
      lineStyle: { color: '#10B981' }
    }]
  })

  // 访问量折线图
  const visitChart = echarts.init(document.getElementById('visitChart'))
  visitChart.setOption({
    grid: { top: 5, right: 5, bottom: 5, left: 5 },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: true,
      // data: statistics.value.visit.data,
      data: [1,23,54,19],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(58,77,233,0.8)' },
          { offset: 1, color: 'rgba(58,77,233,0.1)' }
        ])
      },
      lineStyle: { color: '#3a4de9' }
    }]
  })

  // 评论数柱状图
  const commentChart = echarts.init(document.getElementById('commentChart'))
  commentChart.setOption({
    grid: { top: 5, right: 5, bottom: 5, left: 5 },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [{
      type: 'bar',
      data: statistics.value.comment.data,
      itemStyle: { color: '#3a4de9' }
    }]
  })
}

// 初始化主图表
const initMainChart = () => {
  const mainChart = echarts.init(document.getElementById('mainChart'))
  const xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  mainChart.setOption({
    title: { text: '数据统计' },
    tooltip: { trigger: 'axis' },
    legend: { 
      data: ['浏览量', '访问量', '评论数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '浏览量',
        type: 'bar',
        data: statistics.value.view.data
      },
      {
        name: '访问量',
        type: 'bar',
        data: statistics.value.visit.data
      },
      {
        name: '评论数',
        type: 'bar',
        data: statistics.value.comment.data
      }
    ]
  })
}

// 文章统计图表 - 热力图
const initArticleChart = () => {
  const articleChart = echarts.init(document.getElementById('articleChart'))
  
  // 生成模拟数据
  const data = []
  const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p']
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push([j, i, Math.round(Math.random() * 10)])
    }
  }

  articleChart.setOption({
    title: {
      text: '文章发布时间分布',
      left: 'center',
      top: 0
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${days[params.value[1]]} ${hours[params.value[0]]}<br/>发布数量: ${params.value[2]}`
      }
    },
    grid: {
      top: '15%',
      left: '5%',
      right: '5%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true }
    },
    // 修改热力图配置部分
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        // 改为绿色渐变
        color: ['#e6ffef', '#10B981']
      }
    },
    series: [{
      name: '文章数量',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
}

// 通知管理
const notificationList = ref([
  { type: '系统通知', count: 35, color: '#10B981', icon: 'Setting' },
  { type: '评论通知', count: 20, color: '#3B82F6', icon: 'ChatDotRound' },
  { type: '点赞通知', count: 15, color: '#F59E0B', icon: 'Star' },
  { type: '回复通知', count: 10, color: '#6366F1', icon: 'Comment' }
])
</script>

<template>
<div class="p-6 space-y-6">
    <!-- 顶部卡片 -->
    <div class="grid grid-cols-3 gap-6">
    <!-- 浏览量卡片 -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-gray-500">总浏览量</h3>
          <p class="text-2xl font-bold">{{ statistics.view.total }}</p>
        </div>
        <div :class="statistics.view.rate >= 0 ? 'text-green-500' : 'text-red-500'">
          <span>{{ statistics.view.rate >= 0 ? '↑' : '↓' }}{{ Math.abs(statistics.view.rate) }}%</span>
        </div>
      </div>
      <div id="viewChart" class="h-16 w-full"></div>
    </div>

      <!-- 访问量卡片 -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="mb-4">
          <h3 class="text-gray-500">总访问量</h3>
          <p class="text-2xl font-bold">{{ statistics.visit.total }}</p>
        </div>
        <div id="visitChart" class="h-16 w-full"></div>
      </div>

      <!-- 评论数卡片 -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="mb-4">
          <h3 class="text-gray-500">总评论数</h3>
          <p class="text-2xl font-bold">{{ statistics.comment.total }}</p>
        </div>
        <div id="commentChart" class="h-16 w-full"></div>
      </div>
    </div>

    <!-- 主图表 -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between mb-4">
        <el-radio-group v-model="dataType">
          <el-radio-button 
            v-for="type in dataTypes" 
            :key="type.value" 
            :value="type.value"
          >
            {{ type.label }}
          </el-radio-button>
        </el-radio-group>

        <el-radio-group v-model="timeRange">
          <el-radio-button 
            v-for="range in timeRanges" 
            :key="range.value" 
            :value="range.value"
          >
            {{ range.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div id="mainChart" class="w-full h-80"></div>
    </div>

     <!-- 底部图表 -->
    <div class="grid grid-cols-5 gap-6">
      <div class="col-span-3 bg-white p-4 rounded-lg shadow">
        <div id="articleChart" class="w-full h-64"></div>
      </div>
      <div class="col-span-2 bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-bold mb-4">通知管理</h3>
        <div class="space-y-4">
          <div v-for="item in notificationList" 
              :key="item.type" 
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex items-center space-x-3">
              <el-icon :style="{color: item.color}" class="text-xl">
                <component :is="item.icon" />
              </el-icon>
              <span class="text-gray-600">{{ item.type }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-lg font-semibold" :style="{color: item.color}">{{ item.count }}</span>
              <span class="text-gray-400 text-sm">条</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
