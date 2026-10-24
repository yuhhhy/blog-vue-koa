const weekSeries = {
  view: [742, 816, 765, 901, 854, 980, 1042],
  visit: [168, 194, 181, 226, 209, 248, 271],
  comment: [3, 5, 2, 7, 4, 8, 6]
}

const yearSeries = {
  view: [12840, 13620, 15180, 14760, 16240, 17580, 18420, 17960, 19340, 20780, 22160, 23680],
  visit: [2860, 3010, 3290, 3180, 3520, 3810, 4060, 3920, 4250, 4510, 4780, 5090],
  comment: [38, 42, 47, 41, 53, 58, 62, 57, 68, 71, 76, 82]
}

const totals = {
  view: 186540,
  visit: 42180,
  comment: 695,
  article: 86
}

const getMonthSeries = (type) => {
  const now = new Date()
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const base = type === 'view' ? 690 : type === 'visit' ? 154 : 2
  const amplitude = type === 'view' ? 320 : type === 'visit' ? 92 : 7

  return Array.from({ length: days }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.82) * 0.42 + Math.cos((index + 2) * 0.37) * 0.28
    const trend = index / Math.max(days - 1, 1)
    return Math.max(0, Math.round(base + amplitude * (0.45 + wave + trend * 0.32)))
  })
}

const getArticleData = () => {
  const year = new Date().getFullYear()
  const entries = [
    [0, 8, 1], [0, 24, 1], [1, 6, 2], [1, 19, 1], [2, 3, 1], [2, 17, 2],
    [3, 2, 1], [3, 12, 1], [3, 26, 2], [4, 7, 1], [4, 18, 3], [4, 27, 1],
    [5, 5, 2], [5, 16, 1], [6, 1, 1], [6, 14, 2], [6, 28, 1], [7, 9, 1],
    [7, 22, 2], [8, 4, 1], [8, 15, 1], [8, 26, 2], [9, 3, 1], [9, 12, 2],
    [9, 21, 1], [10, 7, 2], [10, 18, 1], [11, 2, 1], [11, 13, 2], [11, 24, 1]
  ]

  return entries.map(([month, day, count]) => ({
    date: new Date(year, month, day).toISOString(),
    count
  }))
}

const getSeries = (type, timeRange) => {
  if (timeRange === 'year') return [...yearSeries[type]]
  if (timeRange === 'month') return getMonthSeries(type)
  return [...weekSeries[type]]
}

export function getMockWebsiteData(timeRange = 'week') {
  return {
    view: {
      total: totals.view,
      data: getSeries('view', timeRange)
    },
    visit: {
      total: totals.visit,
      data: getSeries('visit', timeRange)
    },
    comment: {
      total: totals.comment,
      data: getSeries('comment', timeRange)
    },
    article: {
      total: totals.article,
      data: getArticleData()
    },
    updateTime: new Date().toISOString(),
    totalWordCount: 286400
  }
}
