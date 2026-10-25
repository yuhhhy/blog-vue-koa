<script setup>
import { Chart } from 'frappe-charts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetWebsiteData } from '@/api/websiteData.js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import {
  mdiAccountGroupOutline,
  mdiCommentTextMultipleOutline,
  mdiEyeOutline
} from '@mdi/js'

const chartTheme = {
  primary: '#6750a4',
  accent: '#4f6350',
  violet: '#7d5260'
}

const charts = new Map()
const chartLoading = ref({
  view: true,
  visit: true,
  comment: true,
  main: true,
  article: true
})
const chartReadyFrames = new Map()
let currentMainChartMax = 1
let yAxisRestoreTimer = null
let heatmapFitTimer = null
let resizeRestoreTimer = null

const setChartLoading = (key, value) => {
  chartLoading.value[key] = value
}

const setAllChartsLoading = value => {
  Object.keys(chartLoading.value).forEach(key => setChartLoading(key, value))
}

const revealChartWhenReady = (key, elementId, attempts = 0, readyFrames = 0) => {
  window.cancelAnimationFrame(chartReadyFrames.get(key))

  const frame = window.requestAnimationFrame(() => {
    const element = document.getElementById(elementId)
    const svg = element?.querySelector('svg')
    const hasDataPlot = element?.querySelector('.line-graph-path, .bar')

    if ((!svg || !hasDataPlot || readyFrames < 1) && attempts < 60) {
      revealChartWhenReady(
        key,
        elementId,
        attempts + 1,
        svg && hasDataPlot ? readyFrames + 1 : 0
      )
      return
    }

    chartReadyFrames.delete(key)
    setChartLoading(key, false)
  })

  chartReadyFrames.set(key, frame)
}

const formatMetric = value => new Intl.NumberFormat('zh-CN').format(value || 0)

const getNiceAxisMax = value => {
  const source = Math.max(Number(value) || 0, 1)
  const magnitude = 10 ** Math.floor(Math.log10(source))
  const step = magnitude / 5

  return Math.ceil((source + Number.EPSILON) / step) * step
}

const scaleChartValues = (values, useFullRange = false, maxOverride = null) => {
  const source = values.map(value => Number(value) || 0)
  const dataMax = Math.max(...source, 1)
  const max = Math.max(Number(maxOverride) || dataMax, dataMax)
  const min = Math.min(...source)
  const range = Math.max(max - min, 1)
  const scaled = source.map(value => {
    if (useFullRange) return Number((8 + ((value - min) / range) * 84).toFixed(2))
    return Number(((value / max) * 100).toFixed(2))
  })

  const getOriginalValue = scaledValue => {
    const closestIndex = scaled.reduce((bestIndex, value, index) => (
      Math.abs(value - scaledValue) < Math.abs(scaled[bestIndex] - scaledValue) ? index : bestIndex
    ), 0)
    return source[closestIndex]
  }

  return { scaled, max, getOriginalValue }
}

const restoreYAxisLabels = (element, max, onComplete) => {
  requestAnimationFrame(() => {
    const tickGroups = [...element.querySelectorAll('.y.axis > g')]

    tickGroups.forEach((group, index) => {
      const label = group.querySelector('text')

      if (label && !label.dataset.valueRestored) {
        const percentage = Number(label.textContent)
        if (!Number.isNaN(percentage)) {
          label.textContent = formatMetric(Math.round((percentage / 100) * max))
          label.dataset.valueRestored = 'true'
        }
      }

      const isHighestTick = index === tickGroups.length - 1
      group.style.display = isHighestTick ? '' : 'none'

      if (isHighestTick && label?.dataset.valueRestored) {
        group.dataset.axisReady = 'true'
      }
    })

    onComplete?.()
  })
}

