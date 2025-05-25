import { defineStore } from 'pinia'
import { githubService } from '../services/githubService'

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
        
        // Usar o serviço do GitHub diretamente
        const repositories = await githubService.getRepositories(token)
        
        this.projects = repositories
        this.loading = false
        return repositories
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
