<template>
  <section class="services-section">
    <div class="services-container">
      <div class="service-card" @click="navigateToDoc('elasticsearch')">
        <div class="service-icon">
          <img src="../assets/elasticsearch.svg" alt="ElasticSearch Icon" />
        </div>
        <h3 class="service-title">ElasticSearch</h3>
        <p class="service-description">Repositório remoto de projetos</p>
      </div>

      <div class="service-card" @click="navigateToDoc('filebeat')">
        <div class="service-icon">
          <img src="../assets/elastic-beats.svg" alt="Filebeat Icon" />
        </div>
        <h3 class="service-title">Filebeat</h3>
        <p class="service-description">Repositório remoto de projetos</p>
      </div>

      <div class="service-card" @click="navigateToDoc('gitlab')">
        <div class="service-icon">
          <img src="../assets/gitlab-svgrepo-com.svg" alt="Gitlab Icon" />
        </div>
        <h3 class="service-title">Gitlab</h3>
        <p class="service-description">Repositório remoto de projetos</p>
      </div>

      <div class="service-card" @click="navigateToDoc('registry')">
        <div class="service-icon">
          <img src="../assets/registry-svgrepo-com.svg" alt="Registry Icon" />
        </div>
        <h3 class="service-title">Registry</h3>
        <p class="service-description">Repositório remoto de projetos</p>
      </div>

      <div class="service-card" @click="navigateToDoc('kibana')">
        <div class="service-icon">
          <img src="../assets/kibana-svgrepo-com (1).svg" alt="Kibana Icon" />
        </div>
        <h3 class="service-title">Kibana</h3>
        <p class="service-description">Repositório remoto de projetos</p>
      </div>

      <div class="service-card" @click="navigateToDoc('servidores')">
        <div class="service-icon">
          <img src="../assets/server-svgrepo-com.svg" alt="Servidores Icon" />
        </div>
        <h3 class="service-title">Servidores</h3>
        <p class="service-description">Repositório remoto de projetos</p>
      </div>
      
      <div class="service-card" @click="navigateToDoc('gitlab-cicd')">
        <div class="service-icon">
          <img src="../assets/cicd-icon.svg" alt="CI/CD Icon" />
        </div>
        <h3 class="service-title">GitLab CI/CD</h3>
        <p class="service-description">Ferramenta de Deploy Integrado do GitLab</p>
      </div>
      
      <div class="service-card" @click="navigateToDoc('docker')">
        <div class="service-icon">
          <img src="../assets/docker-icon.svg" alt="Docker Icon" />
        </div>
        <h3 class="service-title">Docker</h3>
        <p class="service-description">Ferramenta de gerenciamento de container</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function navigateToDoc(service) {
  router.push({ name: 'markdown', params: { service } });
}
</script>

<style scoped>
.services-section {
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

.services-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.service-card:hover {
  transform: translateY(-5px);
  border-color: #db7f34;
  box-shadow: 0 5px 15px rgba(219, 127, 52, 0.4);
}

/* .service-card::after {
  content: 'Ver documentação';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #db7f34;
  color: white;
  text-align: center;
  padding: 8px 0;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.service-card:hover::after {
  transform: translateY(0);
} */

.service-icon {
  margin-bottom: 1rem;
  width: 40px;
  height: 40px;
}

.service-icon img {
  width: 100%;
  height: 100%;
}

.service-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.service-description {
  font-size: 0.9rem;
  color: #ccc;
}

@media (max-width: 768px) {
  .services-container {
    grid-template-columns: 1fr;
  }
}
</style>
