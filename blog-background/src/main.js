import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { vuetify } from '@/plugins/vuetify.js'
import MaterialButton from '@/components/material/MaterialButton.vue'
import MaterialDialog from '@/components/material/MaterialDialog.vue'
import { scheduleArticleEditorPreload } from '@/utils/preloadArticleEditor.js'
import 'vuetify/styles'
import './style/index.css'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(vuetify)
app.use(router)
app.component('MaterialButton', MaterialButton)
app.component('MaterialDialog', MaterialDialog)

app.mount('#app')

router.isReady().then(() => {
  if (router.currentRoute.value.name !== 'Login') scheduleArticleEditorPreload()
})

router.afterEach((to) => {
  if (to.name !== 'Login') scheduleArticleEditorPreload()
})



