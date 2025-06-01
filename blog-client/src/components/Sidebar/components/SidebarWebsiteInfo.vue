<script setup>
import { ref } from 'vue'
import { apiGetWebsiteData } from '@/api/websiteData.js'

const runTime = ref(0) // 网站运行天数
const totalPosts = ref(0) // 网站文章总数
const websiteVisits = ref(0) // 网站访问量
const websiteViews = ref(0) // 网站浏览量
const updateTime = ref('') // 最后更新时间
const totalWordCount = ref(0) // 网站总字数

// 网站总运行时间计算
function getrunTime(startTime) {
    let date1 = new Date(startTime)
    let date2 = new Date()
    const diff = date2.getTime() - date1.getTime()
    const diffDate =  Math.round(diff / (24 * 60 * 60 * 1000))
    return diffDate
}

// 添加数据格式化函数
const formatCount = (count) => {
  if (!count) return '0 k'
  return count >= 1000
    ? (count / 1000).toFixed(1) + ' k'
    : count + ''
}

async function getWebsiteData() {
  const websitedata = await apiGetWebsiteData() // 获取网站数据
  websiteVisits.value = websitedata.visit.total
  websiteViews.value = websitedata.view.total
  totalPosts.value = websitedata.article.total
  updateTime.value = websitedata.updateTime
  totalWordCount.value = websitedata.totalWordCount
}

// 执行函数，初始化网站数据
runTime.value = getrunTime('2025-05-04')
getWebsiteData()

</script>

<template>
  <div class="website-info">
    <div class="website-info-header">网站资讯</div>
    <div class="website-stats">
      <div class="stat-item">
        <span class="stat-value">{{ totalPosts }}</span>
        <span class="stat-label">文章总数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatCount(totalWordCount) }}</span>
        <span class="stat-label">全站字数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatCount(websiteVisits) }}</span>
        <span class="stat-label">访问量</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatCount(websiteViews) }}</span>
        <span class="stat-label">浏览量</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ runTime }}</span>
        <span class="stat-label">运行天数</span>
      </div>
    </div>
    <div class="last-updated">最后更新: {{ updateTime.slice(0,10) }}</div>
  </div>
</template>

<style lang="scss" scoped>
.website-info {
  background-color: var(--white);
  color: var(--dark);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  &:hover {
    box-shadow: 2px 2px 5px var(--dark);
    transition: 0.4s;
  }

  .website-info-header {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .website-stats {
    font-family: var(--font-serif);
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: space-between;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;

      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--blue);
      }

      .stat-label {
        font-size: 0.8rem;
        color: var(--quote-color);
      }
    }
  }

  .last-updated {
    font-size: 0.8rem;
    color: var(--quote-color);
    text-align: center;
    margin-top: 10px;
  }
}
</style>