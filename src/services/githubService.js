import axios from 'axios'


// Endpoints da API do GitHub
const GITHUB_API = 'https://api.github.com'
const GITHUB_AUTH_API = 'https://github.com/login/oauth/access_token'

// Serviço para interagir com a API do GitHub
export const githubService = {
  // Autenticação
  async exchangeCodeForToken(code, redirectUri, clientId, clientSecret) {
    try {
      console.log('Trocando código por token via servidor simple.cjs');
      console.log('Redirect URI:', redirectUri);
      
      // Usar a API serverless na Vercel
      const apiUrl = window.location.origin + '/api/github/token'
      console.log('URL da API:', apiUrl)
      const response = await axios.post(
        apiUrl, 
        {
          code: code,
          redirect_uri: redirectUri
          // Não precisamos enviar client_id e client_secret, pois o servidor já os obtém das variáveis de ambiente
        }, 
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resposta do servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao trocar código por token:', error);
      
      // Mensagem de erro mais detalhada
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
      
      throw error;
    }
  },
  
  // Perfil do usuário
  async getUserProfile(token) {
    try {
      const response = await axios.get(`${GITHUB_API}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
      throw error
    }
  },
  
  // Repositórios
  async getRepositories(token) {
    try {
      const response = await axios.get(`${GITHUB_API}/user/repos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          per_page: 100,
          sort: 'updated',
          direction: 'desc',
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Erro ao buscar repositórios:', error)
      throw error
    }
  },
  
  // Detalhes de um repositório específico
  async getRepositoryDetails(token, owner, repo) {
    try {
      const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar detalhes do repositório ${owner}/${repo}:`, error)
      throw error
    }
  },
  
  // README de um repositório
  async getRepositoryReadme(token, owner, repo) {
    try {
      const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar README do repositório ${owner}/${repo}:`, error)
      throw error
    }
  },
  
  // Conteúdo de um repositório
  async getRepositoryContents(token, owner, repo, path = '') {
    try {
      const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar conteúdo do repositório ${owner}/${repo}:`, error)
      throw error
    }
  },
  
  // Linguagens de um repositório
  async getRepositoryLanguages(token, owner, repo) {
    try {
      const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar linguagens do repositório ${owner}/${repo}:`, error)
      throw error
    }
  }
}
