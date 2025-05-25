# Implantação na Vercel

Este documento detalha o processo de implantação da aplicação Dev-Docs na Vercel, incluindo a configuração da API serverless.

## Visão Geral

A Vercel é uma plataforma de hospedagem que permite implantar aplicações frontend e funções serverless em um único lugar. Para o projeto Dev-Docs, usamos a Vercel para hospedar tanto a aplicação Vue.js quanto a API serverless que atua como proxy para a API do GitHub.

## Estrutura do Projeto para Vercel

Para que a aplicação funcione corretamente na Vercel, a seguinte estrutura de arquivos é necessária:

```
├── api/                  # Diretório para funções serverless da Vercel
│   ├── index.cjs         # Implementação da API Express
│   └── server.cjs        # Ponto de entrada para a Vercel
├── vercel.json           # Configuração da Vercel
```

## Configuração do vercel.json

O arquivo `vercel.json` define como a Vercel deve construir e servir a aplicação:

```json
{
  "version": 2,
  "builds": [
    { "src": "api/server.cjs", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/server.cjs" },
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*\\.(js|css|ico|png|jpg|svg|json))", "dest": "/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

Este arquivo configura:

1. **Builds**:
   - `api/server.cjs`: Função serverless usando o runtime Node.js da Vercel
   - `package.json`: Build estático da aplicação Vue.js, com o diretório de saída `dist`

2. **Rotas**:
   - Requisições para `/api/*` são encaminhadas para a função serverless
   - Arquivos estáticos (assets) são servidos diretamente
   - Todas as outras rotas são encaminhadas para `index.html` para suportar o modo de história do Vue Router

## API Serverless

### api/server.cjs

Este é o ponto de entrada para a função serverless na Vercel:

```javascript
const app = require('./index.cjs');

module.exports = (req, res) => {
  // This is necessary for Vercel serverless functions
  return app(req, res);
};
```

### api/index.cjs

Este arquivo contém a implementação da API Express:

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

// Implementação dos endpoints da API...

module.exports = app;
```

## Considerações sobre Módulos ES vs CommonJS

A Vercel suporta tanto módulos ES quanto CommonJS, mas é importante garantir a consistência. No projeto Dev-Docs, usamos a extensão `.cjs` para indicar explicitamente que os arquivos da API devem ser tratados como módulos CommonJS, independentemente da configuração do `package.json`.

Isso é especialmente importante porque o projeto Vue.js está configurado com `"type": "module"` no `package.json`, o que faz com que todos os arquivos `.js` sejam tratados como módulos ES por padrão.

## Processo de Implantação

### Pré-requisitos

- Conta na Vercel
- CLI da Vercel instalada: `npm install -g vercel`

### Passos para Implantação

1. **Login na Vercel**:
   ```sh
   vercel login
   ```

2. **Implantação Inicial**:
   ```sh
   vercel
   ```
   Durante este processo, a Vercel fará algumas perguntas de configuração:
   - Confirme o diretório do projeto
   - Configure o projeto como desejado
   - Confirme se deseja vincular a um projeto existente ou criar um novo

3. **Implantação para Produção**:
   ```sh
   vercel --prod
   ```

### Configuração de Variáveis de Ambiente

As variáveis de ambiente são essenciais para o funcionamento da aplicação, especialmente para a autenticação OAuth do GitHub.

1. Acesse o painel da Vercel > Seu projeto > Settings > Environment Variables
2. Adicione as seguintes variáveis:
   - `VITE_GITHUB_CLIENT_ID`: Client ID do aplicativo OAuth do GitHub
   - `VITE_GITHUB_CLIENT_SECRET`: Client Secret do aplicativo OAuth do GitHub

## Resolução de Problemas

### Erro 404 em Rotas do Vue Router

Se você encontrar erros 404 ao acessar rotas diretamente:
- Verifique se o arquivo `vercel.json` está configurado corretamente para redirecionar todas as rotas para o `index.html`
- Certifique-se de que a configuração de rotas está na ordem correta (as regras são aplicadas na ordem em que aparecem)

### Erro de Módulo ES

Se você encontrar erros como `require is not defined in ES module scope`:
- Verifique se os arquivos da API têm a extensão `.cjs` para serem tratados como módulos CommonJS
- Certifique-se de que as importações estão usando o caminho correto para os arquivos `.cjs`

### Erro de Variáveis de Ambiente

Se a API não conseguir acessar as variáveis de ambiente:
- Verifique se as variáveis estão configuradas corretamente no painel da Vercel
- Certifique-se de que os nomes das variáveis correspondem exatamente aos usados no código
- Lembre-se que as variáveis de ambiente são específicas para cada ambiente (desenvolvimento, preview, produção)
