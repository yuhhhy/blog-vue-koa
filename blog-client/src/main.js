import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'
// 按需引入失效，引入Elmessage的css样式文件
import 'element-plus/theme-chalk/el-message.css';

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')