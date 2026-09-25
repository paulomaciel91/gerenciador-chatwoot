// API Proxy para Chatwoot - Roda no servidor, sem CORS
// Deploy: Vercel, Netlify, Railway, ou qualquer servidor Node.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Proxy para API do Chatwoot
app.post('/api/chatwoot', async (req, res) => {
  try {
    const { url, accountId, token, endpoint, method = 'GET', body } = req.body;
    
    const apiUrl = `${url}/api/v1/accounts/${accountId}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': token,
      },
    };
    
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(apiUrl, options);
    const data = await response.text();
    
    res.status(response.status).json({
      status: response.status,
      data: data ? JSON.parse(data) : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy para Profile
app.post('/api/chatwoot/profile', async (req, res) => {
  try {
    const { url, token } = req.body;
    
    const response = await fetch(`${url}/api/v1/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': token,
      },
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Chatwoot API Proxy rodando na porta ${PORT}`);
});
