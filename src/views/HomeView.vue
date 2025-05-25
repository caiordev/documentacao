<template>
  <div class="home">
    <HeroSection />
    <ServiceCards />
    <GitHubProjects />
    <GitHubStats v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth'
import HeroSection from '../components/HeroSection.vue'
import ServiceCards from '../components/ServiceCards.vue'
import GitHubProjects from '../components/GitHubProjects.vue'
import GitHubStats from '../components/GitHubStats.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.home {
  width: 100%;
}
</style>