const fitArticleChart = onComplete => {
  requestAnimationFrame(() => {
    const element = document.getElementById('articleChart')
    const container = element?.querySelector('.chart-container')
    const svg = element?.querySelector('svg')
    const plot = svg?.querySelector('.heatmap-chart')
    const legend = svg?.querySelector('.chart-legend')

    if (!element || !container || !svg || !plot) {
      onComplete?.()
      return
    }

    const baseTransform = plot.dataset.baseTransform || plot.getAttribute('transform') || ''
    const baseWidth = Number(svg.dataset.baseWidth || svg.getAttribute('width') || 860)
    plot.dataset.baseTransform = baseTransform
    svg.dataset.baseWidth = String(baseWidth)
    plot.setAttribute('transform', baseTransform)

    const svgRect = svg.getBoundingClientRect()
    const plotRect = plot.getBoundingClientRect()
    const translateMatch = baseTransform.match(/translate\(\s*([\d.-]+)[,\s]+([\d.-]+)\s*\)/)
    const baseX = Number(translateMatch?.[1] || 0)
    const baseY = Number(translateMatch?.[2] || 0)
    const localX = plotRect.left - svgRect.left - baseX
    const localY = plotRect.top - svgRect.top - baseY
    const edge = 12
    const renderWidth = Math.max(element.clientWidth, baseWidth)
    const scale = Math.max(1, (renderWidth - edge * 2) / plotRect.width)
    const translateX = edge - localX * scale
    const translateY = edge - localY * scale

    element.style.overflowX = renderWidth > element.clientWidth ? 'auto' : 'hidden'
    container.style.width = `${renderWidth}px`
    svg.setAttribute('width', String(renderWidth))
    svg.style.width = `${renderWidth}px`
    plot.setAttribute(
      'transform',
      `translate(${translateX} ${translateY}) scale(${scale})`
    )
    plot.querySelectorAll('.domain-name, .subdomain-name').forEach(label => {
      label.style.fontSize = `${12 / scale}px`
    })

    if (legend) {
      legend.setAttribute('transform', `translate(${Math.max(edge, translateX)} 164)`)
    }

    onComplete?.()
  })
}

const queueArticleChartFit = () => {
  fitArticleChart()
  window.clearTimeout(heatmapFitTimer)
  heatmapFitTimer = window.setTimeout(() => {
    heatmapFitTimer = null
    fitArticleChart(() => setChartLoading('article', false))
  }, 750)
}

const restoreMainYAxis = onComplete => {
  const element = document.getElementById('mainChart')
  if (element) restoreYAxisLabels(element, currentMainChartMax, onComplete)
  else onComplete?.()
}

const queueYAxisRestore = () => {
  restoreMainYAxis()
  window.clearTimeout(yAxisRestoreTimer)
  yAxisRestoreTimer = window.setTimeout(() => {
    yAxisRestoreTimer = null
    restoreMainYAxis(() => setChartLoading('main', false))
  }, 750)
}

const handleChartResize = () => {
  window.clearTimeout(resizeRestoreTimer)
  resizeRestoreTimer = window.setTimeout(() => {
    restoreMainYAxis()
    fitArticleChart()
  }, 100)
}

const replaceChart = (key, elementId, options) => {
  charts.get(key)?.destroy()
  const element = document.getElementById(elementId)

  if (!element) return

  const chart = new Chart(element, {
    animate: 0,
    ...options
  })

  // Axis charts initially render Frappe's zero-value seed and update after 700ms.
  // Apply the real dataset synchronously so that intermediate state stays behind loading.
  if (options.type === 'line' || options.type === 'bar') {
    chart.update(options.data)
  }

  charts.set(key, chart)
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleChartResize)
})

onBeforeUnmount(() => {
  window.clearTimeout(yAxisRestoreTimer)
  window.clearTimeout(heatmapFitTimer)
  chartReadyFrames.forEach(frame => window.cancelAnimationFrame(frame))
  chartReadyFrames.clear()
  window.clearTimeout(resizeRestoreTimer)
  window.removeEventListener('resize', handleChartResize)
  charts.forEach(chart => chart.destroy())
  charts.clear()
})

