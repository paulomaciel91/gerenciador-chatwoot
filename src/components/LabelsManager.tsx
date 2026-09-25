import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../api/chatwoot';
import { ChatwootLabel } from '../types';
import { Plus, Edit2, Trash2, X, Check, Loader2, Tag } from 'lucide-react';

export default function LabelsManager() {
  const { getActiveAccount } = useStore();
  const account = getActiveAccount();
  const [labels, setLabels] = useState<ChatwootLabel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', color: '#6366f1', show_on_sidebar: true });
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) fetchLabels();
  }, [account]);

  const fetchLabels = async () => {
    if (!account) return;
    setLoading(true);
    setError('');
    try {
      const data = await getLabels(account);
      setLabels(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!account || !formData.title) return;
    try {
      const newLabel = await createLabel(account, formData);
      setLabels([...labels, newLabel]);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!account) return;
    try {
      const updated = await updateLabel(account, id, formData);
      setLabels(labels.map((l) => (l.id === id ? updated : l)));
      setEditingId(null);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!account) return;
    if (!confirm('Tem certeza que deseja excluir esta etiqueta?')) return;
    try {
      await deleteLabel(account, id);
      setLabels(labels.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (label: ChatwootLabel) => {
    setEditingId(label.id);
    setFormData({ title: label.title, description: label.description, color: label.color, show_on_sidebar: label.show_on_sidebar });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', color: '#6366f1', show_on_sidebar: true });
    setShowForm(false);
    setEditingId(null);
  };

  if (!account) {
    return (
      <div className="text-center py-16">
        <Tag size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Selecione uma conta</h3>
        <p className="text-gray-500 mt-1">Selecione uma conta ativa para gerenciar etiquetas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Etiquetas</h2>
          <p className="text-gray-500 mt-1">Gerencie as etiquetas da conta <span className="font-medium text-indigo-600">{account.name}</span></p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLabels}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Atualizar
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Nova Etiqueta
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar Etiqueta' : 'Nova Etiqueta'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: urgente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da etiqueta"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-10 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_on_sidebar}
                  onChange={(e) => setFormData({ ...formData, show_on_sidebar: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Mostrar na barra lateral</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Check size={16} />
              {editingId ? 'Salvar' : 'Criar'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {labels.map((label) => (
            <div key={label.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }} />
                  <div>
                    <h4 className="font-medium text-gray-900">{label.title}</h4>
                    {label.description && <p className="text-sm text-gray-500 mt-0.5">{label.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(label)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(label.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {label.show_on_sidebar && (
                <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">Na sidebar</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && labels.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Tag size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma etiqueta encontrada</p>
        </div>
      )}
    </div>
  );
}
