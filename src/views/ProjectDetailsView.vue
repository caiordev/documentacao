<template>
  <div class="project-details-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando detalhes do projeto...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h2>Erro ao carregar detalhes do projeto</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="back-link">Voltar para a lista de projetos</router-link>
    </div>
    
    <div v-else class="project-content">
      <div class="project-header">
        <div class="project-title-section">
          <h1 class="project-title">{{ project.name }}</h1>
          <p class="project-description">{{ project.description || 'Sem descrição' }}</p>
        </div>
        
        <div class="project-stats">
          <div class="stat">
            <span class="stat-value">{{ project.stargazers_count }}</span>
            <span class="stat-label">Stars</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ project.forks_count }}</span>
            <span class="stat-label">Forks</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ project.open_issues_count }}</span>
            <span class="stat-label">Issues</span>
          </div>
        </div>
      </div>
      
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="tab-content">
        <!-- README Tab -->
        <div v-if="activeTab === 'readme'" class="readme-content">
          <div v-if="readmeLoading" class="tab-loading">
            <div class="spinner"></div>
            <p>Carregando README...</p>
          </div>
          <div v-else-if="readmeError" class="tab-error">
            <p>{{ readmeError }}</p>
          </div>
          <div v-else-if="!readme" class="tab-empty">
            <p>Este projeto não possui um arquivo README.</p>
          </div>
          <div v-else class="markdown-body" v-html="renderedReadme"></div>
        </div>
        
        <!-- Wiki Tab -->
        <div v-if="activeTab === 'wiki'" class="wiki-content">
          <div v-if="wikiLoading" class="tab-loading">
            <div class="spinner"></div>
            <p>Carregando Wiki...</p>
          </div>
          <div v-else-if="wikiError" class="tab-error">
            <p>{{ wikiError }}</p>
          </div>
          <div v-else-if="!wikiPages || wikiPages.length === 0" class="tab-empty">
            <p>Este projeto não possui uma Wiki ou ela está vazia.</p>
          </div>
          <div v-else class="wiki-pages">
            <h3>Páginas da Wiki</h3>
            <ul class="wiki-list">
              <li v-for="page in wikiPages" :key="page.page_name">
                <a :href="page.html_url" target="_blank">{{ page.title }}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Files Tab -->
        <div v-if="activeTab === 'files'" class="files-content">
          <div v-if="filesLoading" class="tab-loading">
            <div class="spinner"></div>
            <p>Carregando arquivos...</p>
          </div>
          <div v-else-if="filesError" class="tab-error">
            <p>{{ filesError }}</p>
          </div>
          <div v-else-if="!files || files.length === 0" class="tab-empty">
            <p>Não foi possível carregar os arquivos deste projeto.</p>
          </div>
          <div v-else class="files-list">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in files" :key="file.path">
                  <td>
                    <a :href="file.html_url" target="_blank">{{ file.name }}</a>
                  </td>
                  <td>{{ file.type }}</td>
                  <td>{{ formatFileSize(file.size) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { githubService } from '../services/githubService'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import 'github-markdown-css/github-markdown.css'

const route = useRoute()
const router = useRouter()

// Project data
const project = ref(null)
const loading = ref(true)
const error = ref(null)

// Tab management
const activeTab = ref('readme')
const tabs = [
  { id: 'readme', label: 'README' },
  { id: 'wiki', label: 'Wiki' },
  { id: 'files', label: 'Arquivos' }
]

// README data
const readme = ref(null)
const readmeLoading = ref(false)
const readmeError = ref(null)

// Wiki data
const wikiPages = ref([])
const wikiLoading = ref(false)
const wikiError = ref(null)

// Files data
const files = ref([])
const filesLoading = ref(false)
const filesError = ref(null)

// Computed properties
const renderedReadme = computed(() => {
  if (!readme.value) return ''
  const html = marked(readme.value)
  return DOMPurify.sanitize(html)
})

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Fetch project details
const fetchProjectDetails = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('github_access_token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }
    
    const { owner, name } = route.params
    
    // Usar o serviço do GitHub diretamente para buscar detalhes do repositório
    const repoDetails = await githubService.getRepositoryDetails(token, owner, name)
    
    project.value = repoDetails
    loading.value = false
    
    // Carregar o README após os detalhes do projeto serem carregados
    loadReadme()
  } catch (err) {
    error.value = err.message || 'Erro ao carregar detalhes do projeto'
    loading.value = false
  }
}

// Load README content
const loadReadme = async () => {
  if (!project.value) return
  
  readmeLoading.value = true
  readmeError.value = null
  
  try {
    const token = localStorage.getItem('github_access_token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }
    
    const owner = route.params.owner
    const name = route.params.name
    
    // Usar o serviço do GitHub diretamente para buscar o README
    const readmeContent = await githubService.getRepositoryReadme(token, owner, name)
    
    readme.value = readmeContent
    readmeLoading.value = false
  } catch (err) {
    if (err.response && err.response.status === 404) {
      readme.value = null
      readmeLoading.value = false
    } else {
      readmeError.value = err.message || 'Erro ao carregar o README'
      readmeLoading.value = false
    }
  }
}

// Load Wiki pages
const loadWiki = async () => {
  if (!project.value) return
  
  wikiLoading.value = true
  wikiError.value = null
  
  try {
    const token = localStorage.getItem('github_access_token')
    const owner = route.params.owner
    const name = route.params.name
    
    // GitHub API não tem um endpoint direto para páginas wiki
    // Verificamos se o wiki está habilitado e fornecemos um link
    if (project.value.has_wiki) {
      wikiPages.value = [{
        page_name: 'home',
        title: 'Home',
        html_url: `https://github.com/${owner}/${name}/wiki`
      }]
    } else {
      wikiPages.value = []
    }
    
    wikiLoading.value = false
  } catch (err) {
    wikiError.value = err.message || 'Erro ao carregar a Wiki'
    wikiLoading.value = false
  }
}

// Load repository files
const loadFiles = async () => {
  if (!project.value) return
  
  filesLoading.value = true
  filesError.value = null
  
  try {
    const token = localStorage.getItem('github_access_token')
    const owner = route.params.owner
    const name = route.params.name
    
    // Usar o serviço do GitHub diretamente para buscar os arquivos
    const contentsData = await githubService.getRepositoryContents(token, owner, name)
    
    files.value = contentsData
    filesLoading.value = false
  } catch (err) {
    filesError.value = err.message || 'Erro ao carregar os arquivos'
    filesLoading.value = false
  }
}

// Watch for tab changes
const watchTab = (newTab) => {
  if (newTab === 'wiki' && (!wikiPages.value || wikiPages.value.length === 0) && !wikiLoading.value) {
    loadWiki()
  } else if (newTab === 'files' && (!files.value || files.value.length === 0) && !filesLoading.value) {
    loadFiles()
  }
}

// Watch for tab changes
import { watch } from 'vue'
watch(activeTab, watchTab)

// Initialize component
onMounted(() => {
  fetchProjectDetails()
})
</script>

<style scoped>
.project-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #e4e4e4;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 2rem;
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

.project-content {
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  background-color: #333;
  border-bottom: 1px solid #444;
}

.project-title {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
}

.project-description {
  color: #aaa;
  margin: 0;
}

.project-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 0.8rem;
  color: #aaa;
}

.tabs {
  display: flex;
  background-color: #333;
  border-bottom: 1px solid #444;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  color: #aaa;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button:hover {
  background-color: #3a3a3a;
  color: #fff;
}

.tab-button.active {
  background-color: #2a2a2a;
  color: #fff;
  border-bottom: 2px solid #3f87ff;
}

.tab-content {
  padding: 2rem;
  min-height: 400px;
}

.tab-loading, .tab-error, .tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.tab-error {
  color: #ff6b6b;
}

.tab-empty {
  color: #aaa;
}

.wiki-list {
  list-style-type: none;
  padding: 0;
}

.wiki-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #444;
}