// 获取初始化数据
async function fetchData() {
  setAllChartsLoading(true)

  try {
    const data = await apiGetWebsiteData('week')

    // 更新顶部统计数据
    Object.assign(topData.value.view, data.view)
    Object.assign(topData.value.visit, data.visit)
    Object.assign(topData.value.comment, data.comment)


    // 更新主图表初始数据
    mainData.value.view.weekData = data.view.data

    // 更新热力图表数据
    heatmapData.value = data.article.data
    articleCount.value = data.article.total 

    await nextTick()
    initTopCards()
    initMainChart()
    initArticleChart()
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('数据获取失败')
    setAllChartsLoading(false)
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
  setChartLoading('view', true)
  setChartLoading('visit', true)
  setChartLoading('comment', true)

  const miniChartOptions = {
    height: 120,
    axisOptions: {
      xAxisMode: 'tick',
      yAxisMode: 'span',
      xIsSeries: 1
    },
    tooltipOptions: {
      formatTooltipY: value => String(value)
    }
  }

  const viewSeries = scaleChartValues(topData.value.view.data, true)
  const visitSeries = scaleChartValues(topData.value.visit.data)
  const commentSeries = scaleChartValues(topData.value.comment.data)

  replaceChart('view', 'viewChart', {
    ...miniChartOptions,
    type: 'line',
    colors: [chartTheme.primary],
    data: {
      labels: dateLabels,
      datasets: [{ name: '浏览量', values: viewSeries.scaled }]
    },
    lineOptions: {
      hideDots: 1,
      regionFill: 1,
      spline: 1
    },
    tooltipOptions: {
      formatTooltipY: value => formatMetric(viewSeries.getOriginalValue(value))
    }
  })

  const lastDay = topData.value.view.data.length - 1
  const todayView = topData.value.view.data[lastDay] || 0
  const yesterdayView = topData.value.view.data[lastDay - 1] || 0
  topData.value.view.rate = yesterdayView === 0 ? 0 : ((todayView - yesterdayView) / yesterdayView * 100).toFixed(2)

  replaceChart('visit', 'visitChart', {
    ...miniChartOptions,
    type: 'bar',
    colors: [chartTheme.accent],
    data: {
      labels: dateLabels,
      datasets: [{ name: '访问量', values: visitSeries.scaled }]
    },
    barOptions: { spaceRatio: 0.55 },
    tooltipOptions: {
      formatTooltipY: value => formatMetric(visitSeries.getOriginalValue(value))
    }
  })

  replaceChart('comment', 'commentChart', {
    ...miniChartOptions,
    type: 'bar',
    colors: [chartTheme.violet],
    data: {
      labels: dateLabels,
      datasets: [{ name: '评论数', values: commentSeries.scaled }]
    },
    barOptions: { spaceRatio: 0.55 },
    tooltipOptions: {
      formatTooltipY: value => formatMetric(commentSeries.getOriginalValue(value))
    }
  })

  revealChartWhenReady('view', 'viewChart')
  revealChartWhenReady('visit', 'visitChart')
  revealChartWhenReady('comment', 'commentChart')
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
  }
})

