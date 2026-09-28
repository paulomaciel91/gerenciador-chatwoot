#!/usr/bin/env node

// Servidor local para desenvolvimento
// Roda o frontend + proxy para Chatwoot

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy para Chatwoot API
app.post('/api/chatwoot', async (req, res) => {
  try {
    const { url, accountId, token, endpoint, method = 'GET', body, isProfile = false } = req.body;
    
    console.log('📡 Proxy request:', { url, accountId, endpoint, method, isProfile });
    
    if (!url || !token || !endpoint) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Constrói a URL da API
    let apiUrl;
    if (isProfile) {
      apiUrl = `${url}/api/v1/profile`;
    } else {
      if (!accountId) {
        return res.status(400).json({ error: 'Missing accountId' });
      }
      apiUrl = `${url}/api/v1/accounts/${accountId}${endpoint}`;
    }
    
    console.log('🔗 Calling Chatwoot API:', apiUrl);
    
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
    
    console.log('✅ Chatwoot response status:', response.status);
    
    // Tenta fazer parse como JSON
    let parsedData;
    try {
      parsedData = data ? JSON.parse(data) : null;
    } catch (e) {
      parsedData = data;
    }
    
    res.status(response.status).json({
      status: response.status,
      responseData: parsedData,
    });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
🚀 Chatwoot Manager rodando em http://localhost:${PORT}

📡 Proxy API: http://localhost:${PORT}/api/chatwoot
📦 Frontend: http://localhost:${PORT}

Pressione Ctrl+C para parar
  `);
});
