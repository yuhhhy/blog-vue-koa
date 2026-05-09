import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'
import { loadCjkFontWhenIdle } from './utils/loadCjkFont.js'
import 'element-plus/es/components/message/style/css';


const pinia = createPinia()
const app = createApp(App)
const head = createHead()

app.use(pinia)
app.use(router)
app.use(head)

app.mount('#app')
loadCjkFontWhenIdle()
