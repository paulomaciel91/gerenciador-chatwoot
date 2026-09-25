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
    const { url, accountId, token, endpoint, method = 'GET', body } = req.body;
    
    if (!url || !accountId || !token || !endpoint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
}
