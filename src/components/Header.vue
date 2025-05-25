<template>
  <header class="header">
    <div class="header-container">
      <div class="logo-container">
        <router-link to="/" class="logo-link">Dev Docs</router-link>
      </div>
      
      <div class="header-right">
        <!-- Project selector dropdown -->
        <!--
        <div class="project-selector" v-if="authStore.isAuthenticated">
          <select 
            v-model="selectedProject" 
            @change="handleProjectChange"
            :disabled="projectsStore.loading"
            class="project-select"
          >
            <option value="" disabled>Selecione um projeto</option>
            <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
          <div v-if="projectsStore.loading" class="loading-indicator"></div>
        </div>-->
        
        <!-- Authentication section -->
        <div class="auth-section">
          <template v-if="authStore.isAuthenticated">
            <div class="user-profile" v-if="authStore.user">
              <img v-if="authStore.user.avatar_url" :src="authStore.user.avatar_url" alt="User Avatar" class="user-avatar">
              <span class="user-name">{{ authStore.user.name }}</span>
            </div>
            <router-link to="/logout" class="logout-link">Logout</router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="login-link">Login</router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../store/auth'
import { useProjectsStore } from '../store/projects'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const router = useRouter()

const selectedProject = ref('')

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await projectsStore.fetchProjects()
      
      if (projectsStore.selectedProject) {
        selectedProject.value = projectsStore.selectedProject.id
      }
    } catch (error) {
      console.error('Falha ao carregar projetos:', error)
    }
  }
})

watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    try {
      await projectsStore.fetchProjects()
    } catch (error) {
      console.error('Falha ao carregar projetos:', error)
    }
  } else {
    selectedProject.value = ''
  }
})

const handleProjectChange = () => {
  const project = projectsStore.projects.find(p => p.id === selectedProject.value)
  if (project) {
    projectsStore.setSelectedProject(project)
    router.push(`/project/${project.id}`)
  }
}
</script>

<style scoped>
.header {
  background-color: #1a1a1a;
  color: white;
  padding: 0.5rem 1rem;
  width: 100%;
  border-bottom: 1px solid #333;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
}

.logo-container {
  font-weight: bold;
  font-size: 1.2rem;
}

.logo-link {
  color: white;
  text-decoration: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Project selector styles */
.project-selector {
  position: relative;
  min-width: 200px;
}

.project-select {
  width: 100%;
  padding: 0.5rem;
  background-color: #2a2a2a;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.project-select:focus {
  border-color: #3f87ff;
}

.project-select option {
  background-color: #2a2a2a;
  color: white;
}

.loading-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

/* Authentication section styles */
.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.9rem;
  color: white;
}

.logout-link, .login-link {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.logout-link {
  background: linear-gradient(90deg, #e24329, #ff6b6b);
  box-shadow: 0 4px 12px rgba(226, 67, 41, 0.3);
}

.login-link {
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  box-shadow: 0 4px 12px rgba(63, 135, 255, 0.3);
}

.logout-link:hover, .login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
  
  .project-selector {
    min-width: 150px;
  }
  
  .header-right {
    gap: 0.75rem;
  }
}
</style>
