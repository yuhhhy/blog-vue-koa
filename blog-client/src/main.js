import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fontsource/noto-serif-sc/400.css'
import './assets/styles/index.scss'
import 'element-plus/es/components/message/style/css';


const pinia = createPinia()
const app = createApp(App)
const head = createHead()

app.use(pinia)
app.use(router)
app.use(head)

app.mount('#app')
