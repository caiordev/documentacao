import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { useAuthStore } from './store/auth'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')

const authStore = useAuthStore()
authStore.initializeAuth()
