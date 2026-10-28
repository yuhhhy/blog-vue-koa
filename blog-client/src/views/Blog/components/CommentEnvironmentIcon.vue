<script setup>
import { computed } from 'vue'
import edgeLogoUrl from '@browser-logos/edge/edge_64x64.png'
import firefoxLogoUrl from '@browser-logos/firefox/firefox_64x64.png'
import safariLogoUrl from '@browser-logos/safari/safari_64x64.png'
import androidIcon from '@iconify-icons/logos/android-icon'
import appleIcon from '@iconify-icons/logos/apple'
import braveIcon from '@iconify-icons/logos/brave'
import chromeIcon from '@iconify-icons/logos/chrome'
import linuxIcon from '@iconify-icons/logos/linux-tux'
import operaIcon from '@iconify-icons/logos/opera'
import ubuntuIcon from '@iconify-icons/logos/ubuntu'
import windowsIcon from '@iconify-icons/logos/microsoft-windows-icon'
import milkyWayIcon from '@iconify-icons/fluent-emoji-flat/milky-way'
import nightWithStarsIcon from '@iconify-icons/fluent-emoji-flat/night-with-stars'
import sunIcon from '@iconify-icons/fluent-emoji-flat/sun'
import sunriseIcon from '@iconify-icons/fluent-emoji-flat/sunrise'
import sunsetIcon from '@iconify-icons/fluent-emoji-flat/sunset'

const props = defineProps({
  kind: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '',
  },
  timezone: {
    type: String,
    default: 'Asia/Shanghai',
  },
})

const logo = (icon, label) => ({ icon, multicolor: true, label })

const iconConfig = computed(() => {
  const name = props.value.toLowerCase()

  if (props.kind === 'browser') {
    if (name.includes('edge')) return { image: edgeLogoUrl }
    if (name.includes('firefox')) return { image: firefoxLogoUrl }
    if (name.includes('chrome')) return logo(chromeIcon)
    if (name.includes('safari')) return { image: safariLogoUrl }
    if (name.includes('opera')) return logo(operaIcon)
    if (name.includes('brave')) return logo(braveIcon)
    return null
  }

  if (props.kind === 'time') {
    let hour
    try {
      hour = Number(new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hourCycle: 'h23',
        timeZone: props.timezone,
      }).format(new Date(props.value)))
    } catch {
      hour = Number(new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hourCycle: 'h23',
        timeZone: 'Asia/Shanghai',
      }).format(new Date(props.value)))
    }
    if (hour < 5) return logo(milkyWayIcon, '深夜')
    if (hour < 8) return logo(sunriseIcon, '日出')
    if (hour < 17) return logo(sunIcon, '白天')
    if (hour < 20) return logo(sunsetIcon, '黄昏')
    return logo(nightWithStarsIcon, '夜间')
  }

  if (name.includes('chrome os')) return logo(chromeIcon)
  if (name.includes('android')) return logo(androidIcon)
  if (name.includes('windows')) return logo(windowsIcon)
  if (name.includes('macos') || name.includes('mac os') || name.includes('ios')) return logo(appleIcon)
  if (name.includes('ubuntu')) return logo(ubuntuIcon)
  if (name.includes('linux') || name.includes('debian') || name.includes('fedora')) return logo(linuxIcon)
  return null
})

const viewBox = computed(() => {
  if (!iconConfig.value || iconConfig.value.image) return '0 0 0 0'
  if (iconConfig.value.multicolor) {
    return `0 0 ${iconConfig.value.icon.width || 256} ${iconConfig.value.icon.height || 256}`
  }
  return `0 0 ${iconConfig.value.icon.icon[0]} ${iconConfig.value.icon.icon[1]}`
})
</script>

<template>
  <img
    v-if="iconConfig?.image"
    class="comment-environment-icon"
    :src="iconConfig.image"
    alt=""
    aria-hidden="true"
  />
  <svg
    v-else-if="iconConfig"
    class="comment-environment-icon"
    :viewBox="viewBox"
    :style="{ color: iconConfig.color }"
    :aria-label="iconConfig.label"
    :title="iconConfig.label"
    :aria-hidden="iconConfig.label ? undefined : 'true'"
    focusable="false"
  >
    <g v-if="iconConfig.multicolor" v-html="iconConfig.icon.body"></g>
    <path v-else :d="iconConfig.icon.icon[4]" />
  </svg>
</template>

<style scoped>
.comment-environment-icon {
  display: block;
  flex: 0 0 auto;
  width: 1em;
  height: 1em;
  max-width: none;
  margin: 0;
  fill: currentColor;
  object-fit: contain;
}
</style>