// 时间范围选择
const timeRange = ref('week')
const timeRanges = [
  { label: '七日', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

watch(timeRange, async () => {
  setChartLoading('main', true)

  try {
    if (timeRange.value !== 'week') {
      if (mainData.value.view.monthData.length === 0 && timeRange.value === 'month') {
        // 获取month数据
        const dataMonth = await apiGetWebsiteData(timeRange.value)
        mainData.value.view.monthData = dataMonth.view.data
      }
      if (mainData.value.view.yearData.length === 0 && timeRange.value === 'year') {
        // 获取year数据
        const dataYear = await apiGetWebsiteData(timeRange.value)
        mainData.value.view.yearData = dataYear.view.data
      }
      // 重新渲染MainChart
      initMainChart()
    } else {
      initMainChart()
    }
  } catch (error) {
    console.error('更新主图表失败:', error)
    ElMessage.error('更新主图表失败')
    setChartLoading('main', false)
  }
})

// 初始化主图表
const initMainChart = () => {
  setChartLoading('main', true)

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

  const currentData = mainData.value.view[`${timeRange.value}Data`]
  const dataMax = Math.max(...currentData.map(value => Number(value) || 0), 1)
  const chartSeries = scaleChartValues(currentData, false, getNiceAxisMax(dataMax))
  currentMainChartMax = chartSeries.max

  replaceChart('main', 'mainChart', {
    type: 'bar',
    height: 300,
    colors: [chartTheme.primary],
    data: {
      labels: getTimeLabels(),
      datasets: [{
        name: '浏览量',
        values: chartSeries.scaled
      }]
    },
    axisOptions: {
      xAxisMode: 'tick',
      yAxisMode: 'span',
      xIsSeries: 1,
      shortenYAxisNumbers: 1
    },
    barOptions: {
      spaceRatio: timeRange.value === 'month' ? 0.35 : 0.5
    },
    tooltipOptions: {
      formatTooltipY: value => formatMetric(chartSeries.getOriginalValue(value))
    }
  })

  queueYAxisRestore()
}

const heatmapData = ref([])
const articleCount = ref(0)

const getHeatmapYear = () => {
  const years = heatmapData.value
    .map(item => new Date(item.date).getFullYear())
    .filter(year => !Number.isNaN(year))

  return years.length ? Math.max(...years) : new Date().getFullYear()
}

const heatmapYearArticleCount = computed(() => {
  const heatmapYear = getHeatmapYear()

  return heatmapData.value.reduce((total, item) => {
    const date = new Date(item.date)

    if (Number.isNaN(date.getTime()) || date.getFullYear() !== heatmapYear) {
      return total
    }

    return total + (Number(item.count) || 0)
  }, 0)
})

// 文章统计图表 - 热力图
const initArticleChart = () => {
  setChartLoading('article', true)

  const heatmapYear = getHeatmapYear()
  const dataPoints = Object.fromEntries(
    heatmapData.value
      .filter(item => new Date(item.date).getFullYear() === heatmapYear)
      .map(item => {
        const date = new Date(item.date)
        const dateKey = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-')

        return [dateKey, item.count]
      })
  )

  replaceChart('article', 'articleChart', {
    type: 'heatmap',
    height: 190,
    radius: 3,
    discreteDomains: 1,
    countLabel: '篇文章',
    colors: ['#f7f2fa', '#eaddff', '#d0bcff', '#9a82db', chartTheme.primary],
    data: {
      start: new Date(heatmapYear, 0, 1),
      end: new Date(heatmapYear, 11, 31),
      dataPoints
    }
  })

  queueArticleChartFit()
}

</script>

<template>
<main class="dashboard-page">
    <!-- 顶部卡片 -->
    <section class="metric-grid" aria-label="核心指标">
      <!-- 浏览量卡片 -->
      <article class="material-card metric-card metric-card--primary">
        <div class="metric-header">
          <div class="metric-icon"><MaterialIcon :path="mdiEyeOutline" /></div>
          <div class="metric-copy">
            <h3>总浏览量</h3>
            <p>{{ formatMetric(topData.view.total) }}</p>
          </div>
          <div
            class="metric-rate"
            :class="topData.view.rate >= 0 ? 'metric-rate--positive' : 'metric-rate--negative'"
          >
            <span>{{ topData.view.rate >= 0 ? '↑' : '↓' }}{{ Math.abs(topData.view.rate) }}%</span>
          </div>
        </div>
        <div id="viewChart" class="mini-chart" :class="{ 'is-loading': chartLoading.view }"></div>
        <div v-if="chartLoading.view" class="chart-loading chart-loading--mini" role="status" aria-label="总浏览量图表加载中">
          <span class="chart-loading__spinner"></span>
        </div>
      </article>

      <!-- 访问量卡片 -->
      <article class="material-card metric-card metric-card--tertiary">
        <div class="metric-header">
          <div class="metric-icon"><MaterialIcon :path="mdiAccountGroupOutline" /></div>
          <div class="metric-copy">
            <h3>总访问量</h3>
            <p>{{ formatMetric(topData.visit.total) }}</p>
          </div>
          <span class="metric-period">近 7 日</span>
        </div>
        <div id="visitChart" class="mini-chart" :class="{ 'is-loading': chartLoading.visit }"></div>
        <div v-if="chartLoading.visit" class="chart-loading chart-loading--mini" role="status" aria-label="总访问量图表加载中">
          <span class="chart-loading__spinner"></span>
        </div>
      </article>

      <!-- 评论数卡片 -->
      <article class="material-card metric-card metric-card--secondary">
        <div class="metric-header">
          <div class="metric-icon"><MaterialIcon :path="mdiCommentTextMultipleOutline" /></div>
          <div class="metric-copy">
            <h3>总评论数</h3>
            <p>{{ formatMetric(topData.comment.total) }}</p>
          </div>
          <span class="metric-period">近 7 日</span>
        </div>
        <div id="commentChart" class="mini-chart" :class="{ 'is-loading': chartLoading.comment }"></div>
        <div v-if="chartLoading.comment" class="chart-loading chart-loading--mini" role="status" aria-label="总评论数图表加载中">
          <span class="chart-loading__spinner"></span>
        </div>
      </article>
    </section>

    <!-- 主图表 -->
    <section class="material-card chart-card">
      <div class="section-header">
        <div>
          <h2 class="chart-heading">浏览量趋势</h2>
        </div>

        <div
          class="range-switch"
          :class="`range-switch--${timeRange}`"
          role="group"
          aria-label="统计时间范围"
        >
          <button
            v-for="range in timeRanges"
            :key="range.value"
            type="button"
            :class="{ 'is-active': timeRange === range.value }"
            :aria-pressed="timeRange === range.value"
            @click="timeRange = range.value"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
      <div
        id="mainChart"
        class="chart chart--main"
        :class="{ 'is-loading': chartLoading.main }"
      ></div>
      <div
        v-if="chartLoading.main"
        class="chart-loading chart-loading--main"
        role="status"
        aria-label="浏览量趋势图表加载中"
      >
        <span class="chart-loading__spinner"></span>
      </div>
    </section>

    <!-- 底部图表 -->
    <section class="material-card chart-card article-card">
      <div class="section-header">
        <div>
          <h2 class="chart-heading">文章发布热力图</h2>
        </div>
        <div class="article-stats" aria-label="文章发布统计">
          <span class="article-year-total">
            <strong>{{ getHeatmapYear() }}</strong>
            <span>{{ formatMetric(heatmapYearArticleCount) }} 篇</span>
          </span>
          <span class="article-total">累计 {{ formatMetric(articleCount) }} 篇</span>
        </div>
      </div>
      <div id="articleChart" class="chart chart--heatmap" :class="{ 'is-loading': chartLoading.article }"></div>
      <div v-if="chartLoading.article" class="chart-loading chart-loading--heatmap" role="status" aria-label="文章发布图表加载中">
        <span class="chart-loading__spinner"></span>
      </div>
    </section>

  </main>
</template>

<style scoped>
.mini-chart {
  width: calc(100% + 36px);
  height: 120px;
  margin-top: 8px;
  margin-left: -18px;
  overflow: visible;
}

.chart {
  width: 100%;
}

.chart--main {
  height: 300px;
}

.chart--heatmap {
  height: 190px;
  container-type: inline-size;
}

.mini-chart.is-loading,
.chart.is-loading {
  opacity: 0;
}

.chart-loading {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
  background: var(--admin-surface);
}

.chart-loading--mini {
  right: 18px;
  bottom: 12px;
  left: 18px;
  height: 120px;
}

.chart-loading--main {
  right: 20px;
  bottom: 20px;
  left: 20px;
  height: 300px;
}

.chart-loading--heatmap {
  right: 20px;
  bottom: 20px;
  left: 20px;
  height: 190px;
}

.chart-loading__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--admin-primary-soft);
  border-top-color: var(--admin-primary);
  border-radius: 50%;
  animation: chart-loading-spin 700ms linear infinite;
}

