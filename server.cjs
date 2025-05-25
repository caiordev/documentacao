const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// GitHub OAuth proxy endpoint
app.post('/api/github/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    // Get client ID from environment variable
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    
    // Make request to GitHub's token endpoint
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      code: code,
      redirect_uri: redirect_uri
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Return the token response to client
    res.json(response.data);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ 
      error: 'Failed to exchange code for token',
      details: error.message 
    });
  }
});

// Handle GitHub API requests
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
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    });
  }
});

// Handle GitHub repos requests
app.get('/api/github/repos', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      details: error.message 
    });
  }
});

// Catch-all route to serve the Vue app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
