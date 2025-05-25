<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Dev Docs</h1>
      <h2 class="hero-subtitle">Sua plataforma de documentação de projetos</h2>
      <p class="hero-description">Acesse, gerencie e compartilhe a documentação de todos os seus projetos em um só lugar.</p>
      <div class="hero-buttons">
        <router-link to="/" class="hero-button primary">Projetos</router-link>
        <a href="https://github.com" target="_blank" class="hero-button secondary">GitHub</a>
      </div>
    </div>
    <div class="hero-image">
      <img src="../assets/github.svg" alt="GitHub Logo" />
    </div>
  </section>
</template>

<script setup>
// Hero section component logic can be added here
</script>

<style scoped>
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4rem 2rem;
  color: white;
  min-height: 60vh;
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(110, 66, 229, 0.1), transparent 60%);
  z-index: -1;
}

.hero-content {
  flex: 1;
  padding-right: 3rem;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #e4e4e4;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  color: #aaa;
  max-width: 600px;
}

.hero-buttons {
  display: flex;
  gap: 1.25rem;
}

.hero-button {
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-button.primary {
  background: linear-gradient(90deg, #3f87ff, #6e42e5);
  color: white;
  box-shadow: 0 4px 12px rgba(63, 135, 255, 0.3);
}

.hero-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-button:hover {
  transform: translateY(-2px);
}

.hero-button.primary:hover {
  box-shadow: 0 6px 16px rgba(63, 135, 255, 0.4);
}

.hero-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.hero-image img {
  max-width: 100%;
  max-height: 300px;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 3rem 1.5rem;
  }
  
  .hero-content {
    padding-right: 0;
    margin-bottom: 3rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-buttons {
    justify-content: center;
  }
}
</style>
