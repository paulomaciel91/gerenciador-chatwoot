import React, { useState } from 'react';
import { useStore } from '../store';
import { ChatwootAccount } from '../types';
import { getProfile } from '../api/chatwoot';
import { Plus, Server, Trash2, CheckCircle, X, Loader2, Edit2, Save } from 'lucide-react';
import { formatApiError } from '../utils/errors';

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
      setTestResult({ success: false, message: formatApiError(error) });
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
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nova Conta
        </button>
      </div>

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
