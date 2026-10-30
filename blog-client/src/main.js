import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'
import 'element-plus/es/components/message/style/css';
import { loadHostedAnalytics } from './utils/hostedAnalytics.js'
import { initializeTheme } from './utils/theme.js'


const pinia = createPinia()
const app = createApp(App)
const head = createHead()

initializeTheme()
loadHostedAnalytics()

app.use(pinia)
app.use(router)
app.use(head)

app.mount('#app')
