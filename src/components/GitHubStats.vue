<template>
  <div class="github-stats-section">
    <div class="section-header">
      <div class="title-container">
        <img src="../assets/github.svg" alt="GitHub" class="github-icon" />
        <h2 class="section-title">Suas Estatísticas no GitHub</h2>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando estatísticas...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <div class="error-content">
        <h3>Não foi possível carregar as estatísticas</h3>
        <p>{{ error }}</p>
      </div>
    </div>
    
    <div v-else class="stats-container">
      <!-- Estatísticas do Usuário -->
      <div class="stats-card user-stats">
        <div class="stats-header">
          <h3>Perfil</h3>
        </div>
        <div class="stats-content">
          <div class="user-profile">
            <img :src="userStats.avatar_url" :alt="userStats.name" class="user-avatar" />
            <div class="user-info">
              <h4>{{ userStats.name }}</h4>
              <p class="username">@{{ userStats.login }}</p>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.public_repos }}</div>
              <div class="stat-label">Repositórios</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.followers }}</div>
              <div class="stat-label">Seguidores</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.following }}</div>
              <div class="stat-label">Seguindo</div>
            </div>
          </div>
          <div class="bio" v-if="userStats.bio">
            <p>{{ userStats.bio }}</p>
          </div>
        </div>
      </div>
      
      <!-- Estatísticas de Linguagens -->
      <div class="stats-card language-stats">
        <div class="stats-header">
          <h3>Linguagens Mais Usadas</h3>
        </div>
        <div class="stats-content">
          <div v-if="languages.length === 0" class="empty-state">
            <p>Nenhuma linguagem encontrada</p>
          </div>
          <div v-else class="language-chart">
            <div 
              v-for="lang in languages" 
              :key="lang.name" 
              class="language-bar"
              :style="{ width: `${lang.percentage}%`, backgroundColor: lang.color }"
              :title="`${lang.name}: ${lang.percentage.toFixed(1)}%`"
            ></div>
            <div class="language-legend">
              <div v-for="lang in languages" :key="lang.name" class="legend-item">
                <span class="color-dot" :style="{ backgroundColor: lang.color }"></span>
                <span class="lang-name">{{ lang.name }}</span>
                <span class="lang-percentage">{{ lang.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Estatísticas de Contribuição -->
      <div class="stats-card contribution-stats">
        <div class="stats-header">
          <h3>Contribuições</h3>
        </div>
        <div class="stats-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ contributionStats.totalCommits }}</div>
              <div class="stat-label">Commits</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ contributionStats.pullRequests }}</div>
              <div class="stat-label">Pull Requests</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ contributionStats.issues }}</div>
              <div class="stat-label">Issues</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ contributionStats.stars }}</div>
              <div class="stat-label">Stars</div>
            </div>
          </div>
          <div class="contribution-streak">
            <div class="streak-info">
              <span class="streak-label">Sequência atual:</span>
              <span class="streak-value">{{ contributionStats.currentStreak }} dias</span>
            </div>
            <div class="streak-info">
              <span class="streak-label">Maior sequência:</span>
              <span class="streak-value">{{ contributionStats.longestStreak }} dias</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { githubService } from '../services/githubService'

const loading = ref(true)
const error = ref(null)
const userStats = ref({})
const languages = ref([])
const contributionStats = ref({
  totalCommits: 0,
  pullRequests: 0,
  issues: 0,
  stars: 0,
  currentStreak: 0,
  longestStreak: 0
})

// Cores para as linguagens mais comuns
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

// Função para obter uma cor para uma linguagem
const getLanguageColor = (language) => {
  return languageColors[language] || '#8f8f8f'
}

