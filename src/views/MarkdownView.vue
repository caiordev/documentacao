<template>
  <div class="markdown-view">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-item">Início</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ title || 'Documentação' }}</span>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando documentação...</p>
    </div>
    <div v-else-if="error" class="error">
      <h2>Erro ao carregar a documentação</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <router-link to="/" class="back-link">Voltar para a página inicial</router-link>
        <button @click="retryLoading" class="retry-button">Tentar novamente</button>
      </div>
    </div>
    <div v-else class="markdown-container">
      <div class="markdown-content" v-html="markdownContent"></div>
      <div class="back-navigation">
        <!-- <router-link to="/" class="back-link">
          <span class="back-icon">←</span> Voltar para a página inicial
        </router-link> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
});

const route = useRoute();
const markdownContent = ref('');
const loading = ref(true);
const error = ref(null);
const title = ref('');

async function loadMarkdownContent() {
  loading.value = true;
  error.value = null;
  
  try {
    const serviceName = route.params.service;
    
    const response = await fetch(`/docs/${serviceName}.md`);
    
    if (!response.ok) {
      throw new Error(`Não foi possível carregar a documentação para ${serviceName}`);
    }
    
    const markdown = await response.text();
    
    const firstLine = markdown.split('\n')[0];
    if (firstLine.startsWith('# ')) {
      title.value = firstLine.substring(2);
    } else {
      title.value = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }
    
    markdownContent.value = marked(markdown);
    
  } catch (err) {
    console.error('Error loading markdown:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function retryLoading() {
  loadMarkdownContent();
}

onMounted(() => {
  loadMarkdownContent();
});
</script>

<style scoped>
.markdown-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  color: #f8f8f8;
}

/* Breadcrumb styles */
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  background-color: #2a2a2a;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.breadcrumb-item {
  color: #3498db;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #2980b9;
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #666;
}

.breadcrumb-current {
  color: #ccc;
  font-weight: 500;
}

/* Loading styles */
.loading {
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
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error styles */
.error {
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 4px solid #ff5252;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.error h2 {
  color: #ff5252;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.retry-button {
  display: inline-block;
  background-color: #2ecc71;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #27ae60;
}

/* Markdown container styles */
.markdown-container {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-navigation {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
  display: flex;
  justify-content: flex-start;
}

.back-link {
  display: inline-flex;
  align-items: center;
  background-color: #3498db;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
  font-weight: 500;
}

.back-link:hover {
  background-color: #2980b9;
}

.back-icon {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}
</style>

<style>
/* Global styles for markdown content */
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #ffffff;
}

.markdown-content h1 {
  font-size: 2em;
  border-bottom: 1px solid #444;
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #444;
  padding-bottom: 0.3em;
}

.markdown-content p {
  margin: 1em 0;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-content li {
  margin: 0.5em 0;
}

.markdown-content blockquote {
  border-left: 4px solid #3498db;
  padding-left: 1em;
  margin: 1em 0;
  color: #aaa;
}

.markdown-content code {
  font-family: 'Courier New', Courier, monospace;
  background-color: #333;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-content pre {
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
}

.markdown-content a {
  color: #3498db;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #444;
  padding: 0.5em;
  text-align: left;
}

.markdown-content table th {
  background-color: #333;
}

.markdown-content table tr:nth-child(even) {
  background-color: #2d2d2d;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border-radius: 4px;
}
</style>
