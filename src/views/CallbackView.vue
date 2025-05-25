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
import { githubService } from '../services/githubService'

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
    
    try {
      // Obter as credenciais do GitHub das variáveis de ambiente
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET
      
      // Determinar o redirect URI baseado no ambiente
      let redirectUri;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Ambiente de desenvolvimento
        redirectUri = `${window.location.origin}/auth/callback`;
      } else {
        // Ambiente de produção (GitHub Pages)
        redirectUri = 'https://caiordev.github.io/documentacao/auth/callback';
      }
      
      // Log para depuração
      console.log('Callback - Redirect URI:', redirectUri);
      
      // Usar o serviço do GitHub diretamente para trocar o código por um token
      const tokenData = await githubService.exchangeCodeForToken(
        code,
        redirectUri,
        clientId,
        clientSecret
      )
      
      // Extrair o token de acesso da resposta
      const accessToken = tokenData.access_token
      
      if (!accessToken) {
        throw new Error('Token não recebido do GitHub')
      }
      
      // Armazenar o token
      authStore.setToken(accessToken)
      
      // Buscar o perfil do usuário com o token
      await authStore.fetchUserProfile()
      
      // Redirecionar para a página inicial
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
