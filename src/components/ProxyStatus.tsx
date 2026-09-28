import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function ProxyStatus() {
  const [status, setStatus] = useState<'checking' | 'working' | 'error' | 'not-deployed'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    checkProxy();
  }, []);

  const checkProxy = async () => {
    try {
      const response = await fetch('/api/chatwoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://httpbin.org',
          accountId: 1,
          token: 'test',
          endpoint: '/get',
          method: 'GET',
          isProfile: false,
        }),
      });

      if (response.ok || response.status === 400) {
        setStatus('working');
      } else if (response.status === 404) {
        setStatus('not-deployed');
      } else {
        setStatus('error');
        setError(`Status: ${response.status}`);
      }
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
        setStatus('not-deployed');
      } else {
        setStatus('error');
        setError(err.message);
      }
    }
  };

  if (status === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-700">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">Verificando proxy...</span>
        </div>
      </div>
    );
  }

  if (status === 'working') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">✅ Proxy funcionando corretamente!</span>
        </div>
      </div>
    );
  }

  if (status === 'not-deployed') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-2">
              ⚠️ Serverless Function não está disponível
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              O preview estático não executa serverless functions. Para usar o Chatwoot Manager, 
              você precisa fazer o deploy no Vercel.
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded p-3 border border-amber-100">
                <p className="text-xs font-medium text-gray-900 mb-1">🚀 Deploy no Vercel (Recomendado):</p>
                <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Faça push deste projeto para o GitHub</li>
                  <li>Acesse <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">vercel.com <ExternalLink size={10} /></a></li>
                  <li>Importe o repositório</li>
                  <li>Clique em "Deploy"</li>
                  <li>Pronto! O proxy vai funcionar automaticamente</li>
                </ol>
              </div>
              <div className="bg-white rounded p-3 border border-amber-100">
                <p className="text-xs font-medium text-gray-900 mb-1">💻 Desenvolvimento Local:</p>
                <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mt-1">
                  npm install express cors<br />
                  node server.js
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <XCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">
            ❌ Erro no Proxy
          </h3>
          <p className="text-sm text-red-800">
            {error || 'Ocorreu um erro ao verificar o proxy'}
          </p>
          <p className="text-xs text-red-700 mt-2">
            Verifique os logs no Vercel para mais detalhes.
          </p>
        </div>
      </div>
    </div>
  );
}