.wiki-list a {
  color: #3f87ff;
  text-decoration: none;
}

.wiki-list a:hover {
  text-decoration: underline;
}

.files-list table {
  width: 100%;
  border-collapse: collapse;
}

.files-list th, .files-list td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #444;
}

.files-list th {
  color: #aaa;
  font-weight: normal;
}

.files-list a {
  color: #3f87ff;
  text-decoration: none;
}

.files-list a:hover {
  text-decoration: underline;
}

/* GitHub markdown styling */
:deep(.markdown-body) {
  color: #e4e4e4;
  background-color: #2a2a2a;
}

:deep(.markdown-body pre) {
  background-color: #333;
}

:deep(.markdown-body code) {
  background-color: #333;
  color: #e4e4e4;
}

:deep(.markdown-body a) {
  color: #3f87ff;
}

:deep(.markdown-body img) {
  max-width: 100%;
}

:deep(.markdown-body table) {
  border-collapse: collapse;
}

:deep(.markdown-body th, .markdown-body td) {
  border: 1px solid #444;
  padding: 6px 13px;
}

:deep(.markdown-body tr) {
  background-color: #2a2a2a;
  border-top: 1px solid #444;
}

:deep(.markdown-body tr:nth-child(2n)) {
  background-color: #333;
}
</style>
