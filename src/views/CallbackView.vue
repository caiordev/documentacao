<template>
  <div class="callback-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Autenticando...</p>
    </div>
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <router-link to="/login" class="back-link">Voltar para o login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Parse authorization code from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (!code) {
      throw new Error('Código de autorização não encontrado na URL de callback')
    }
    
    // For GitHub's OAuth implementation, we need to use our server as a proxy
    try {
      console.log('Código de autorização obtido:', code)
      // URI de redirecionamento sem o caminho base /documentacao/
      const redirectUri = `${window.location.origin}/auth/callback`
      console.log('Redirect URI usado:', redirectUri)
      
      // Make a request to our API serverless function on Vercel
      console.log('Enviando solicitação para a API na Vercel...')
      const apiUrl = window.location.origin + '/api/github/token'
      console.log('URL da API:', apiUrl)
      const tokenResponse = await axios.post(apiUrl, {
        code: code,
        redirect_uri: redirectUri
      })
      
      console.log('Resposta completa do servidor:', tokenResponse.data)
      
      // Extract the access token from the response
      const accessToken = tokenResponse.data.access_token
      console.log('Token de acesso extraído:', accessToken)
      
      if (!accessToken) {
        console.error('Token não encontrado na resposta:', tokenResponse.data)
        throw new Error('Token não recebido do GitHub')
      }
      
      // Store the token
      authStore.setToken(accessToken)
      
      // Fetch the user profile with the real token
      await authStore.fetchUserProfile()
      
      // Redirect to home page
      router.push('/')
    } catch (exchangeError) {
      throw new Error('Erro ao trocar o código por um token: ' + exchangeError.message)
    }
  } catch (err) {
    error.value = err.message || 'Erro durante a autenticação'
    loading.value = false
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 2rem;
  background-color: #1a1a1a;
}

.loading, .error {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3f87ff;
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #ff6b6b;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: #3f87ff;
  text-decoration: underline;
}
</style>