@keyframes chart-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.chart-heading {
  margin: 0;
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
}

.article-stats,
.article-year-total,
.article-total {
  display: inline-flex;
  align-items: center;
}

.article-stats {
  gap: 8px;
}

.article-year-total,
.article-total {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.article-year-total {
  gap: 6px;
  color: var(--admin-on-primary-soft);
  background: var(--admin-primary-soft);
}

.article-year-total strong {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.article-year-total span {
  padding-left: 6px;
  border-left: 1px solid color-mix(in srgb, var(--admin-on-primary-soft) 22%, transparent);
}

.article-total {
  color: var(--admin-text-muted);
  background: var(--admin-surface-muted);
}

.metric-rate {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.metric-rate--positive {
  color: #1c4d22;
  background: #d3e8d0;
}

.metric-rate--negative {
  color: #93000a;
  background: var(--admin-danger-soft);
}

:deep(.chart-container) {
  font-family: inherit;
}

:deep(.chart-container .chart-label) {
  fill: #625f69;
  font-family: inherit;
  font-size: 12px;
}

:deep(.chart-container .line-vertical),
:deep(.chart-container .line-horizontal) {
  stroke: #e7e0ec;
}

:deep(.chart-container .graph-svg-tip) {
  border: 0;
  border-radius: 8px;
  background: rgba(15, 23, 36, 0.94);
  box-shadow: 0 18px 46px rgba(15, 23, 36, 0.18);
}

.chart--heatmap :deep(.graph-svg-tip) {
  box-sizing: border-box;
  max-width: calc(100cqw - 16px);
  white-space: normal;
}

:deep(.graph-svg-tip .svg-pointer) {
  border-top-color: rgba(33, 31, 38, 0.96);
}

.mini-chart :deep(.x.axis),
.mini-chart :deep(.y.axis),
.mini-chart :deep(.chart-label),
.mini-chart :deep(.line-vertical),
.mini-chart :deep(.line-horizontal) {
  opacity: 0;
}

.mini-chart :deep(.dataset-path) {
  stroke-width: 2.5px;
}

.mini-chart :deep(.bar) {
  rx: 4px;
  ry: 4px;
}

.chart--main :deep(.bar) {
  rx: 6px;
  ry: 6px;
}

.chart--main :deep(.x.axis text),
.chart--main :deep(.y.axis text) {
  font-size: 12px;
}

.chart--main :deep(.y.axis > g:not(:last-child)) {
  display: none;
}

.chart--main :deep(.y.axis > g:last-child:not([data-axis-ready])) {
  display: none;
}

.chart--heatmap :deep(.chart-container) {
  min-width: 0;
}

.chart--heatmap :deep(.subdomain-name),
.chart--heatmap :deep(.domain-name) {
  fill: var(--admin-text-muted);
  font-family: inherit;
}

.chart--heatmap :deep(.chart-legend text) {
  font-family: inherit;
  font-size: 12px;
}

.dashboard-page {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 28px;
}

.section-header,
.metric-header {
  display: flex;
  align-items: center;
}

.section-header,
.metric-header {
  justify-content: space-between;
}

.material-card {
  border: 1px solid #e7e0ec;
  border-radius: var(--admin-radius);
  background: var(--admin-surface);
  box-shadow: none;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card {
  position: relative;
  min-width: 0;
  padding: 18px 18px 12px;
  overflow: visible;
}

.metric-card:hover {
  z-index: 2;
}

.metric-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  font-size: 21px;
}

.metric-card--primary .metric-icon {
  color: var(--admin-on-primary-soft);
  background: var(--admin-primary-soft);
}

.metric-card--tertiary .metric-icon {
  color: #0d1f0f;
  background: #d3e8d0;
}

.metric-card--secondary .metric-icon {
  color: #31111d;
  background: #ffd8e4;
}

.metric-copy {
  min-width: 0;
  margin-right: auto;
  padding-left: 12px;
}

.metric-copy h3 {
  margin: 0;
  color: var(--admin-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.metric-copy p {
  margin: 3px 0 0;
  color: var(--admin-text);
  font-size: 28px;
  font-weight: 500;
  line-height: 1;
}

.metric-period {
  color: var(--admin-text-soft);
  font-size: 12px;
  font-weight: 600;
}

.chart-card {
  position: relative;
  padding: 20px;
}

.article-card {
  margin-top: 16px;
}

.section-header {
  gap: 20px;
  min-height: 44px;
  margin-bottom: 12px;
}

.range-switch {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 64px);
  padding: 4px;
  border: 1px solid #e7e0ec;
  border-radius: 999px;
  background: var(--admin-surface-muted);
  isolation: isolate;
}

.range-switch::before {
  position: absolute;
  inset: 4px auto 4px 4px;
  z-index: -1;
  width: 64px;
  content: "";
  border-radius: 999px;
  background: var(--admin-primary-soft);
  transition: transform 260ms cubic-bezier(0.2, 0, 0, 1);
}

.range-switch--month::before {
  transform: translateX(64px);
}

.range-switch--year::before {
  transform: translateX(128px);
}

.range-switch button {
  position: relative;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  color: var(--admin-text-muted);
  font-size: 12px;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  transition: color 180ms ease;
}

.range-switch button.is-active {
  color: var(--admin-on-primary-soft);
}

.range-switch button:focus-visible {
  outline: 2px solid var(--admin-primary);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .range-switch::before {
    transition: none;
  }

  .chart-loading__spinner {
    animation-duration: 1400ms;
  }
}

@media (max-width: 900px) {
  .dashboard-page {
    padding: 20px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .chart--heatmap {
    overflow-x: auto;
  }

  .chart--heatmap :deep(.chart-container) {
    min-width: 760px;
  }
}

@media (max-width: 620px) {
  .dashboard-page {
    padding: 16px;
  }

  .metric-grid,
  .article-card {
    margin-bottom: 12px;
  }

  .metric-card {
    padding: 16px 16px 10px;
  }

  .chart-card {
    padding: 16px;
  }

  .section-header,
  .article-card .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .range-switch {
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .range-switch::before {
    width: calc((100% - 8px) / 3);
  }

  .range-switch--month::before {
    transform: translateX(100%);
  }

  .range-switch--year::before {
    transform: translateX(200%);
  }

  .range-switch button {
    padding-inline: 6px;
  }

  .article-stats {
    max-width: 100%;
    flex-wrap: wrap;
  }

  .chart-loading--main,
  .chart-loading--heatmap {
    right: 16px;
    bottom: 16px;
    left: 16px;
  }
}

</style>
