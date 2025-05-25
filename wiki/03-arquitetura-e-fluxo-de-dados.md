# Arquitetura e Fluxo de Dados

Este documento detalha a arquitetura e o fluxo de dados da aplicação Dev-Docs, explicando como os diferentes componentes interagem entre si.

## Visão Geral da Arquitetura

A aplicação Dev-Docs segue uma arquitetura cliente-servidor com os seguintes componentes principais:

1. **Frontend (Cliente)**:
   - Aplicação Vue.js que gerencia a interface do usuário e a lógica de apresentação
   - Utiliza Vue Router para navegação entre páginas
   - Utiliza Pinia para gerenciamento de estado
   - Comunica-se com o backend através de requisições HTTP

2. **Backend (Servidor)**:
   - API serverless na Vercel que atua como proxy para a API do GitHub
   - Implementada com Express.js
   - Gerencia a autenticação OAuth com o GitHub
   - Protege as credenciais do cliente e evita problemas de CORS

3. **API do GitHub**:
   - Fornece dados sobre repositórios, usuários e outros recursos do GitHub
   - Requer autenticação através de tokens OAuth

## Diagrama de Arquitetura

```
+------------------+       +------------------+       +------------------+
|                  |       |                  |       |                  |
|  Frontend        |       |  Backend         |       |  GitHub API      |
|  (Vue.js)        | <---> |  (Express.js)    | <---> |                  |
|                  |       |  (Vercel)        |       |                  |
+------------------+       +------------------+       +------------------+
        ^                          ^
        |                          |
        v                          v
+------------------+       +------------------+
|                  |       |                  |
|  Local Storage   |       |  Environment     |
|  (Token)         |       |  Variables       |
|                  |       |                  |
+------------------+       +------------------+
```

## Fluxo de Dados

### Fluxo de Autenticação

1. O usuário clica em "Login com GitHub" no frontend
2. O frontend redireciona o usuário para a página de autorização do GitHub
3. O usuário autoriza a aplicação no GitHub
4. O GitHub redireciona o usuário de volta para a aplicação com um código de autorização
5. O frontend envia o código para o backend
6. O backend troca o código por um token de acesso com o GitHub
7. O backend retorna o token para o frontend
8. O frontend armazena o token no localStorage
9. O frontend usa o token para autenticar requisições subsequentes

```
+----------+    1. Clique no botão de login     +----------+
|          | --------------------------------->  |          |
|  Usuário |                                     | Frontend |
|          | <---------------------------------  |          |
+----------+    2. Redirecionamento para GitHub  +----------+
     |                                                |
     v                                                v
+----------+    3. Autorização                  +----------+
|          | --------------------------------->  |          |
|  GitHub  |                                     | Backend  |
|          | <---------------------------------  |          |
+----------+    6. Troca código por token       +----------+
```

### Fluxo de Acesso aos Dados

1. O usuário navega para uma página que requer dados do GitHub (ex: lista de repositórios)
2. O frontend verifica se o usuário está autenticado (token presente no localStorage)
3. O frontend faz uma requisição para o backend, incluindo o token de acesso
4. O backend encaminha a requisição para a API do GitHub, incluindo o token
5. A API do GitHub retorna os dados solicitados
6. O backend encaminha os dados para o frontend
7. O frontend atualiza o estado da aplicação e renderiza os dados na interface

```
+----------+    1. Requisição de dados     +----------+    3. Requisição com token    +----------+
|          | --------------------------->  |          | --------------------------->  |          |
| Frontend |                               | Backend  |                               | GitHub   |
|          | <---------------------------  |          | <---------------------------  |          |
+----------+    6. Resposta com dados     +----------+    5. Resposta com dados     +----------+
     |                                          |
     v                                          |
+----------+                                    |
|          |                                    |
|  UI      |                                    |
|          |                                    |
+----------+                                    v
                                          +----------+
                                          |          |
                                          |  Logs    |
                                          |          |
                                          +----------+
```

## Componentes Principais

### Frontend

#### Estrutura de Diretórios

```
src/
├── assets/           # Recursos estáticos
├── components/       # Componentes Vue reutilizáveis
├── router/           # Configuração do Vue Router
├── services/         # Serviços para comunicação com APIs
├── store/            # Stores Pinia para gerenciamento de estado
├── views/            # Componentes de página
├── App.vue           # Componente raiz
└── main.js           # Ponto de entrada da aplicação
```

#### Stores Pinia

- **auth.js**: Gerencia o estado de autenticação, token e perfil do usuário
- **projects.js**: Gerencia a lista de repositórios e detalhes de projetos

#### Serviços

- **githubService.js**: Encapsula a lógica de comunicação com a API do GitHub

#### Componentes de Página (Views)

- **HomeView.vue**: Página inicial com lista de repositórios
- **LoginView.vue**: Página de login
- **CallbackView.vue**: Página de callback para processamento da autenticação OAuth
- **ProjectDetailsView.vue**: Página de detalhes do projeto
- **LogoutView.vue**: Página de logout

### Backend

#### Estrutura de Diretórios

```
api/
├── index.cjs         # Implementação da API Express
└── server.cjs        # Ponto de entrada para a Vercel
```

#### Endpoints da API

- **POST /api/github/token**: Troca o código de autorização por um token de acesso
- **GET /api/github/user**: Obtém o perfil do usuário autenticado
- **GET /api/github/repos**: Obtém a lista de repositórios do usuário
- **GET /api/github/repos/:owner/:repo**: Obtém detalhes de um repositório específico
- **GET /api/github/repos/:owner/:repo/readme**: Obtém o README de um repositório
- **GET /api/github/repos/:owner/:repo/contents**: Obtém o conteúdo de um diretório ou arquivo
- **GET /api/github/repos/:owner/:repo/languages**: Obtém as linguagens usadas em um repositório

## Gerenciamento de Estado

A aplicação utiliza Pinia para gerenciamento de estado, com os seguintes stores principais:

### Auth Store

```javascript
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userProfile: (state) => state.user
  },
  
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
      // Implementação...
    }
  }
})
```

### Projects Store

```javascript
import { defineStore } from 'pinia'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getProjectById: (state) => (owner, repo) => {
      return state.projects.find(p => p.owner.login === owner && p.name === repo)
    }
  },
  
  actions: {
    async fetchProjects() {
      // Implementação...
    },
    
    async fetchProjectDetails(owner, repo) {
      // Implementação...
    }
  }
})
```

## Considerações de Desempenho

- **Lazy Loading**: Componentes de página são carregados sob demanda usando importação dinâmica
- **Caching**: Resultados de requisições são armazenados em cache quando apropriado
- **Paginação**: Resultados de listas são paginados para melhorar o desempenho

## Considerações de Segurança

- **Tokens**: Tokens de acesso são armazenados apenas no cliente e nunca enviados para servidores de terceiros
- **Proxy API**: O backend atua como proxy para proteger as credenciais do cliente
- **Sanitização de Conteúdo**: Conteúdo markdown é sanitizado antes de ser renderizado para prevenir XSS

## Monitoramento e Logs

- **Logs do Cliente**: Erros e eventos importantes são registrados no console do navegador
- **Logs do Servidor**: A API serverless registra informações de depuração e erros
- **Vercel Analytics**: Fornece insights sobre o desempenho e uso da aplicação
