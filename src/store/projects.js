import { defineStore } from 'pinia'
import axios from 'axios'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    loading: false,
    error: null,
    selectedProject: null
  }),
  
  getters: {
    getProjects: (state) => state.projects,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSelectedProject: (state) => state.selectedProject
  },
  
  actions: {
    async fetchProjects() {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('github_access_token')
        
        if (!token) {
          throw new Error('Usuário não autenticado')
        }
        
        // Use our server API to fetch GitHub repositories
        const response = await axios.get('/api/github/repos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        this.projects = response.data
        this.loading = false
        return response.data
      } catch (error) {
        this.error = error.message || 'Falha ao carregar projetos'
        this.loading = false
        throw error
      }
    },
    
    setSelectedProject(project) {
      this.selectedProject = project
    }
  }
})