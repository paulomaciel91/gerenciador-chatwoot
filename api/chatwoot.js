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
    
    if (!url || !token || !endpoint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Constrói a URL da API
    let apiUrl;
    if (isProfile) {
      // Endpoint de profile não usa accountId
      apiUrl = `${url}/api/v1/profile`;
    } else {
      if (!accountId) {
        return res.status(400).json({ error: 'Missing accountId' });
      }
      apiUrl = `${url}/api/v1/accounts/${accountId}${endpoint}`;
    }
    
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
    
    // Tenta fazer parse como JSON, se falhar retorna como texto
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
    res.status(500).json({ error: error.message });
  }
}
