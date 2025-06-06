<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetWebsiteData } from '@/api/websiteData.js'

onMounted(() => {
  fetchData()
})

// 获取初始化数据
async function fetchData() {
  try {
    const data = await apiGetWebsiteData('week')

    // 更新顶部统计数据
    Object.assign(topData.value.view, data.view)
    Object.assign(topData.value.visit, data.visit)
    Object.assign(topData.value.comment, data.comment)

    // 更新主图表初始数据
    mainData.value.view.weekData = data.view.data
    mainData.value.visit.weekData = data.visit.data
    mainData.value.comment.weekData = data.comment.data

    // 更新热力图表数据
    heatmapData.value = data.article.data
    articleCount.value = data.article.total 

    // 初始化图表
    initTopCards()
    initMainChart()
    initArticleChart()
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('数据获取失败')
  }
}

/**
 * 顶部卡片图表部分
 * initTopCards
 */

// 顶部卡片数据
const topData = ref({
  view: { 
    total: 0, 
    data: [],
    rate: 0
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

// 生成过去7天的日期数组
const getLastSevenDays = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay() // 0-6，0代表周日
  const todayIndex = today === 0 ? 6 : today - 1 // 转换为数组索引

  // 重新排序数组
  return [
    ...days.slice(todayIndex + 1),
    ...days.slice(0, todayIndex + 1)
  ]
}

// 使用这个函数替换固定的日期数组，作为xAxis的data
const dateLabels = getLastSevenDays()

// 初始化顶部卡片图表
const initTopCards = () => {
  
  // 浏览量折线图
  const viewChart = echarts.init(document.getElementById('viewChart'))
  viewChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    grid: { top: 5, right: 0, bottom: 5, left: 0 },
    xAxis: { 
      data: dateLabels,
      show: false
    },
    yAxis: { 
      show: false
    },
    series: [{
      data: topData.value.view.data,
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: { color: '#82BEFF' },
      lineStyle: { color: '#82BEFF' }
    }]
  })

  // 访问量柱状图
  const visitChart = echarts.init(document.getElementById('visitChart'))
  visitChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      }
    },
    grid: { top: 0, right: 0, bottom: 5, left: 0 },
    xAxis: { 
      data: dateLabels,
      show: false
    },
    yAxis: { 
      show: false
    },
    series: [{
      data: topData.value.visit.data,
      type: 'bar',
      itemStyle: { color: '#82BEFF' }
    }]
  })

  // 评论数柱状图
  const commentChart = echarts.init(document.getElementById('commentChart'))
  commentChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      }
    },
    grid: { top: 5, right: 5, bottom: 5, left: 5 },
    xAxis: {
      data: dateLabels,
      show: false
    },
    yAxis: { show: false },
    series: [{
      type: 'bar',
      data: topData.value.comment.data,
      itemStyle: { color: '#3a4de9' }
    }]
  })
}


/**
 * 最大的主图表部分
 * initMainChart
 */

// 主图表数据
const mainData = ref({
  view: { 
    weekData: [],
    monthData: [],
    yearData: [],
  },
  visit: { 
    weekData: [],
    monthData: [],
    yearData: []
  },
  comment: { 
    weekData: [],
    monthData: [],
    yearData: []
  }
})

