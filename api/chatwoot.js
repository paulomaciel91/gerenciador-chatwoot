// Vercel Serverless Function - Proxy para Chatwoot
// Deploy: Basta fazer push para o Vercel

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, accountId, token, endpoint, method = 'GET', body, isProfile = false } = req.body;
    
    console.log('Proxy request:', { url, accountId, endpoint, method, isProfile });
    
    if (!url || !token || !endpoint) {
      console.error('Missing required fields:', { url: !!url, token: !!token, endpoint: !!endpoint });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Constrói a URL da API
    let apiUrl;
    if (isProfile) {
      // Endpoint de profile não usa accountId
      apiUrl = `${url}/api/v1/profile`;
    } else {
      if (!accountId) {
        console.error('Missing accountId for non-profile request');
        return res.status(400).json({ error: 'Missing accountId' });
      }
      apiUrl = `${url}/api/v1/accounts/${accountId}${endpoint}`;
    }
    
    console.log('Calling Chatwoot API:', apiUrl);
    
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
    
    console.log('Chatwoot response status:', response.status);
    
    // Tenta fazer parse como JSON, se falhar retorna como texto
    let parsedData;
    try {
      parsedData = data ? JSON.parse(data) : null;
    } catch (e) {
      console.log('Response is not JSON, returning as text');
      parsedData = data;
    }
    
    res.status(response.status).json({
      status: response.status,
      responseData: parsedData,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
