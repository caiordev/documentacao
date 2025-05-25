import { defineStore } from 'pinia'
import axios from 'axios'

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
        // Use our server API to fetch the GitHub user profile
        const response = await axios.get('/api/github/user', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        
        this.user = response.data
        this.loading = false
        return response.data
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
      // URI de redirecionamento sem o caminho base /documentacao/
      const redirectUri = `${window.location.origin}/auth/callback`
      // Solicitando escopo repo para acessar repositórios privados
      const scope = 'repo+user'
      
      return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`
    }
  }
})