// 时间范围选择
const timeRange = ref('week')
const timeRanges = [
  { label: '七日', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

// 数据类型选择
const dataType = ref('view')
const dataTypes = [
  { label: '浏览量', value: 'view' },
  { label: '访问量', value: 'visit' },
  { label: '评论数', value: 'comment' }
]

// 定义中文周名称映射
const weekDayMap = {
  'Mon': '一',
  'Tue': '二',
  'Wed': '三',
  'Thu': '四',
  'Fri': '五',
  'Sat': '六',
  'Sun': '日'
}

watch([timeRange, dataType], async () => {
  try {
    if (timeRange.value !== 'week') {
      if (mainData.value.view.monthData.length === 0 && timeRange.value === 'month') {
        // 获取month数据
        const dataMonth = await apiGetWebsiteData(timeRange.value)
        mainData.value.view.monthData = dataMonth.view.data
        mainData.value.visit.monthData = dataMonth.visit.data
        mainData.value.comment.monthData = dataMonth.comment.data
      }
      if (mainData.value.view.yearData.length === 0 && timeRange.value === 'year') {
        // 获取year数据
        const dataYear = await apiGetWebsiteData(timeRange.value)
        mainData.value.view.yearData = dataYear.view.data
        mainData.value.visit.yearData = dataYear.visit.data
        mainData.value.comment.yearData = dataYear.comment.data
      }
      // 重新渲染MainChart
      initMainChart()
    } else {
      initMainChart()
    }
  } catch (error) {
    console.error('更新主图表失败:', error)
    ElMessage.error('更新主图表失败')
  }
})

// 对主图表的引用
const mainChartRef = ref(null)

// 初始化主图表
const initMainChart = () => {
  if (mainChartRef.value) {
    // 如果图表已存在，先销毁
    mainChartRef.value.dispose()
  }

  mainChartRef.value = echarts.init(document.getElementById('mainChart'))

  // 根据时间范围获取对应的标签
  const getTimeLabels = () => {
    const now = new Date()
  
    switch(timeRange.value) {
      case 'week': {
        // 获取过去7天的日期
        const dates = Array.from({length: 7}, (_, i) => {
          const date = new Date()
          date.setDate(now.getDate() - (6 - i))
          return date
        })
        return dates.map(date => `${date.getMonth() + 1}月${date.getDate()}日`)
      }
      case 'month': {
        // 获取本月所有日期
        const year = now.getFullYear()
        const month = now.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return Array.from({length: daysInMonth}, (_, i) => `${i + 1}日`)
      }
      case 'year': {
        // 获取今年所有月份
        return Array.from({length: 12}, (_, i) => `${i + 1}月`)
      }
      default:
        return []
    }
  }

  // 获取当前数据类型的配置
  const getCurrentTypeConfig = () => {
    const typeConfigs = {
      view: {
        name: '浏览量',
        color: '#3B82F6',
        data: mainData.value.view[`${timeRange.value}Data`]
      },
      visit: {
        name: '访问量',
        color: '#10B981',
        data: mainData.value.visit[`${timeRange.value}Data`]
      },
      comment: {
        name: '评论数',
        color: '#F59E0B',
        data: mainData.value.comment[`${timeRange.value}Data`]
      }
    }
    return typeConfigs[dataType.value]
  }

  const currentConfig = getCurrentTypeConfig()

  mainChartRef.value.setOption({
    title: { 
      text: `${currentConfig.name}统计`,
      left: 'center'
    },
    tooltip: { 
      trigger: 'axis',
      formatter: `{b}<br/>${currentConfig.name}：{c}`
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
      data: getTimeLabels(),
      axisLabel: {
        rotate: timeRange.value === 'month' ? 45 : 0,
        interval: timeRange.value === 'month' ? 'auto' : 0 // 防止标签重叠
      }
    },
    yAxis: { 
      type: 'value',
      name: currentConfig.name
    },
    series: [
      {
        name: currentConfig.name,
        type: 'bar',
        data: currentConfig.data,
        itemStyle: {
          color: currentConfig.color
        },
        emphasis: {
          focus: 'series',
          label: {
            show: true,
            formatter: '{c}',
            position: 'top'
          }
        }
      }
    ]
  })
}

const heatmapData = ref([])
const articleCount = ref(0)

// 文章统计图表 - 热力图
const initArticleChart = () => {
  const articleChart = echarts.init(document.getElementById('articleChart'))
  
  const getYearlyData = (year) => {
    // 创建一个 Map 来存储日期和文章数量的对应关系
    const articleMap = new Map()
    
    // 处理实际数据
    heatmapData.value.forEach(item => {
      const date = new Date(item.date)
      const dateStr = echarts.time.format(+date, '{yyyy}-{MM}-{dd}', false)
      articleMap.set(dateStr, item.count)
    })
    
    // 生成完整的年度数据
    const date = +echarts.time.parse(year + '-01-01')
    const end = +echarts.time.parse((+year + 1) + '-01-01')
    const dayTime = 3600 * 24 * 1000
    const data = []
    
    // 遍历整年的每一天
    for (let time = date; time < end; time += dayTime) {
      const dateStr = echarts.time.format(time, '{yyyy}-{MM}-{dd}', false)
      data.push([
        dateStr,
        articleMap.get(dateStr) || 0  // 如果该日期没有数据则返回0
      ])
    }
    
    return data
  }

  articleChart.setOption({
    title: {
      top: 30,
      left: 'center',
      text: '文章发布'
    },
    tooltip: {
      formatter: function(params) {
        const value = params.value[1]
        const date = new Date(params.value[0])
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        // 获取日期的后缀
        const getDaySuffix = (day) => {
          if (day > 3 && day < 21) return 'th'
          switch (day % 10) {
            case 1: return 'st'
            case 2: return 'nd'
            case 3: return 'rd'
            default: return 'th'
          }
        }

        const month = months[date.getMonth()]
        const day = date.getDate()
        const suffix = getDaySuffix(day)

        return value === 1 || value === 0
          ? `${value} article written on ${month} ${day}${suffix}`
          : `${value} articles written on ${month} ${day}${suffix}`
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 75,
      pieces: [
        { gte: 4, color: '#216e39' },
        { value: 3, color: '#30a14e' },
        { value: 2, color: '#40c463' },
        { value: 1, color: '#9be9a8' },
        { value: 0, color: '#ebedf0' }
      ]
    },
    calendar: {
      top: 140,
      left: 30,
      right: 30,
      cellSize: ['auto', 16],
      range: '2025',
      splitLine: false,
      itemStyle: {
        borderWidth: 0.5,
        borderWidth: 3,
        borderColor: 'rgb(255, 255, 255)'
      },
      yearLabel: { show: false }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: getYearlyData('2025')
    },
    // 添加文章总数显示
    graphic: {
      elements: [
        {
          type: 'text',
          right: 32,
          bottom: 160,
          style: {
            text: `total: ${articleCount.value}`,
            font: '14px sans-serif',
            fill: '#333'
          }
        }
      ]
    }
  })
}


// 通知管理
const notificationList = ref([
  { type: '评论通知', count: 20, color: '#3B82F6', icon: 'ChatDotRound' },
  { type: '互动通知', count: 15, color: '#F59E0B', icon: 'Star' },
  { type: '订阅通知', count: 10, color: '#EC4899', icon: 'Bell' },
  { type: '友链申请', count: 35, color: '#10B981', icon: 'Link' }
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
            <p class="text-2xl font-bold">{{ topData.view.total }}</p>
          </div>
          <div :class="topData.view.rate >= 0 ? 'text-green-500' : 'text-red-500'">
            <span>{{ topData.view.rate >= 0 ? '↑' : '↓' }}{{ Math.abs(topData.view.rate) }}%</span>
          </div>
        </div>
        <div id="viewChart" class="h-16 w-full"></div>
      </div>

      <!-- 访问量卡片 -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="mb-4">
          <h3 class="text-gray-500">总访问量</h3>
          <p class="text-2xl font-bold">{{ topData.visit.total }}</p>
        </div>
        <div id="visitChart" class="h-16 w-full"></div>
      </div>

      <!-- 评论数卡片 -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="mb-4">
          <h3 class="text-gray-500">总评论数</h3>
          <p class="text-2xl font-bold">{{ topData.comment.total }}</p>
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
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 热力图表 -->
      <div class="lg:col-span-3 bg-white p-4 rounded-lg shadow">
        <div id="articleChart" class="w-full h-64"></div>
      </div>
      <!-- 通知管理 -->
      <div class="lg:col-span-1 bg-white p-4 rounded-lg shadow">
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

    <!-- 用户访问的热点地图 中国地图 -->

  </div>
</template>

<style scoped>
</style>