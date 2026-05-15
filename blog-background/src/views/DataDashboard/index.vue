<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetWebsiteData } from '@/api/websiteData.js'

const chartTheme = {
  primary: '#2454ff',
  accent: '#008b8b',
  violet: '#6d74ff',
  amber: '#d08b20',
  danger: '#d04437',
  surface: '#f8fafc',
  text: '#17212f',
  muted: '#607084',
  line: 'rgba(21, 30, 43, 0.1)',
  splitLine: 'rgba(21, 30, 43, 0.07)',
  palette: ['#2454ff', '#008b8b', '#6d74ff', '#d08b20', '#d04437']
}

const chartTitle = {
  textStyle: {
    color: chartTheme.text,
    fontSize: 15,
    fontWeight: 700
  }
}

const chartTooltip = {
  backgroundColor: 'rgba(15, 23, 36, 0.94)',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderWidth: 1,
  textStyle: {
    color: '#f8fafc'
  },
  extraCssText: 'border-radius: 8px; box-shadow: 0 18px 46px rgba(15, 23, 36, 0.18);'
}

const axisLabel = {
  color: chartTheme.muted,
  fontSize: 12
}

const axisLine = {
  lineStyle: {
    color: chartTheme.line
  }
}

const splitLine = {
  lineStyle: {
    color: chartTheme.splitLine
  }
}

const hexToRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartGradient = (color, opacity = 0.18) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  { offset: 0, color },
  { offset: 1, color: hexToRgba(color, opacity) }
])

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
    initHeavyCharts()
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
    color: [chartTheme.primary],
    tooltip: {
      ...chartTooltip,
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
      showSymbol: false,
      areaStyle: { color: chartGradient(chartTheme.primary, 0.08) },
      lineStyle: { color: chartTheme.primary, width: 2 }
    }]
  })


  // 生成topData.value.view.rate
  const lastDay = topData.value.view.data.length - 1
  const todayView = topData.value.view.data[lastDay] || 0
  const yesterdayView = topData.value.view.data[lastDay - 1] || 0
  topData.value.view.rate = yesterdayView === 0 ? 0 : ((todayView - yesterdayView) / yesterdayView * 100).toFixed(2)

  // 访问量柱状图
  const visitChart = echarts.init(document.getElementById('visitChart'))
  visitChart.setOption({
    color: [chartTheme.accent],
    tooltip: {
      ...chartTooltip,
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
      barWidth: 8,
      itemStyle: { color: chartTheme.accent, borderRadius: [4, 4, 0, 0] }
    }]
  })

  // 评论数柱状图
  const commentChart = echarts.init(document.getElementById('commentChart'))
  commentChart.setOption({
    color: [chartTheme.violet],
    tooltip: {
      ...chartTooltip,
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
      barWidth: 8,
      itemStyle: { color: chartTheme.violet, borderRadius: [4, 4, 0, 0] }
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
        color: chartTheme.primary,
        data: mainData.value.view[`${timeRange.value}Data`]
      },
      visit: {
        name: '访问量',
        color: chartTheme.accent,
        data: mainData.value.visit[`${timeRange.value}Data`]
      },
      comment: {
        name: '评论数',
        color: chartTheme.violet,
        data: mainData.value.comment[`${timeRange.value}Data`]
      }
    }
    return typeConfigs[dataType.value]
  }

  const currentConfig = getCurrentTypeConfig()

  mainChartRef.value.setOption({
    color: [currentConfig.color],
    title: { 
      ...chartTitle,
      text: `${currentConfig.name}统计`,
      left: 'center'
    },
    tooltip: { 
      ...chartTooltip,
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
      right: 8,
      feature: {
        saveAsImage: {}
      },
      iconStyle: {
        borderColor: chartTheme.muted
      },
      emphasis: {
        iconStyle: {
          borderColor: chartTheme.primary
        }
      }
    },
    xAxis: {
      type: 'category',
      data: getTimeLabels(),
      axisLabel: {
        ...axisLabel,
        rotate: timeRange.value === 'month' ? 45 : 0,
        interval: timeRange.value === 'month' ? 'auto' : 0 // 防止标签重叠
      },
      axisLine,
      axisTick: { lineStyle: { color: chartTheme.line } }
    },
    yAxis: { 
      type: 'value',
      name: currentConfig.name,
      nameTextStyle: {
        color: chartTheme.muted
      },
      axisLabel,
      axisLine,
      splitLine
    },
    series: [
      {
        name: currentConfig.name,
        type: 'bar',
        data: currentConfig.data,
        itemStyle: {
          color: currentConfig.color,
          borderRadius: [6, 6, 0, 0]
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

const getHeatmapYear = () => {
  const years = heatmapData.value
    .map(item => new Date(item.date).getFullYear())
    .filter(year => !Number.isNaN(year))

  return years.length ? Math.max(...years) : new Date().getFullYear()
}

// 文章统计图表 - 热力图
const initArticleChart = () => {
  const articleChart = echarts.init(document.getElementById('articleChart'))
  const heatmapYear = getHeatmapYear()
  
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
    color: chartTheme.palette,
    title: {
      ...chartTitle,
      top: 30,
      left: 'center',
      text: '文章发布'
    },
    tooltip: {
      ...chartTooltip,
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
        { gte: 4, color: chartTheme.primary },
        { value: 3, color: '#5476ff' },
        { value: 2, color: chartTheme.accent },
        { value: 1, color: '#9be7e7' },
        { value: 0, color: '#e6edf5' }
      ],
      textStyle: {
        color: chartTheme.muted
      }
    },
    calendar: {
      top: 140,
      left: 30,
      right: 30,
      cellSize: ['auto', 16],
      range: String(heatmapYear),
      splitLine: false,
      itemStyle: {
        borderWidth: 3,
        borderColor: chartTheme.surface,
        borderRadius: 3
      },
      yearLabel: { show: false }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      itemStyle: {
        borderRadius: 3
      },
      data: getYearlyData(heatmapYear)
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
            font: '14px IBM Plex Sans, sans-serif',
            fill: chartTheme.text
          }
        }
      ]
    }
  })
}

