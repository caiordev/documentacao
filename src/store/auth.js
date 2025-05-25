import { defineStore } from 'pinia'
import { githubService } from '../services/githubService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('github_access_token') || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },
  
  actions: {
    async initializeAuth() {
      if (this.token) {
        try {
          await this.fetchUserProfile()
        } catch (error) {
          // If token is invalid, clear it
          this.logout()
        }
      }
    },
    
    async fetchUserProfile() {
      this.loading = true
      this.error = null
      
      try {
        // Usar o serviço do GitHub diretamente
        const userData = await githubService.getUserProfile(this.token)
        
        this.user = userData
        this.loading = false
        return userData
      } catch (error) {
        this.error = error.message || 'Falha ao carregar perfil do usuário'
        this.loading = false
        throw error
      }
    },
    
    setToken(token) {
      this.token = token
      localStorage.setItem('github_access_token', token)
    },
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('github_access_token')
    },
    
    getLoginUrl() {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      
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
      console.log('Redirect URI:', redirectUri);
      
      // Solicitando escopo repo para acessar repositórios privados
      const scope = 'repo+user';
      
      return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    }
  }
})
