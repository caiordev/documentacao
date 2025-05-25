import express from 'express';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Habilitar CORS para todas as origens em desenvolvimento
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint para trocar o código por um token
app.post('/api/github/token', async (req, res) => {
  try {
    const { code, client_id, client_secret, redirect_uri } = req.body;
    
    console.log('Recebendo solicitação para trocar código por token:');
    console.log('- Código:', code);
    console.log('- Redirect URI:', redirect_uri);
    
    // Fazer a solicitação para a API do GitHub
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id,
      client_secret,
      code,
      redirect_uri
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Resposta recebida do GitHub:', response.data);
    
    // Retornar a resposta do GitHub
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao trocar código por token:', error.message);
    
    // Retornar detalhes do erro
    res.status(500).json({
      error: 'Erro ao trocar código por token',
      message: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy rodando em http://localhost:${PORT}`);
  console.log('Endpoints disponíveis:');
  console.log('- POST /api/github/token - Trocar código por token');
});