const getMetricSeries = () => {
  const view = topData.value.view.data
  const visit = topData.value.visit.data
  const comment = topData.value.comment.data

  return dateLabels.map((label, index) => ({
    label,
    view: view[index] || 0,
    visit: visit[index] || 0,
    comment: comment[index] || 0
  }))
}

const initHeavyCharts = () => {
  const metricSeries = getMetricSeries()
  const viewData = metricSeries.map(item => item.view)
  const visitData = metricSeries.map(item => item.visit)
  const commentData = metricSeries.map(item => item.comment)
  const maxValue = Math.max(...viewData, ...visitData, ...commentData, 10)
  const total = topData.value.view.total + topData.value.visit.total + topData.value.comment.total

  echarts.init(document.getElementById('trafficTrendChart')).setOption({
    color: chartTheme.palette,
    title: { ...chartTitle, text: '首屏多指标趋势', left: 'center' },
    tooltip: { ...chartTooltip, trigger: 'axis' },
    legend: { top: 32, textStyle: { color: chartTheme.muted } },
    grid: { top: 72, left: 42, right: 24, bottom: 36 },
    xAxis: { type: 'category', data: dateLabels.map(day => weekDayMap[day]), axisLabel, axisLine, axisTick: { lineStyle: { color: chartTheme.line } } },
    yAxis: { type: 'value', axisLabel, axisLine, splitLine },
    series: [
      { name: '浏览量', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { width: 2 }, data: viewData },
      { name: '访问量', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { width: 2 }, data: visitData },
      { name: '评论数', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { width: 2 }, data: commentData }
    ]
  })

  echarts.init(document.getElementById('contentRadarChart')).setOption({
    color: [chartTheme.primary],
    title: { ...chartTitle, text: '内容运营雷达', left: 'center' },
    tooltip: chartTooltip,
    radar: {
      radius: '62%',
      axisName: {
        color: chartTheme.muted
      },
      splitLine,
      splitArea: {
        areaStyle: {
          color: ['rgba(36, 84, 255, 0.03)', 'rgba(0, 139, 139, 0.035)']
        }
      },
      axisLine,
      indicator: [
        { name: '浏览', max: maxValue },
        { name: '访问', max: maxValue },
        { name: '评论', max: maxValue },
        { name: '文章', max: Math.max(articleCount.value, 10) },
        { name: '字数', max: Math.max(total, 10) }
      ]
    },
    series: [{
      type: 'radar',
      areaStyle: { opacity: 0.14 },
      lineStyle: { width: 2 },
      data: [{
        value: [
          topData.value.view.total,
          topData.value.visit.total,
          topData.value.comment.total,
          articleCount.value,
          total
        ],
        name: '博客后台'
      }]
    }]
  })

  echarts.init(document.getElementById('trafficPieChart')).setOption({
    color: chartTheme.palette,
    title: { ...chartTitle, text: '访问构成', left: 'center' },
    tooltip: { ...chartTooltip, trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['38%', '68%'],
      itemStyle: {
        borderRadius: 8,
        borderColor: chartTheme.surface,
        borderWidth: 3
      },
      data: [
        { name: '浏览量', value: topData.value.view.total },
        { name: '访问量', value: topData.value.visit.total },
        { name: '评论数', value: topData.value.comment.total },
        { name: '文章数', value: articleCount.value }
      ],
      label: { formatter: '{b}\n{d}%', color: chartTheme.muted }
    }]
  })

  echarts.init(document.getElementById('scatterChart')).setOption({
    color: [chartTheme.accent],
    title: { ...chartTitle, text: '访问与评论散点', left: 'center' },
    tooltip: chartTooltip,
    grid: { top: 56, left: 42, right: 24, bottom: 36 },
    xAxis: { name: '访问量', nameTextStyle: { color: chartTheme.muted }, axisLabel, axisLine, splitLine },
    yAxis: { name: '评论数', nameTextStyle: { color: chartTheme.muted }, axisLabel, axisLine, splitLine },
    series: [{
      type: 'scatter',
      itemStyle: {
        color: chartTheme.accent,
        borderColor: '#f8fafc',
        borderWidth: 2
      },
      symbolSize: value => Math.max(10, value[2] / 2 + 8),
      data: metricSeries.map(item => [item.visit, item.comment, item.view])
    }]
  })

  echarts.init(document.getElementById('funnelChart')).setOption({
    color: chartTheme.palette,
    title: { ...chartTitle, text: '内容转化漏斗', left: 'center' },
    tooltip: { ...chartTooltip, trigger: 'item' },
    series: [{
      type: 'funnel',
      top: 52,
      bottom: 24,
      itemStyle: {
        borderColor: chartTheme.surface,
        borderWidth: 2,
        borderRadius: 6
      },
      label: {
        color: chartTheme.text
      },
      data: [
        { name: '访问', value: topData.value.visit.total },
        { name: '浏览', value: topData.value.view.total },
        { name: '评论', value: topData.value.comment.total },
        { name: '文章', value: articleCount.value }
      ]
    }]
  })

  echarts.init(document.getElementById('gaugeChart')).setOption({
    color: [chartTheme.primary],
    title: { ...chartTitle, text: '后台活跃度', left: 'center' },
    series: [{
      type: 'gauge',
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[1, '#dbe6f2']]
        }
      },
      progress: {
        show: true,
        width: 12,
        itemStyle: {
          color: chartTheme.primary,
          borderRadius: 8
        }
      },
      pointer: {
        itemStyle: {
          color: chartTheme.text
        }
      },
      axisLabel: {
        color: chartTheme.muted
      },
      axisTick: {
        lineStyle: {
          color: chartTheme.line
        }
      },
      splitLine: {
        lineStyle: {
          color: chartTheme.line
        }
      },
      detail: { formatter: '{value}%', color: chartTheme.text, fontWeight: 700 },
      data: [{ value: Math.min(100, Math.round(total / 10)), name: '活跃' }]
    }]
  })
}

