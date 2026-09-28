import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getConversations, updateConversation, toggleConversationStatus, getLabels, getInboxes, getAgents } from '../api/chatwoot';
import { ChatwootConversation, ChatwootLabel, ChatwootInbox, ChatwootAgent } from '../types';
import { Loader2, LayoutGrid, User, MessageSquare, Clock, Tag, ChevronDown, ExternalLink, GripVertical } from 'lucide-react';
import { formatApiError } from '../utils/errors';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abertas',
  resolved: 'Resolvidas',
  pending: 'Pendentes',
  snoozed: 'Pausadas',
};

export default function KanbanBoard() {
  const { getActiveAccount } = useStore();
  const account = getActiveAccount();
  const [conversations, setConversations] = useState<Record<string, ChatwootConversation[]>>({});
  const [labels, setLabels] = useState<ChatwootLabel[]>([]);
  const [inboxes, setInboxes] = useState<ChatwootInbox[]>([]);
  const [agents, setAgents] = useState<ChatwootAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'label'>('status');
  const [filterLabel, setFilterLabel] = useState('');
  const [filterInbox, setFilterInbox] = useState('');
  const [draggedConv, setDraggedConv] = useState<{ conv: ChatwootConversation; fromColumn: string } | null>(null);

  useEffect(() => {
    if (account) fetchAll();
  }, [account]);

  const fetchAll = async () => {
    if (!account) return;
    setLoading(true);
    setError('');
    try {
      const [openRes, resolvedRes, pendingRes, labelsData, inboxesData, agentsData] = await Promise.all([
        getConversations(account, 'open'),
        getConversations(account, 'resolved'),
        getConversations(account, 'pending'),
        getLabels(account),
        getInboxes(account),
        getAgents(account),
      ]);
      
      const allConvs: Record<string, ChatwootConversation[]> = {
        open: openRes.payload || [],
        resolved: resolvedRes.payload || [],
        pending: pendingRes.payload || [],
      };
      
      setConversations(allConvs);
      setLabels(labelsData);
      setInboxes(inboxesData.payload || []);
      setAgents(agentsData);
    } catch (err: any) {
      setError(formatApiError(err));
    }
    setLoading(false);
  };

  const getColumns = (): Record<string, ChatwootConversation[]> => {
    const allConvs = [...(conversations.open || []), ...(conversations.resolved || []), ...(conversations.pending || [])];
    
    let filtered = allConvs;
    if (filterLabel) {
      filtered = filtered.filter((c) => c.labels?.includes(filterLabel));
    }
    if (filterInbox) {
      filtered = filtered.filter((c) => c.inbox_id === parseInt(filterInbox));
    }

    if (groupBy === 'status') {
      return {
        open: filtered.filter((c) => c.status === 'open'),
        pending: filtered.filter((c) => c.status === 'pending'),
        resolved: filtered.filter((c) => c.status === 'resolved'),
      };
    } else if (groupBy === 'priority') {
      return {
        urgent: filtered.filter((c) => c.priority === 'urgent'),
        high: filtered.filter((c) => c.priority === 'high'),
        medium: filtered.filter((c) => c.priority === 'medium'),
        low: filtered.filter((c) => c.priority === 'low'),
        none: filtered.filter((c) => !c.priority),
      };
    } else {
      const byLabel: Record<string, ChatwootConversation[]> = {};
      labels.forEach((l) => {
        const convs = filtered.filter((c) => c.labels?.includes(l.title));
        if (convs.length > 0) byLabel[l.title] = convs;
      });
      const unlabeled = filtered.filter((c) => !c.labels || c.labels.length === 0);
      if (unlabeled.length > 0) byLabel['Sem etiqueta'] = unlabeled;
      return byLabel;
    }
  };

  const handleDragStart = (conv: ChatwootConversation, fromColumn: string) => {
    setDraggedConv({ conv, fromColumn });
  };

  const handleDrop = async (toColumn: string) => {
    if (!draggedConv || !account) return;
    if (draggedConv.fromColumn === toColumn) {
      setDraggedConv(null);
      return;
    }

    try {
      if (groupBy === 'status') {
        await toggleConversationStatus(account, draggedConv.conv.id, toColumn);
      } else if (groupBy === 'priority') {
        const priority = toColumn === 'none' ? null : toColumn;
        await updateConversation(account, draggedConv.conv.id, { priority });
      }
      
      // Refresh
      await fetchAll();
    } catch (err: any) {
      setError(formatApiError(err));
    }
    setDraggedConv(null);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getInboxName = (inboxId: number) => {
    const inbox = inboxes.find((i) => i.id === inboxId);
    return inbox?.name || `Inbox #${inboxId}`;
  };

  const getAgentName = (conv: ChatwootConversation) => {
    return conv.meta?.assignee?.name || 'Não atribuído';
  };

  if (!account) {
    return (
      <div className="text-center py-16">
        <LayoutGrid size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Selecione uma conta</h3>
        <p className="text-gray-500 mt-1">Selecione uma conta ativa para ver o Kanban</p>
      </div>
    );
  }

  const columns = getColumns();
  const columnNames: Record<string, string> = {
    open: '🟢 Abertas',
    pending: '🟡 Pendentes',
    resolved: '✅ Resolvidas',
    urgent: '🔴 Urgente',
    high: '🟠 Alta',
    medium: '🟡 Média',
    low: '🔵 Baixa',
    none: '⚪ Sem prioridade',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kanban</h2>
          <p className="text-gray-500 mt-1">Visualize e gerencie conversas da conta <span className="font-medium text-indigo-600">{account.name}</span></p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Agrupar por</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="status">Status</option>
            <option value="priority">Prioridade</option>
            <option value="label">Etiqueta</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar por etiqueta</label>
          <select
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas</option>
            {labels.map((l) => (
              <option key={l.id} value={l.title}>{l.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar por inbox</label>
          <select
            value={filterInbox}
            onChange={(e) => setFilterInbox(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            {inboxes.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnKey, convs]) => (
            <div
              key={columnKey}
              className="min-w-[320px] max-w-[380px] flex-shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(columnKey)}
            >
              <div className="bg-gray-100 rounded-t-xl px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">
                  {columnNames[columnKey] || columnKey}
                </h3>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600 font-medium">
                  {convs.length}
                </span>
              </div>
              <div className="bg-gray-50 rounded-b-xl p-2 space-y-2 min-h-[200px] border border-t-0 border-gray-200">
                {convs.map((conv) => (
                  <div
                    key={conv.id}
                    draggable
                    onDragStart={() => handleDragStart(conv, columnKey)}
                    className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-gray-300" />
                        <span className="text-xs font-medium text-gray-400">#{conv.id}</span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(conv.timestamp)}
                      </span>
                    </div>
                    
                    {conv.meta?.sender && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User size={12} className="text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {conv.meta.sender.name}
                        </span>
                      </div>
                    )}

                    {conv.labels && conv.labels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {conv.labels.map((label) => {
                          const labelData = labels.find((l) => l.title === label);
                          return (
                            <span
                              key={label}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: labelData ? `${labelData.color}20` : '#f3f4f6',
                                color: labelData ? labelData.color : '#6b7280',
                              }}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={10} />
                        {getInboxName(conv.inbox_id)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        {getAgentName(conv)}
                      </span>
                    </div>

                    {conv.priority && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[conv.priority] || 'bg-gray-100 text-gray-600'}`}>
                          {conv.priority}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <a
                        href={`${account.url}/app/accounts/${account.accountId}/conversations/${conv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={10} />
                        Abrir no Chatwoot
                      </a>
                    </div>
                  </div>
                ))}
                {convs.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhuma conversa
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
