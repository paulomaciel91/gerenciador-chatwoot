// ==UserScript==
// @name         Chatwoot Manager - Etiquetas e Atributos
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Gerencie etiquetas e atributos do Chatwoot facilmente
// @author       Chatwoot Manager
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Verifica se está no Chatwoot - múltiplas verificações
    const isChatwoot = 
        window.location.pathname.includes('/app/accounts/') ||
        document.querySelector('[data-testid="chatwoot-logo"]') ||
        document.querySelector('.app-sidebar') ||
        document.querySelector('meta[name="chatwoot"]') ||
        document.title.toLowerCase().includes('chatwoot');
    
    if (!isChatwoot) return;

    // Extrai informações da URL
    const pathMatch = window.location.pathname.match(/\/app\/accounts\/(\d+)/);
    if (!pathMatch) return;
    
    const accountId = pathMatch[1];
    const baseUrl = window.location.origin;
    
    // Pega o token do localStorage do Chatwoot (várias formas)
    function getAccessToken() {
        try {
            // Tenta diferentes chaves do localStorage
            const keys = ['chatwoot:auth', 'chatwoot_auth', 'auth'];
            for (const key of keys) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.access_token) return parsed.access_token;
                        if (parsed.user && parsed.user.access_token) return parsed.user.access_token;
                    } catch (e) {}
                }
            }
            
            // Tenta pegar de cookies
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'auth_token' || name === 'access_token') {
                    return value;
                }
            }
        } catch (e) {}
        
        return null;
    }

    // Cria a interface
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'chatwoot-manager-panel';
        panel.innerHTML = `
            <style>
                #chatwoot-manager-panel {
                    position: fixed;
                    right: 20px;
                    top: 80px;
                    width: 350px;
                    max-height: 80vh;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 99999;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    overflow: hidden;
                    display: none;
                }
                #chatwoot-manager-panel.active {
                    display: block;
                }
                .cm-header {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    padding: 16px;
                    font-weight: 600;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .cm-tabs {
                    display: flex;
                    border-bottom: 1px solid #e5e7eb;
                }
                .cm-tab {
                    flex: 1;
                    padding: 12px;
                    text-align: center;
                    cursor: pointer;
                    border: none;
                    background: none;
                    font-size: 13px;
                    color: #6b7280;
                    transition: all 0.2s;
                }
                .cm-tab.active {
                    color: #6366f1;
                    border-bottom: 2px solid #6366f1;
                    font-weight: 600;
                }
                .cm-content {
                    padding: 16px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                .cm-item {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .cm-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .cm-item-info {
                    flex: 1;
                    min-width: 0;
                }
                .cm-item-title {
                    font-weight: 500;
                    font-size: 14px;
                    color: #111827;
                }
                .cm-item-desc {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }
                .cm-actions {
                    display: flex;
                    gap: 4px;
                }
                .cm-btn {
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }
                .cm-btn-primary {
                    background: #6366f1;
                    color: white;
                }
                .cm-btn-primary:hover {
                    background: #4f46e5;
                }
                .cm-btn-danger {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .cm-btn-danger:hover {
                    background: #fecaca;
                }
                .cm-btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }
                .cm-btn-secondary:hover {
                    background: #e5e7eb;
                }
                .cm-form {
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 12px;
                }
                .cm-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 13px;
                    margin-bottom: 8px;
                }
                .cm-input:focus {
                    outline: none;
                    border-color: #6366f1;
                }
                .cm-toggle {
                    position: fixed;
                    right: 20px;
                    top: 20px;
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                    z-index: 99998;
                    transition: transform 0.2s;
                }
                .cm-toggle:hover {
                    transform: scale(1.1);
                }
                .cm-loading {
                    text-align: center;
                    padding: 20px;
                    color: #6b7280;
                }
                .cm-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: #9ca3af;
                }
            </style>
            
            <div class="cm-toggle" id="cm-toggle">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            
            <div id="cm-panel">
                <div class="cm-header">
                    <span>✨ Chatwoot Manager</span>
                    <button onclick="document.getElementById('cm-panel').classList.remove('active')" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">×</button>
                </div>
                
                <div class="cm-tabs">
                    <button class="cm-tab active" data-tab="labels">🏷️ Etiquetas</button>
                    <button class="cm-tab" data-tab="attributes">⚙️ Atributos</button>
                </div>
                
                <div class="cm-content" id="cm-content">
                    <div class="cm-loading">Carregando...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Toggle panel
        document.getElementById('cm-toggle').addEventListener('click', () => {
            document.getElementById('cm-panel').classList.toggle('active');
        });
        
        // Tab switching
        document.querySelectorAll('.cm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.cm-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loadTab(tab.dataset.tab);
            });
        });
        
        // Load initial tab
        loadTab('labels');
    }

    // API helpers
    async function api(endpoint, method = 'GET', body = null) {
        const token = getAccessToken();
        if (!token) {
            // Se não achou o token automaticamente, pede pro usuário
            const userToken = prompt(
                'Não foi possível encontrar o token automaticamente.\n\n' +
                'Para encontrar seu token:\n' +
                '1. Vá em Configurações → Integrações → Configurações de Conta\n' +
                '2. Ou acesse: Perfil (canto inferior esquerdo) → Configurações do Perfil\n' +
                '3. Copie o "Token de Acesso à API"\n\n' +
                'Cole o token abaixo:'
            );
            if (!userToken) return null;
            
            // Salva para usar depois
            window._chatwootManagerToken = userToken;
            return apiWithToken(endpoint, method, body, userToken);
        }
        
        return apiWithToken(endpoint, method, body, token);
    }
    
    async function apiWithToken(endpoint, method = 'GET', body = null, token) {

        const options = {
            method,
            headers: {
                'api_access_token': token,
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${baseUrl}/api/v1/accounts/${accountId}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        if (method === 'DELETE') return true;
        return response.json();
    }

    // Load tab content
    async function loadTab(tab) {
        const content = document.getElementById('cm-content');
        content.innerHTML = '<div class="cm-loading">Carregando...</div>';

        try {
            if (tab === 'labels') {
                await loadLabels();
            } else if (tab === 'attributes') {
                await loadAttributes();
            }
        } catch (error) {
            content.innerHTML = `<div class="cm-empty">Erro ao carregar: ${error.message}</div>`;
        }
    }

    // Labels
    async function loadLabels() {
        const labels = await api('/labels');
        const content = document.getElementById('cm-content');
        
        let html = `
            <button class="cm-btn cm-btn-primary" onclick="showLabelForm()" style="width:100%;margin-bottom:12px;">
                + Nova Etiqueta
            </button>
            <div id="cm-label-form"></div>
            <div id="cm-labels-list">
        `;
        
        if (labels.length === 0) {
            html += '<div class="cm-empty">Nenhuma etiqueta encontrada</div>';
        } else {
            labels.forEach(label => {
                html += `
                    <div class="cm-item">
                        <div class="cm-color" style="background:${label.color}"></div>
                        <div class="cm-item-info">
                            <div class="cm-item-title">${label.title}</div>
                            ${label.description ? `<div class="cm-item-desc">${label.description}</div>` : ''}
                        </div>
                        <div class="cm-actions">
                            <button class="cm-btn cm-btn-secondary" onclick="editLabel(${label.id})">✏️</button>
                            <button class="cm-btn cm-btn-danger" onclick="deleteLabel(${label.id})">🗑️</button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
    }

    window.showLabelForm = function(label = null) {
        const form = document.getElementById('cm-label-form');
        form.innerHTML = `
            <div class="cm-form">
                <input type="text" class="cm-input" id="label-title" placeholder="Título" value="${label?.title || ''}">
                <input type="text" class="cm-input" id="label-desc" placeholder="Descrição" value="${label?.description || ''}">
                <input type="color" class="cm-input" id="label-color" value="${label?.color || '#6366f1'}" style="height:40px;padding:4px;">
                <div style="display:flex;gap:8px;">
                    <button class="cm-btn cm-btn-primary" onclick="saveLabel(${label?.id || 'null'})" style="flex:1;">
                        ${label ? 'Salvar' : 'Criar'}
                    </button>
                    <button class="cm-btn cm-btn-secondary" onclick="document.getElementById('cm-label-form').innerHTML=''" style="flex:1;">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
    };

    window.saveLabel = async function(id) {
        const data = {
            title: document.getElementById('label-title').value,
            description: document.getElementById('label-desc').value,
            color: document.getElementById('label-color').value,
            show_on_sidebar: true
        };

        try {
            if (id) {
                await api(`/labels/${id}`, 'PATCH', data);
            } else {
                await api('/labels', 'POST', data);
            }
            loadLabels();
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    window.editLabel = async function(id) {
        const labels = await api('/labels');
        const label = labels.find(l => l.id === id);
        if (label) showLabelForm(label);
    };

    window.deleteLabel = async function(id) {
        if (!confirm('Excluir esta etiqueta?')) return;
        try {
            await api(`/labels/${id}`, 'DELETE');
            loadLabels();
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    // Attributes
    async function loadAttributes() {
        const attributes = await api('/custom_attributes');
        const content = document.getElementById('cm-content');
        
        let html = `
            <button class="cm-btn cm-btn-primary" onclick="showAttributeForm()" style="width:100%;margin-bottom:12px;">
                + Novo Atributo
            </button>
            <div id="cm-attr-form"></div>
            <div id="cm-attrs-list">
        `;
        
        const types = ['Texto', 'Número', 'Email', 'Data', 'Booleano', 'Link', 'Lista', 'Checkbox'];
        const models = ['Conversa', 'Contato'];
        
        if (attributes.length === 0) {
            html += '<div class="cm-empty">Nenhum atributo encontrado</div>';
        } else {
            attributes.forEach(attr => {
                html += `
                    <div class="cm-item">
                        <div class="cm-item-info">
                            <div class="cm-item-title">${attr.attribute_display_name}</div>
                            <div class="cm-item-desc">
                                <code style="font-size:11px;background:#e5e7eb;padding:2px 4px;border-radius:3px;">${attr.attribute_key}</code>
                                • ${types[attr.attribute_display_type]} • ${models[attr.attribute_model]}
                            </div>
                        </div>
                        <div class="cm-actions">
                            <button class="cm-btn cm-btn-danger" onclick="deleteAttribute(${attr.id})">🗑️</button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
    }

    window.showAttributeForm = function() {
        const form = document.getElementById('cm-attr-form');
        form.innerHTML = `
            <div class="cm-form">
                <input type="text" class="cm-input" id="attr-name" placeholder="Nome de exibição">
                <input type="text" class="cm-input" id="attr-key" placeholder="Chave (sem espaços)">
                <input type="text" class="cm-input" id="attr-desc" placeholder="Descrição">
                <select class="cm-input" id="attr-type">
                    <option value="0">Texto</option>
                    <option value="1">Número</option>
                    <option value="2">Email</option>
                    <option value="3">Data</option>
                    <option value="4">Booleano</option>
                    <option value="5">Link</option>
                    <option value="6">Lista</option>
                    <option value="7">Checkbox</option>
                </select>
                <select class="cm-input" id="attr-model">
                    <option value="0">Conversa</option>
                    <option value="1">Contato</option>
                </select>
                <div style="display:flex;gap:8px;">
                    <button class="cm-btn cm-btn-primary" onclick="saveAttribute()" style="flex:1;">Criar</button>
                    <button class="cm-btn cm-btn-secondary" onclick="document.getElementById('cm-attr-form').innerHTML=''" style="flex:1;">Cancelar</button>
                </div>
            </div>
        `;
    };

    window.saveAttribute = async function() {
        const data = {
            attribute_display_name: document.getElementById('attr-name').value,
            attribute_key: document.getElementById('attr-key').value.replace(/\s/g, '_').toLowerCase(),
            attribute_description: document.getElementById('attr-desc').value,
            attribute_display_type: parseInt(document.getElementById('attr-type').value),
            attribute_model: parseInt(document.getElementById('attr-model').value)
        };

        try {
            await api('/custom_attributes', 'POST', data);
            loadAttributes();
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    window.deleteAttribute = async function(id) {
        if (!confirm('Excluir este atributo?')) return;
        try {
            await api(`/custom_attributes/${id}`, 'DELETE');
            loadAttributes();
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    // Inicializa
    setTimeout(createPanel, 1000);
})();
