<template>
  <div class="github-projects-section">
    <div class="section-header">
      <div class="title-container">
        <img src="../assets/github.svg" alt="GitHub" class="github-icon" />
        <h2 class="section-title">Seus Projetos no GitHub</h2>
      </div>
      <a href="https://github.com/new" target="_blank" class="new-repo-button">
        <span class="plus-icon">+</span> Novo Repositório
      </a>
    </div>
    
    <div v-if="projectsStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando seus repositórios...</p>
    </div>
    
    <div v-else-if="projectsStore.error" class="error-container">
      <div class="error-icon">!</div>
      <div class="error-content">
        <h3>Não foi possível carregar os projetos</h3>
        <p>{{ projectsStore.error }}</p>
      </div>
    </div>
    
    <div v-else-if="!projectsStore.projects || projectsStore.projects.length === 0" class="empty-container">
      <div class="empty-icon">📂</div>
      <h3>Nenhum repositório encontrado</h3>
      <p>Crie um novo repositório no GitHub para começar</p>
      <a href="https://github.com/new" target="_blank" class="create-repo-link">Criar repositório</a>
    </div>
    
    <div v-else class="projects-container">
      <div 
        v-for="project in projectsStore.projects" 
        :key="project.id" 
        class="project-card"
        @click="navigateToProject(project)"
      >
        <div class="project-header">
          <h3 class="project-name">{{ project.name }}</h3>
          <div class="visibility-badge" :class="project.private ? 'private' : 'public'">
            {{ project.private ? 'Privado' : 'Público' }}
          </div>
        </div>
        
        <p class="project-description">{{ project.description || 'Sem descrição' }}</p>
        
        <div class="project-meta">
          <div class="language-info" v-if="project.language">
            <span class="language-dot" :style="{ backgroundColor: getLanguageColor(project.language) }"></span>
            <span class="language-name">{{ project.language }}</span>
          </div>
          
          <div class="project-stats">
            <div class="stat-item" v-if="project.stargazers_count > 0">
              <span class="stat-icon">★</span>
              <span class="stat-count">{{ project.stargazers_count }}</span>
            </div>
            <div class="stat-item" v-if="project.forks_count > 0">
              <span class="stat-icon">⑂</span>
              <span class="stat-count">{{ project.forks_count }}</span>
            </div>
            <div class="stat-item" v-if="project.open_issues_count > 0">
              <span class="stat-icon">⚠</span>
              <span class="stat-count">{{ project.open_issues_count }}</span>
            </div>
          </div>
        </div>
        
        <div class="project-footer">
          <div class="footer-content">
            <span class="updated-at">Atualizado {{ formatDate(project.updated_at) }}</span>
            <a v-if="hasGitHubPages(project)" :href="getGitHubPagesUrl(project)" target="_blank" class="github-pages-link">
              <span class="pages-icon">🌐</span> GitHub Pages
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '../store/projects'

const router = useRouter()
const projectsStore = useProjectsStore()

// Language colors
const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
  Angular: '#dd0031',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Rust: '#dea584',
  Dart: '#00B4AB'
}

// Get color for language
const getLanguageColor = (language) => {
  return languageColors[language] || '#8f8f8f'
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'ontem'
  } else if (diffDays < 30) {
    return `há ${diffDays} dias`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `há ${years} ${years === 1 ? 'ano' : 'anos'}`
  }
}

// Check if project has GitHub Pages
const hasGitHubPages = (project) => {
  return project.has_pages || 
         (project.homepage && 
          (project.homepage.includes('github.io') || 
           project.homepage.includes('.github.com')));
}

// Get GitHub Pages URL
const getGitHubPagesUrl = (project) => {
  if (project.homepage && 
      (project.homepage.includes('github.io') || 
       project.homepage.includes('.github.com'))) {
    return project.homepage;
  }
  
  // Default GitHub Pages URL format
  return `https://${project.owner.login}.github.io/${project.name}`;
}

// Navigate to project details
const navigateToProject = (project) => {
  router.push({
    name: 'project',
    params: {
      owner: project.owner.login,
      name: project.name
    }
  })
}

// Load projects on component mount
onMounted(async () => {
  if (!projectsStore.projects || projectsStore.projects.length === 0) {
    await projectsStore.fetchProjects()
  }
})
</script>

<style scoped>
.github-projects-section {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #333;
}

.title-container {
  display: flex;
  align-items: center;
}

.github-icon {
  width: 32px;
  height: 32px;
  margin-right: 1rem;
  filter: brightness(0) invert(1);
}

.section-title {
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.new-repo-button {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.new-repo-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(63, 135, 255, 0.4);
}

.plus-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #e4e4e4;
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

/* Error state */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1.5rem;
}

.error-content h3 {
  color: #ff6b6b;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #e4e4e4;
  margin: 0;
}

/* Empty state */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #aaa;
}

.empty-container h3 {
  color: #e4e4e4;
  margin-bottom: 0.5rem;
}

.empty-container p {
  color: #aaa;
  margin-bottom: 1.5rem;
}

.create-repo-link {
  display: inline-block;
  background-color: #3f87ff;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.create-repo-link:hover {
  background-color: #2a6fd8;
  transform: translateY(-2px);
}

/* Projects grid */
.projects-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background-color: #252525;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: #444;
}

.project-card:hover::before {
  transform: scaleX(1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-name {
  font-size: 1.25rem;
  margin: 0;
  color: #ffffff;
  font-weight: 600;
  transition: color 0.3s ease;
}

.project-card:hover .project-name {
  color: #3f87ff;
}

.visibility-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.visibility-badge.public {
  background-color: rgba(63, 135, 255, 0.2);
  color: #3f87ff;
}

.visibility-badge.private {
  background-color: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.project-description {
  color: #aaa;
  margin: 0 0 1.5rem;
  flex-grow: 1;
  font-size: 0.95rem;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.language-info {
  display: flex;
  align-items: center;
}

.language-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.language-name {
  color: #ccc;
  font-size: 0.9rem;
}

.project-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  color: #aaa;
  margin-right: 0.35rem;
  font-size: 0.9rem;
}

.stat-count {
  color: #ccc;
  font-size: 0.9rem;
}

.project-footer {
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.updated-at {
  color: #777;
  font-size: 0.8rem;
  font-style: italic;
}

.github-pages-link {
  display: flex;
  align-items: center;
  background-color: rgba(63, 135, 255, 0.15);
  color: #3f87ff;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.github-pages-link:hover {
  background-color: rgba(63, 135, 255, 0.3);
  transform: translateY(-2px);
}

.pages-icon {
  margin-right: 0.4rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .github-projects-section {
    padding: 2rem 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .new-repo-button {
    margin-top: 1rem;
  }
  
  .projects-container {
    grid-template-columns: 1fr;
  }
}
</style>
