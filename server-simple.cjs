const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub OAuth token endpoint
app.post('/api/github/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.VITE_GITHUB_CLIENT_SECRET;
    
    console.log('Exchanging code for token with GitHub', { code, redirect_uri, clientId });
    
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
    
    console.log('Token response received');
    res.json(response.data);
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    res.status(500).json({ 
      error: 'Failed to exchange code for token',
      details: error.message 
    });
  }
});

// GitHub user endpoint
app.get('/api/github/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    });
  }
});

// GitHub repos endpoint
app.get('/api/github/repos', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
        visibility: 'all',  // Explicitamente solicitando todos os repositórios (públicos e privados)
        affiliation: 'owner,collaborator,organization_member'  // Incluindo todos os tipos de afiliação
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repos:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      details: error.message 
    });
  }
});

// Get specific repository details
app.get('/api/github/repos/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repository details:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch repository details',
      details: error.message 
    });
  }
});

// Get repository README
app.get('/api/github/repos/:owner/:repo/readme', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching README:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch README',
      details: error.message 
    });
  }
});

// Get repository wiki pages
app.get('/api/github/repos/:owner/:repo/wiki', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // GitHub API doesn't have a direct endpoint for wiki pages
    // We'll check if the wiki is enabled
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!repoResponse.data.has_wiki) {
      return res.status(404).json({ error: 'This repository does not have a wiki' });
    }
    
    // Return a placeholder response since we can't easily get wiki pages via API
    res.json([{
      page_name: 'home',
      title: 'Home',
      html_url: `https://github.com/${owner}/${repo}/wiki`
    }]);
  } catch (error) {
    console.error('Error fetching wiki:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch wiki',
      details: error.message 
    });
  }
});

// Get repository contents
app.get('/api/github/repos/:owner/:repo/contents', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.query.path || '';
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching contents:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch contents',
      details: error.message 
    });
  }
});

// Endpoint para buscar as linguagens de um repositório
app.get('/api/github/repos/:owner/:repo/languages', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repository languages:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch languages',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
