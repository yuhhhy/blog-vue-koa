import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './style/global.css'
import "./style/tailwindcss.css"

// 根据环境变量判断是否使用mock
if (import.meta.env.MODE === 'development') {
    import('./../mock/user.js')
}

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(ElementPlus)
app.use(router)

// el-icons全局注册
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')



