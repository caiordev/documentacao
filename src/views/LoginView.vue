<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="../assets/github.svg" alt="GitHub Logo" class="login-logo" />
        <h1>Dev Docs</h1>
        <p>Acesse a documentação dos seus projetos GitHub</p>
        <p class="version-info">Versão atualizada: 1.0.1</p>
      </div>
      
      <div class="login-body">
        <button @click="loginWithGithub" class="github-login-button">
          <img src="../assets/github.svg" alt="GitHub" class="github-icon" />
          <span>Login com GitHub</span>
        </button>
        
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

const loginWithGithub = () => {
  window.location.href = authStore.getLoginUrl()
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px); /* Adjust based on header height */
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
}

.login-card {
  background-color: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.login-header {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #444;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.login-header p {
  color: #ccc;
  font-size: 0.9rem;
}

.version-info {
  color: #3f87ff;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: bold;
}

.login-body {
  padding: 2rem;
}

.github-login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(63, 135, 255, 0.3);
}

.github-login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(63, 135, 255, 0.4);
}

.error-message {
  margin-top: 1rem;
  color: #ff6b6b;
  text-align: center;
  font-size: 0.9rem;
}

.github-icon {
  width: 50px;
  height: 50px;
}
</style>
