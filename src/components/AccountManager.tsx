import React, { useState } from 'react';
import { useStore } from '../store';
import { ChatwootAccount } from '../types';
import { getProfile } from '../api/chatwoot';
import { Plus, Server, Trash2, CheckCircle, X, Loader2, Edit2, Save, Settings, Globe, Info, Download, ExternalLink, Monitor, Terminal } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b'];

export default function AccountManager() {
  const { accounts, activeAccountId, addAccount, removeAccount, setActiveAccount } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showCorsSettings, setShowCorsSettings] = useState(false);
  const [corsProxy, setCorsProxy] = useState(useStore.getState().corsProxy);

  const resetForm = () => {
    setName('');
    setUrl('');
    setToken('');
    setAccountId('');
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setShowForm(false);
    setEditingId(null);
    setTestResult(null);
  };

  const handleSaveAccount = () => {
    if (!name || !url || !token || !accountId) return;

    const accountData: ChatwootAccount = {
      id: editingId || Date.now().toString(),
      name,
      url: url.replace(/\/$/, ''),
      accessToken: token,
      accountId: parseInt(accountId),
      color,
    };

    if (editingId) {
      // Update existing account
      useStore.setState((state) => ({
        accounts: state.accounts.map((a) => (a.id === editingId ? accountData : a)),
      }));
    } else {
      addAccount(accountData);
    }

    resetForm();
  };

  const handleEditAccount = (account: ChatwootAccount) => {
    setEditingId(account.id);
    setName(account.name);
    setUrl(account.url);
    setToken(account.accessToken);
    setAccountId(account.accountId.toString());
    setColor(account.color);
    setShowForm(true);
  };

  const handleTestConnection = async () => {
    if (!url || !token || !accountId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const tempAccount: ChatwootAccount = {
        id: 'test',
        name: 'Test',
        url: url.replace(/\/$/, ''),
        accessToken: token,
        accountId: parseInt(accountId),
        color: '#6366f1',
      };
      const profile = await getProfile(tempAccount);
      setTestResult({ success: true, message: `Conectado como ${profile.name} (${profile.email})` });
    } catch (error: any) {
      let message = error.message || 'Falha na conexão';
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        message = 'Erro de CORS: Configure o Chatwoot para permitir requisições do navegador ou use um proxy CORS nas configurações.';
      }
      setTestResult({ success: false, message });
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas Chatwoot</h2>
          <p className="text-gray-500 mt-1">Gerencie suas conexões com instâncias do Chatwoot</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCorsSettings(!showCorsSettings)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe size={18} />
            CORS Proxy
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Nova Conta
          </button>
        </div>
      </div>

      {/* CORS Proxy Settings */}
      {showCorsSettings && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Configuração de CORS Proxy</h3>
              <p className="text-sm text-amber-800 mb-4">
                Escolha uma das opções abaixo para resolver o erro de CORS:
              </p>
              
              <div className="space-y-3 mb-4">
                {/* Opção Mais Fácil - Extensão do Navegador */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        ⭐
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-green-900 mb-1">Opção Mais Fácil: Extensão do Navegador</p>
                      <p className="text-xs text-green-800 mb-3">
                        Instale uma extensão que desativa CORS apenas no seu navegador. Funciona instantaneamente!
                      </p>
                      <div className="space-y-2">
                        <a
                          href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-green-50 border border-green-300 rounded text-xs transition-colors"
                        >
                          <span className="text-lg">🌐</span>
                          <div>
                            <span className="font-medium text-green-900">Chrome/Edge: Allow CORS</span>
                            <span className="block text-green-700">Clique para instalar →</span>
                          </div>
                          <ExternalLink size={12} className="ml-auto text-green-600" />
                        </a>
                        <a
                          href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-green-50 border border-green-300 rounded text-xs transition-colors"
                        >
                          <span className="text-lg">🦊</span>
                          <div>
                            <span className="font-medium text-green-900">Firefox: CORS Everywhere</span>
                            <span className="block text-green-700">Clique para instalar →</span>
                          </div>
                          <ExternalLink size={12} className="ml-auto text-green-600" />
                        </a>
                      </div>
                      <div className="mt-3 bg-white rounded p-2 border border-green-200">
                        <p className="text-xs text-green-800">
                          <strong>Instruções:</strong> Instale a extensão → Ative ela (ícone na barra) → Recarregue esta página → Pronto! ✅
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-amber-100">
                  <p className="font-medium text-sm text-gray-900 mb-2">🚀 Opção 2: Usar Proxy CORS Público</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Clique em um dos proxies abaixo para usar automaticamente:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const proxy = 'https://api.allorigins.win/raw?url=';
                        setCorsProxy(proxy);
                        useStore.getState().setCorsProxy(proxy);
                        setShowCorsSettings(false);
                      }}
                      className="text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-xs transition-colors"
                    >
                      <span className="font-medium text-blue-900">AllOrigins</span>
                      <span className="block text-blue-700 mt-0.5">Gratuito</span>
                    </button>
                    <button
                      onClick={() => {
                        const proxy = 'https://corsproxy.io/?';
                        setCorsProxy(proxy);
                        useStore.getState().setCorsProxy(proxy);
                        setShowCorsSettings(false);
                      }}
                      className="text-left px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded text-xs transition-colors"
                    >
                      <span className="font-medium text-green-900">CORSProxy.io</span>
                      <span className="block text-green-700 mt-0.5">Rápido</span>
                    </button>
                    <button
                      onClick={() => {
                        const proxy = 'https://cors-anywhere.herokuapp.com/';
                        setCorsProxy(proxy);
                        useStore.getState().setCorsProxy(proxy);
                        setShowCorsSettings(false);
                      }}
                      className="text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-xs transition-colors"
                    >
                      <span className="font-medium text-purple-900">CORS Anywhere</span>
                      <span className="block text-purple-700 mt-0.5">Popular</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    💡 Se nenhum funcionar, use a Opção 1 (extensão) ou Opção 3 (configurar servidor)
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-amber-100">
                  <p className="font-medium text-sm text-gray-900 mb-2">⚙️ Opção 3: Configurar CORS no Chatwoot (Permanente)</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Solução definitiva. Escolha como instalar:
                  </p>
                  
                  {/* Script Automático */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200 mb-3">
                    <div className="flex items-start gap-2">
                      <Terminal size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-indigo-900 mb-1">🤖 Automático (Recomendado)</p>
                        <p className="text-xs text-indigo-700 mb-2">
                          Baixe e execute o script no servidor do Chatwoot:
                        </p>
                        <a
                          href="/enable-cors.sh"
                          download
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                        >
                          <Download size={12} />
                          Baixar Script Automático
                        </a>
                        <p className="text-xs text-indigo-600 mt-2">
                          Depois de baixar, execute no servidor:
                        </p>
                        <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mt-1">
                          chmod +x enable-cors.sh<br />
                          sudo ./enable-cors.sh
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Manual */}
                  <details className="bg-gray-50 rounded-lg border border-gray-200">
                    <summary className="px-3 py-2 cursor-pointer text-xs font-medium text-gray-700 hover:text-gray-900">
                      📝 Fazer Manualmente (avançado)
                    </summary>
                    <div className="px-3 pb-3 space-y-2">
                      <p className="text-xs text-gray-600">
                        1. Acesse o servidor via SSH
                      </p>
                      <p className="text-xs text-gray-600">
                        2. Edite o arquivo .env do Chatwoot e adicione:
                      </p>
                      <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
                        ENABLE_API_CORS=true
                      </code>
                      <p className="text-xs text-gray-600">
                        3. Reinicie o Chatwoot:
                      </p>
                      <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
                        # Docker:<br />
                        docker compose down && docker compose up -d<br />
                        <br />
                        # Linux:<br />
                        sudo systemctl restart chatwoot.target
                      </code>
                    </div>
                  </details>

                  <button
                    onClick={() => {
                      setCorsProxy('');
                      useStore.getState().setCorsProxy('');
                    }}
                    className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm w-full"
                  >
                    Desativar Proxy (após configurar CORS no servidor)
                  </button>
                </div>

                <div className="bg-white rounded-lg p-4 border border-amber-100">
                  <p className="font-medium text-sm text-gray-900 mb-2">🔧 Opção 3: Proxy Personalizado</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Se você tem seu próprio proxy CORS, insira a URL abaixo:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={corsProxy}
                      onChange={(e) => setCorsProxy(e.target.value)}
                      placeholder="https://seu-proxy.com/"
                      className="flex-1 px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-sm"
                    />
                    <button
                      onClick={() => {
                        useStore.getState().setCorsProxy(corsProxy);
                        setShowCorsSettings(false);
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              </div>

              {useStore.getState().corsProxy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    ✓ <strong>Proxy ativo:</strong> {useStore.getState().corsProxy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Editar Conta' : 'Adicionar Nova Conta'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Conta</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Minha Empresa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Chatwoot</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-chatwoot.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token de Acesso</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Seu access_token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
              <input
                type="number"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {testResult && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.success ? <CheckCircle size={18} /> : <X size={18} />}
              {testResult.message}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleTestConnection}
              disabled={testing || !url || !token || !accountId}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {testing ? <Loader2 size={16} className="animate-spin" /> : <Server size={16} />}
              Testar Conexão
            </button>
            <button
              onClick={handleSaveAccount}
              disabled={!name || !url || !token || !accountId}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? 'Salvar Alterações' : 'Adicionar Conta'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Server size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma conta configurada</h3>
          <p className="text-gray-500 mt-1">Adicione sua primeira conta Chatwoot para começar</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
              activeAccountId === account.id ? 'border-indigo-500 shadow-md' : 'border-gray-200'
            }`}
            onClick={() => setActiveAccount(activeAccountId === account.id ? null : account.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: account.color }}
                >
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{account.url}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditAccount(account); }}
                  className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeAccount(account.id); }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                Account #{account.accountId}
              </span>
              {activeAccountId === account.id && (
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                  Ativa
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
