export function getSeason(date) {
  const month = date.getMonth()
  if (month >= 0 && month <= 2) return "Quarter 1"
  if (month >= 3 && month <= 5) return "Quarter 2"
  if (month >= 6 && month <= 8) return "Quarter 3"
  return "Quarter 4"
}

export function getSeasonInYearFullname(date) {
  const year = new Date(date).getFullYear()
  const season = getSeason(new Date(date))
  return `${year} ${season}`
}