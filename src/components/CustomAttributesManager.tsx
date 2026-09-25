import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getCustomAttributes, createCustomAttribute, updateCustomAttribute, deleteCustomAttribute } from '../api/chatwoot';
import { ChatwootCustomAttribute } from '../types';
import { Plus, Edit2, Trash2, Check, Loader2, Settings2, X } from 'lucide-react';
import { formatApiError } from '../utils/errors';

const DISPLAY_TYPES: Record<number, string> = {
  0: 'Texto',
  1: 'Número',
  2: 'Email',
  3: 'Data',
  4: 'Booleano',
  5: 'Link',
  6: 'Lista',
  7: 'Checkbox',
};

const ATTRIBUTE_MODELS: Record<number, string> = {
  0: 'Conversa',
  1: 'Contato',
};

export default function CustomAttributesManager() {
  const { getActiveAccount } = useStore();
  const account = getActiveAccount();
  const [attributes, setAttributes] = useState<ChatwootCustomAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<ChatwootCustomAttribute>>({
    attribute_display_name: '',
    attribute_description: '',
    attribute_key: '',
    attribute_display_type: 0,
    attribute_model: 0,
    attribute_values: [],
    default_value: '',
  });
  const [error, setError] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (account) fetchAttributes();
  }, [account]);

  const fetchAttributes = async () => {
    if (!account) return;
    setLoading(true);
    setError('');
    try {
      const data = await getCustomAttributes(account);
      setAttributes(data);
    } catch (err: any) {
      setError(formatApiError(err));
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!account || !formData.attribute_display_name || !formData.attribute_key) return;
    try {
      const newAttr = await createCustomAttribute(account, formData);
      setAttributes([...attributes, newAttr]);
      resetForm();
    } catch (err: any) {
      setError(formatApiError(err));
    }
  };

  const handleUpdate = async (id: number) => {
    if (!account) return;
    try {
      const updated = await updateCustomAttribute(account, id, formData);
      setAttributes(attributes.map((a) => (a.id === id ? updated : a)));
      setEditingId(null);
      resetForm();
    } catch (err: any) {
      setError(formatApiError(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!account) return;
    if (!confirm('Tem certeza que deseja excluir este atributo?')) return;
    try {
      await deleteCustomAttribute(account, id);
      setAttributes(attributes.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(formatApiError(err));
    }
  };

  const startEdit = (attr: ChatwootCustomAttribute) => {
    setEditingId(attr.id);
    setFormData({
      attribute_display_name: attr.attribute_display_name,
      attribute_description: attr.attribute_description,
      attribute_key: attr.attribute_key,
      attribute_display_type: attr.attribute_display_type,
      attribute_model: attr.attribute_model,
      attribute_values: attr.attribute_values || [],
      default_value: attr.default_value || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      attribute_display_name: '',
      attribute_description: '',
      attribute_key: '',
      attribute_display_type: 0,
      attribute_model: 0,
      attribute_values: [],
      default_value: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const addValue = () => {
    if (newValue && formData.attribute_values) {
      setFormData({ ...formData, attribute_values: [...formData.attribute_values, newValue] });
      setNewValue('');
    }
  };

  const removeValue = (index: number) => {
    if (formData.attribute_values) {
      setFormData({
        ...formData,
        attribute_values: formData.attribute_values.filter((_, i) => i !== index),
      });
    }
  };

  if (!account) {
    return (
      <div className="text-center py-16">
        <Settings2 size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Selecione uma conta</h3>
        <p className="text-gray-500 mt-1">Selecione uma conta ativa para gerenciar atributos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Atributos Personalizados</h2>
          <p className="text-gray-500 mt-1">Gerencie os atributos da conta <span className="font-medium text-indigo-600">{account.name}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAttributes} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Atualizar
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Novo Atributo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar Atributo' : 'Novo Atributo'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição</label>
              <input
                type="text"
                value={formData.attribute_display_name}
                onChange={(e) => setFormData({ ...formData, attribute_display_name: e.target.value })}
                placeholder="Ex: Prioridade do Cliente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chave (sem espaços)</label>
              <input
                type="text"
                value={formData.attribute_key}
                onChange={(e) => setFormData({ ...formData, attribute_key: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                placeholder="ex: prioridade_cliente"
                disabled={!!editingId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={formData.attribute_description}
                onChange={(e) => setFormData({ ...formData, attribute_description: e.target.value })}
                placeholder="Descrição do atributo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.attribute_display_type}
                onChange={(e) => setFormData({ ...formData, attribute_display_type: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.entries(DISPLAY_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <select
                value={formData.attribute_model}
                onChange={(e) => setFormData({ ...formData, attribute_model: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.entries(ATTRIBUTE_MODELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Padrão</label>
              <input
                type="text"
                value={formData.default_value}
                onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
                placeholder="Valor padrão"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {formData.attribute_display_type === 6 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Valores da Lista</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Adicionar valor"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && addValue()}
                />
                <button onClick={addValue} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.attribute_values || []).map((val, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm">
                    {val}
                    <button onClick={() => removeValue(i)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

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
        <div className="space-y-3">
          {attributes.map((attr) => (
            <div key={attr.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{attr.attribute_display_name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{DISPLAY_TYPES[attr.attribute_display_type]}</span>
                    <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">{ATTRIBUTE_MODELS[attr.attribute_model]}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{attr.attribute_key}</code>
                    {attr.attribute_description && <span className="ml-2">{attr.attribute_description}</span>}
                  </p>
                  {attr.attribute_values && attr.attribute_values.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {attr.attribute_values.map((val, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{val}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(attr)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(attr.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && attributes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Settings2 size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum atributo personalizado encontrado</p>
        </div>
      )}
    </div>
  );
}
