import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(ElementPlus)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  alert(info)
  console.table([{err, instance, info}])
}

app.config.globalProperties.$globalErrorHandler = (err, instance, info) => {
  alert(info)
  console.table([{err, instance, info}])
}

app.mount('#app')