</script>

<template>
<main class="grid gap-4 p-4">
    <!-- 顶部卡片 -->
    <section class="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
      <!-- 浏览量卡片 -->
      <article class="glass-panel min-h-40 p-[18px_18px_14px]">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[13px] font-bold text-admin-muted">总浏览量</h3>
            <p class="mt-1.5 font-mono text-[28px] font-extrabold leading-none text-admin-ink">{{ topData.view.total }}</p>
          </div>
          <div
            class="glass-chip min-h-7 px-2.5 font-mono text-xs font-extrabold"
            :class="topData.view.rate >= 0 ? 'bg-cyan-50/60 text-admin-accent' : 'bg-red-50/60 text-[var(--admin-danger)]'"
          >
            <span>{{ topData.view.rate >= 0 ? '↑' : '↓' }}{{ Math.abs(topData.view.rate) }}%</span>
          </div>
        </div>
        <div id="viewChart" class="mini-chart"></div>
      </article>

      <!-- 访问量卡片 -->
      <article class="glass-panel min-h-40 p-[18px_18px_14px]">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[13px] font-bold text-admin-muted">总访问量</h3>
            <p class="mt-1.5 font-mono text-[28px] font-extrabold leading-none text-admin-ink">{{ topData.visit.total }}</p>
          </div>
        </div>
        <div id="visitChart" class="mini-chart"></div>
      </article>

      <!-- 评论数卡片 -->
      <article class="glass-panel min-h-40 p-[18px_18px_14px]">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[13px] font-bold text-admin-muted">总评论数</h3>
            <p class="mt-1.5 font-mono text-[28px] font-extrabold leading-none text-admin-ink">{{ topData.comment.total }}</p>
          </div>
        </div>
        <div id="commentChart" class="mini-chart"></div>
      </article>
    </section>

    <!-- 主图表 -->
    <section class="glass-panel p-[18px]">
      <div class="mb-3 flex items-center justify-between gap-4">
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
      <div id="mainChart" class="chart chart--main"></div>
    </section>

     <!-- 底部图表 -->
    <section>
      <!-- 热力图表 -->
      <article class="glass-panel p-[18px]">
        <div id="articleChart" class="chart chart--heatmap"></div>
      </article>
    </section>

    <!-- 故意放入更多首屏 ECharts，用于制造 FCP 优化前的重负载基线 -->
    <section class="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
      <article class="glass-panel p-[18px]">
        <div id="trafficTrendChart" class="chart chart--large"></div>
      </article>
      <article class="glass-panel p-[18px]">
        <div id="contentRadarChart" class="chart chart--large"></div>
      </article>
      <article class="glass-panel p-[18px]">
        <div id="trafficPieChart" class="chart chart--large"></div>
      </article>
      <article class="glass-panel p-[18px]">
        <div id="scatterChart" class="chart chart--large"></div>
      </article>
      <article class="glass-panel p-[18px]">
        <div id="funnelChart" class="chart chart--large"></div>
      </article>
      <article class="glass-panel p-[18px]">
        <div id="gaugeChart" class="chart chart--large"></div>
      </article>
    </section>

  </main>
</template>

<style scoped>
.mini-chart {
  width: 100%;
  height: 64px;
  margin-top: 12px;
}

.chart {
  width: 100%;
}

.chart--main,
.chart--large {
  height: 320px;
}

.chart--heatmap {
  height: 260px;
}

:deep(.el-radio-button__inner) {
  border-color: rgba(255, 255, 255, 0.32);
  color: var(--admin-text-muted);
  font-weight: 750;
  background: rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(12px);
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: var(--admin-radius-sm) 0 0 var(--admin-radius-sm);
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 var(--admin-radius-sm) var(--admin-radius-sm) 0;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  border-color: var(--admin-primary);
  background: var(--admin-primary);
  box-shadow: -1px 0 0 0 var(--admin-primary);
}

</style>