// Carregar estatísticas do usuário
const fetchUserStats = async () => {
  try {
    const token = localStorage.getItem('github_access_token')
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }
    
    // Obter informações do usuário usando o serviço do GitHub diretamente
    const userData = await githubService.getUserProfile(token)
    
    userStats.value = userData
    
    // Obter repositórios para calcular estatísticas
    const repos = await githubService.getRepositories(token)
    
    // Calcular estatísticas de contribuição
    calculateContributionStats(repos)
    
    // Obter linguagens
    await fetchLanguageStats(repos)
    
    loading.value = false
  } catch (err) {
    error.value = err.message || 'Erro ao carregar estatísticas'
    loading.value = false
  }
}

// Calcular estatísticas de contribuição
const calculateContributionStats = (repos) => {
  let totalStars = 0
  
  repos.forEach(repo => {
    totalStars += repo.stargazers_count
  })
  
  // Valores simulados para demonstração
  contributionStats.value = {
    totalCommits: Math.floor(Math.random() * 1000) + 100,
    pullRequests: Math.floor(Math.random() * 50) + 5,
    issues: Math.floor(Math.random() * 30) + 3,
    stars: totalStars,
    currentStreak: Math.floor(Math.random() * 10) + 1,
    longestStreak: Math.floor(Math.random() * 30) + 5
  }
}

// Obter estatísticas de linguagens
const fetchLanguageStats = async (repos) => {
  try {
    const token = localStorage.getItem('github_access_token')
    const languageCounts = {}
    let totalSize = 0
    
    // Limitar a 10 repositórios mais recentes para evitar muitas requisições
    const recentRepos = repos.slice(0, 10)
    
    for (const repo of recentRepos) {
      try {
        // Usar o serviço do GitHub diretamente para buscar as linguagens
        const repoLanguages = await githubService.getRepositoryLanguages(token, repo.owner.login, repo.name)
        
        for (const [lang, size] of Object.entries(repoLanguages)) {
          languageCounts[lang] = (languageCounts[lang] || 0) + size
          totalSize += size
        }
      } catch (error) {
        console.error(`Erro ao obter linguagens para ${repo.name}:`, error)
      }
    }
    
    // Converter para array e calcular percentagens
    const languageArray = Object.entries(languageCounts).map(([name, size]) => ({
      name,
      size,
      percentage: (size / totalSize) * 100,
      color: getLanguageColor(name)
    }))
    
    // Ordenar por tamanho e limitar a 5 linguagens
    languages.value = languageArray
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
  } catch (err) {
    console.error('Erro ao obter estatísticas de linguagens:', err)
  }
}

onMounted(() => {
  fetchUserStats()
})
</script>

<style scoped>
.github-stats-section {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
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

/* Stats container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.stats-card {
  background-color: #252525;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: #444;
}

.stats-header {
  padding: 1.25rem 1.5rem;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
}

.stats-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.stats-content {
  padding: 1.5rem;
}

/* User Stats */
.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3f87ff;
}

.user-info {
  margin-left: 1.25rem;
}

.user-info h4 {
  margin: 0 0 0.25rem;
  color: #ffffff;
  font-size: 1.5rem;
}

.username {
  color: #aaa;
  margin: 0;
  font-size: 0.95rem;
}

.bio {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
  color: #ccc;
  font-style: italic;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  background-color: #2a2a2a;
  padding: 1rem 0.5rem;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3f87ff;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #aaa;
}

/* Language Stats */
.language-chart {
  margin-bottom: 1.5rem;
}

.language-bar {
  height: 24px;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.language-bar:hover {
  opacity: 0.9;
  transform: scaleY(1.1);
}

.language-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.lang-name {
  color: #e4e4e4;
  margin-right: auto;
}

.lang-percentage {
  color: #aaa;
}

/* Contribution Stats */
.contribution-streak {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.streak-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.streak-label {
  color: #aaa;
}

.streak-value {
  color: #3f87ff;
  font-weight: 600;
}

/* Empty state */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  color: #aaa;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .github-stats-section {
    padding: 2rem 1.5rem;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .user-info h4 {
    font-size: 1.25rem;
  }
}
</style>
