import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import MaterialButton from '@/components/material/MaterialButton.vue'
import MaterialDialog from '@/components/material/MaterialDialog.vue'
import MaterialInput from '@/components/material/MaterialInput.vue'
import 'element-plus/dist/index.css'
import './style/index.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(ElementPlus)
app.use(router)
app.component('MaterialButton', MaterialButton)
app.component('MaterialDialog', MaterialDialog)
app.component('MaterialInput', MaterialInput)

app.mount('#app')



