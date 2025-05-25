# Dev-Docs - Documentação de Projetos GitHub

Uma aplicação Vue.js para visualizar e gerenciar documentação de repositórios GitHub, com autenticação OAuth para acessar repositórios privados.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Autenticação GitHub OAuth](#autenticação-github-oauth)
- [Implantação](#implantação)
- [Resolução de Problemas](#resolução-de-problemas)

## 🔍 Visão Geral

Dev-Docs é uma aplicação web que permite aos usuários visualizar e gerenciar documentação de seus repositórios GitHub. A aplicação utiliza autenticação OAuth do GitHub para acessar repositórios privados e exibir seus READMEs, wikis e outros arquivos de documentação em um formato amigável.

## ✨ Funcionalidades

- **Autenticação GitHub OAuth**: Login seguro com sua conta GitHub
- **Listagem de Repositórios**: Visualize todos os seus repositórios (públicos e privados)
- **Visualização de README**: Renderização de arquivos README.md com suporte a Markdown
- **Detalhes do Projeto**: Informações detalhadas sobre cada repositório
- **Navegação de Arquivos**: Explore a estrutura de arquivos dos repositórios
- **Interface Responsiva**: Experiência de usuário otimizada para dispositivos móveis e desktop

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - Vue.js 3 (Composition API)
  - Vue Router
  - Pinia (Gerenciamento de estado)
  - Axios (Requisições HTTP)
  - Marked (Renderização de Markdown)
  - DOMPurify (Sanitização de HTML)
  - Highlight.js (Syntax highlighting)

- **Backend**:
  - Node.js
  - Express
  - GitHub API

- **Implantação**:
  - Vercel (Frontend e API serverless)

## 🏗️ Arquitetura

A aplicação segue uma arquitetura cliente-servidor:

- **Frontend**: Aplicação Vue.js que gerencia a interface do usuário e a lógica de apresentação
- **Backend**: API serverless na Vercel que atua como proxy para a API do GitHub, evitando problemas de CORS e protegendo as credenciais do cliente

### Estrutura de Diretórios

```
├── api/                  # API serverless para Vercel
│   ├── index.cjs         # Implementação da API Express
│   └── server.cjs        # Ponto de entrada para a Vercel
├── public/               # Arquivos estáticos
├── src/
│   ├── assets/           # Recursos estáticos (imagens, CSS)
│   ├── components/       # Componentes Vue reutilizáveis
│   ├── router/           # Configuração do Vue Router
│   ├── services/         # Serviços para comunicação com APIs
│   ├── store/            # Stores Pinia para gerenciamento de estado
│   ├── views/            # Componentes de página
│   ├── App.vue           # Componente raiz
│   └── main.js           # Ponto de entrada da aplicação
├── .env                  # Variáveis de ambiente (local)
├── package.json          # Dependências e scripts
├── vite.config.js        # Configuração do Vite
└── vercel.json           # Configuração da Vercel
```

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Conta GitHub
- Aplicativo OAuth do GitHub

### Instalação

1. Clone o repositório:
   ```sh
   git clone https://github.com/caiordev/documentacao.git
   cd documentacao
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   VITE_GITHUB_CLIENT_ID=seu_client_id_do_github
   VITE_GITHUB_CLIENT_SECRET=seu_client_secret_do_github
   ```

4. Inicie o servidor de desenvolvimento:
   ```sh
   npm run dev
   ```

5. Em outro terminal, inicie o servidor proxy para autenticação:
   ```sh
   npm run server
   ```

## 🔐 Autenticação GitHub OAuth

### Configuração do Aplicativo OAuth

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha as informações:
   - **Nome da Aplicação**: Dev-Docs (ou outro nome de sua escolha)
   - **URL da Homepage**: URL da sua aplicação (ex: https://dev-docs-2e6bjbo6n-caiordevs-projects.vercel.app)
   - **Descrição da Aplicação**: Opcional
   - **URL de Callback**: URL de callback da sua aplicação (ex: https://dev-docs-2e6bjbo6n-caiordevs-projects.vercel.app/auth/callback)
4. Registre o aplicativo e obtenha o Client ID e Client Secret
5. Adicione essas credenciais ao seu arquivo `.env` e às variáveis de ambiente da Vercel

### Fluxo de Autenticação

1. O usuário clica em "Login com GitHub"
2. É redirecionado para a página de autorização do GitHub
3. Após autorizar, o GitHub redireciona para a URL de callback com um código de autorização
4. A aplicação troca esse código por um token de acesso através da API serverless
5. O token é armazenado localmente e usado para autenticar requisições subsequentes

## 🚀 Implantação

### Implantação na Vercel

1. Instale a CLI da Vercel:
   ```sh
   npm install -g vercel
   ```

2. Faça login na Vercel:
   ```sh
   vercel login
   ```

3. Implante o projeto:
   ```sh
   vercel --prod
   ```

4. Configure as variáveis de ambiente na Vercel:
   - Acesse o painel da Vercel > Seu projeto > Settings > Environment Variables
   - Adicione `VITE_GITHUB_CLIENT_ID` e `VITE_GITHUB_CLIENT_SECRET`

5. Atualize a URL de callback no aplicativo OAuth do GitHub para apontar para sua URL da Vercel

## 🔧 Resolução de Problemas

### Problemas Comuns

#### Erro de CORS

Se você encontrar erros de CORS ao fazer requisições para a API do GitHub, certifique-se de que:
- O servidor proxy está em execução (`npm run server`)
- As requisições estão sendo feitas através do servidor proxy e não diretamente para a API do GitHub

#### Erro de Autenticação

Se você encontrar erros de autenticação:
- Verifique se o Client ID e Client Secret estão configurados corretamente
- Certifique-se de que a URL de callback no aplicativo OAuth do GitHub corresponde exatamente à URL usada na aplicação
- Verifique se o token de acesso está sendo armazenado e enviado corretamente

#### Erro 404 em Rotas do Vue Router

Se você encontrar erros 404 ao acessar rotas diretamente:
- Certifique-se de que a configuração do Vercel está correta para lidar com o modo de história do Vue Router
- Verifique se o arquivo `vercel.json` está configurado para redirecionar todas as rotas para o `index.html`

#### Erro de Módulo ES

Se você encontrar erros relacionados a módulos ES vs CommonJS:
- Verifique se os arquivos da API têm a extensão `.cjs` para serem tratados como módulos CommonJS
- Certifique-se de que as importações estão usando o caminho correto para os arquivos `.cjs`
