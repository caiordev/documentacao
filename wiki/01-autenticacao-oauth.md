# Autenticação GitHub OAuth

Este documento detalha o processo de autenticação OAuth do GitHub implementado no projeto Dev-Docs.

## Visão Geral

A autenticação OAuth permite que os usuários façam login na aplicação usando suas contas do GitHub, sem a necessidade de criar novas credenciais. Isso também permite que a aplicação acesse recursos do GitHub em nome do usuário, como repositórios privados.

## Fluxo de Autenticação

O fluxo de autenticação OAuth do GitHub segue estas etapas:

1. **Redirecionamento para o GitHub**: O usuário clica no botão "Login com GitHub" e é redirecionado para a página de autorização do GitHub.

2. **Autorização do Usuário**: O usuário autoriza a aplicação a acessar seus dados do GitHub.

3. **Redirecionamento de Volta**: O GitHub redireciona o usuário de volta para a aplicação com um código de autorização temporário.

4. **Troca do Código por Token**: A aplicação troca o código de autorização por um token de acesso através de uma requisição ao servidor.

5. **Armazenamento do Token**: O token de acesso é armazenado localmente e usado para autenticar requisições subsequentes à API do GitHub.

## Implementação

### Frontend (Vue.js)

#### Componente LoginView.vue

Este componente exibe o botão de login e inicia o fluxo de autenticação:

```vue
<template>
  <div class="login-container">
    <h1>Login com GitHub</h1>
    <button @click="login" class="login-button">
      <i class="github-icon"></i> Entrar com GitHub
    </button>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
  setup() {
    const authStore = useAuthStore()
    
    const login = () => {
      window.location.href = authStore.getLoginUrl()
    }
    
    return { login }
  }
}
</script>
```

#### Store de Autenticação (auth.js)

Este store gerencia o estado de autenticação e fornece métodos para o fluxo OAuth:

```javascript
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
    error: null
  }),
  
  actions: {
    initializeAuth() {
      this.token = localStorage.getItem('github_access_token')
    },
    
    setToken(token) {
      this.token = token
      localStorage.setItem('github_access_token', token)
    },
    
    clearToken() {
      this.token = null
      this.user = null
      localStorage.removeItem('github_access_token')
    },
    
    async fetchUserProfile() {
      // Implementação para buscar o perfil do usuário
    },
    
    getLoginUrl() {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID 
      const redirectUri = `${window.location.origin}/auth/callback`
      const scope = 'repo+user'
      
      return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`
    }
  }
})
```

#### Componente CallbackView.vue

Este componente processa o código de autorização recebido do GitHub:

```vue
<template>
  <div class="callback-container">
    <div v-if="loading" class="loading">Processando autenticação...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import axios from 'axios'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loading = ref(true)
    const error = ref(null)
    
    onMounted(async () => {
      try {
        const code = route.query.code
        
        if (!code) {
          throw new Error('Código de autorização não recebido')
        }
        
        const redirectUri = `${window.location.origin}/auth/callback`
        const apiUrl = window.location.origin + '/api/github/token'
        
        const tokenResponse = await axios.post(apiUrl, {
          code: code,
          redirect_uri: redirectUri
        })
        
        const accessToken = tokenResponse.data.access_token
        
        if (!accessToken) {
          throw new Error('Token não recebido do GitHub')
        }
        
        authStore.setToken(accessToken)
        await authStore.fetchUserProfile()
        router.push('/')
        
      } catch (error) {
        error.value = `Erro na autenticação: ${error.message}`
      } finally {
        loading.value = false
      }
    })
    
    return { loading, error }
  }
}
</script>
```

### Backend (API Serverless)

O backend atua como um proxy para a API do GitHub, evitando problemas de CORS e protegendo as credenciais do cliente.

#### api/index.cjs

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// GitHub OAuth token endpoint
app.post('/api/github/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    // Verificar se as variáveis de ambiente estão disponíveis
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.VITE_GITHUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        error: 'Server configuration error', 
        details: 'Missing GitHub OAuth credentials' 
      });
    }
    
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirect_uri
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to exchange code for token',
      details: error.message
    });
  }
});

// Outros endpoints da API...

module.exports = app;
```

## Configuração do Aplicativo OAuth no GitHub

Para configurar o aplicativo OAuth no GitHub:

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha as informações:
   - **Nome da Aplicação**: Dev-Docs
   - **URL da Homepage**: URL da sua aplicação
   - **Descrição da Aplicação**: Opcional
   - **URL de Callback**: URL de callback da sua aplicação
4. Registre o aplicativo e obtenha o Client ID e Client Secret
5. Adicione essas credenciais ao seu arquivo `.env` e às variáveis de ambiente da Vercel

## Considerações de Segurança

- **Nunca exponha o Client Secret no frontend**. Sempre use o servidor como intermediário para trocar o código de autorização por um token de acesso.
- Armazene o token de acesso de forma segura, preferencialmente em localStorage ou sessionStorage.
- Implemente um mecanismo de logout que limpe o token armazenado.
- Solicite apenas os escopos (scopes) necessários para sua aplicação funcionar.

## Resolução de Problemas

### Erro de redirect_uri_mismatch

Se você receber um erro "redirect_uri_mismatch" do GitHub, verifique se:

- A URL de callback configurada no aplicativo OAuth do GitHub corresponde exatamente à URL usada na aplicação
- Não há diferenças em protocolo (http vs https), subdomínio, porta ou caminho
- A URL está corretamente codificada quando enviada ao GitHub

### Erro de CORS

Se você encontrar erros de CORS ao trocar o código por um token:

- Certifique-se de que está usando o servidor proxy em vez de fazer a requisição diretamente para o GitHub
- Verifique se o servidor CORS está configurado corretamente para permitir requisições da origem da sua aplicação
