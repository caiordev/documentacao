<template>
  <div class="logout-container">
    <div v-if="loading" class="logout-message">
      <div class="spinner"></div>
      <p>Encerrando sessão...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)

onMounted(() => {
  // Executa o logout
  authStore.logout()
  
  // Redireciona para a página de login após um breve delay
  setTimeout(() => {
    router.push('/login')
  }, 1500)
})
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #1a1a1a;
}

.logout-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #252525;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3f87ff;
  width: 40px;
  height: 40px;
  margin-bottom: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logout-message p {
  color: #e4e4e4;
  font-size: 1.2rem;
  margin: 0;
}
</style>
