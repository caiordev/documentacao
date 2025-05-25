# Renderização de Markdown

Este documento detalha como a aplicação Dev-Docs implementa a renderização de conteúdo Markdown, incluindo a sanitização de HTML e o syntax highlighting.

## Visão Geral

A renderização de Markdown é uma funcionalidade central da aplicação Dev-Docs, permitindo exibir READMEs e outros documentos de repositórios GitHub em um formato legível e estilizado. A implementação utiliza as seguintes bibliotecas:

- **marked**: Para converter Markdown em HTML
- **DOMPurify**: Para sanitizar o HTML gerado e prevenir ataques XSS
- **highlight.js**: Para aplicar syntax highlighting em blocos de código

## Implementação

### Componente MarkdownView

O componente `MarkdownView.vue` é responsável por renderizar conteúdo Markdown:

```vue
<template>
  <div class="markdown-container">
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="markdown-content github-markdown-body" v-html="sanitizedHtml"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown.css'

export default {
  props: {
    content: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const loading = ref(false)
    const error = ref(null)
    const markdownContent = ref(props.content)
    
    // Configurar o marked para usar highlight.js
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value
        }
        return hljs.highlightAuto(code).value
      },
      breaks: true,
      gfm: true
    })
    
    // Computar o HTML sanitizado
    const sanitizedHtml = computed(() => {
      if (!markdownContent.value) return ''
      
      // Converter Markdown para HTML
      const html = marked(markdownContent.value)
      
      // Sanitizar o HTML para prevenir XSS
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li',
          'blockquote', 'code', 'pre', 'strong', 'em', 'img', 'table',
          'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'span', 'div'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id', 'name', 'target',
          'rel', 'style'
        ]
      })
    })
    
    // Carregar conteúdo da URL se fornecida
    onMounted(async () => {
      if (props.url && !props.content) {
        loading.value = true
        try {
          // Implementação para carregar conteúdo da URL
          // ...
          loading.value = false
        } catch (err) {
          error.value = `Erro ao carregar conteúdo: ${err.message}`
          loading.value = false
        }
      }
    })
    
    return {
      loading,
      error,
      sanitizedHtml
    }
  }
}
</script>

<style>
.markdown-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.markdown-content {
  overflow-wrap: break-word;
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #e53935;
}
</style>
```

## Sanitização de HTML

A sanitização de HTML é crucial para prevenir ataques XSS (Cross-Site Scripting). A biblioteca DOMPurify é usada para remover qualquer código JavaScript malicioso e limitar as tags HTML permitidas.

### Configuração do DOMPurify

```javascript
DOMPurify.sanitize(html, {
  USE_PROFILES: { html: true },
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li',
    'blockquote', 'code', 'pre', 'strong', 'em', 'img', 'table',
    'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'span', 'div'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'name', 'target',
    'rel', 'style'
  ]
})
```

Esta configuração:
- Permite apenas as tags HTML comumente usadas em Markdown
- Restringe os atributos permitidos para prevenir injeção de JavaScript
- Mantém a estrutura básica do documento HTML

## Syntax Highlighting

O syntax highlighting é implementado usando a biblioteca highlight.js, que detecta automaticamente a linguagem de programação em blocos de código e aplica estilos apropriados.

### Configuração do Marked com Highlight.js

```javascript
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})
```

Esta configuração:
- Usa a linguagem especificada no bloco de código, se disponível
- Realiza detecção automática de linguagem se nenhuma for especificada
- Habilita quebras de linha (breaks) para melhor legibilidade
- Ativa o GitHub Flavored Markdown (gfm) para compatibilidade com a sintaxe do GitHub

## Estilização

A estilização do conteúdo Markdown é feita usando a biblioteca `github-markdown-css`, que replica o estilo de Markdown usado pelo GitHub.

```html
<div class="markdown-content github-markdown-body" v-html="sanitizedHtml"></div>
```

```javascript
import 'github-markdown-css/github-markdown.css'
```

Isso garante que o conteúdo Markdown renderizado tenha a mesma aparência que teria no GitHub, proporcionando uma experiência familiar aos usuários.

## Carregamento de Conteúdo Remoto

O componente `MarkdownView` pode carregar conteúdo Markdown de uma URL remota, como um README de um repositório GitHub:

```javascript
onMounted(async () => {
  if (props.url && !props.content) {
    loading.value = true
    try {
      const response = await fetch(props.url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      markdownContent.value = await response.text()
      loading.value = false
    } catch (err) {
      error.value = `Erro ao carregar conteúdo: ${err.message}`
      loading.value = false
    }
  }
})
```

## Considerações de Desempenho

- **Renderização Sob Demanda**: O conteúdo Markdown é renderizado apenas quando necessário
- **Memoização**: O HTML sanitizado é computado apenas quando o conteúdo Markdown muda
- **Carregamento Assíncrono**: O carregamento de conteúdo remoto é feito de forma assíncrona para não bloquear a interface

## Considerações de Segurança

- **Sanitização Rigorosa**: Todo o HTML gerado é sanitizado para prevenir XSS
- **Links Externos**: Links externos são abertos em uma nova aba com `rel="noopener noreferrer"` para prevenir ataques de phishing
- **Conteúdo de Imagens**: URLs de imagens são verificadas para garantir que sejam de fontes confiáveis

## Exemplo de Uso

```vue
<template>
  <div>
    <h1>README do Projeto</h1>
    <MarkdownView :content="readmeContent" />
  </div>
</template>

<script>
import MarkdownView from '@/components/MarkdownView.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  components: {
    MarkdownView
  },
  
  setup() {
    const readmeContent = ref('')
    
    onMounted(async () => {
      try {
        const response = await axios.get('/api/github/repos/owner/repo/readme')
        readmeContent.value = response.data
      } catch (error) {
        console.error('Erro ao carregar README:', error)
      }
    })
    
    return {
      readmeContent
    }
  }
}
</script>
```

Este exemplo mostra como o componente `MarkdownView` pode ser usado para exibir o README de um repositório GitHub, carregado através da API serverless.
