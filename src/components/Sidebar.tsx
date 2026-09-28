import React from 'react';
import { useStore } from '../store';
import { ViewType } from '../types';
import { Server, Tag, Settings2, LayoutGrid, MessageSquare } from 'lucide-react';

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'accounts', label: 'Contas', icon: <Server size={20} /> },
  { id: 'labels', label: 'Etiquetas', icon: <Tag size={20} /> },
  { id: 'attributes', label: 'Atributos', icon: <Settings2 size={20} /> },
  { id: 'kanban', label: 'Kanban', icon: <LayoutGrid size={20} /> },
];

export default function Sidebar() {
  const { currentView, setCurrentView, accounts, activeAccountId, getActiveAccount } = useStore();
  const activeAccount = getActiveAccount();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Chatwoot</h1>
            <p className="text-xs text-slate-400">Manager</p>
          </div>
        </div>
      </div>

      {/* Active Account */}
      {activeAccount && (
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeAccount.color }}
            />
            <span className="text-sm font-medium truncate">{activeAccount.name}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">{activeAccount.url}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          <p>{accounts.length} conta{accounts.length !== 1 ? 's' : ''} configurada{accounts.length !== 1 ? 's' : ''}</p>
          {accounts.length > 0 && !activeAccountId && (
            <p className="text-amber-400 mt-1">⚠ Selecione uma conta</p>
          )}
        </div>
      </div>
    </aside>
  );
}
