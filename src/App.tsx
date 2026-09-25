import React, { useState } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import AccountManager from './components/AccountManager';
import LabelsManager from './components/LabelsManager';
import CustomAttributesManager from './components/CustomAttributesManager';
import KanbanBoard from './components/KanbanBoard';
import { Download, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

function App() {
  const { currentView } = useStore();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'accounts':
        return <AccountManager />;
      case 'labels':
        return <LabelsManager />;
      case 'attributes':
        return <CustomAttributesManager />;
      case 'kanban':
        return <KanbanBoard />;
      default:
        return <AccountManager />;
    }
  };

  if (showInstallGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowInstallGuide(false)}
            className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← Voltar
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Solução Simples</h1>
            <p className="text-gray-600">
              Instale o script direto no Chatwoot. Sem CORS, sem proxy, sem complicação!
            </p>
          </div>

          <div className="space-y-4">
            {/* Passo 1 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Instale o Tampermonkey</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    É uma extensão gratuita que roda scripts em sites. Escolha seu navegador:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      <span>🌐</span> Chrome
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      <span>🦊</span> Firefox
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href="https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      <span>🔵</span> Edge
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Instale o Script</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Baixe o arquivo e instale no Tampermonkey:
                  </p>
                  <div className="space-y-3">
                    <a
                      href="/chatwoot-manager.user.js"
                      download
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download size={16} />
                      Baixar Script
                    </a>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Como instalar:</strong> Após baixar, abra o Tampermonkey (ícone na barra do navegador) → 
                        "Criar um novo script" → Apague tudo que está lá → Cole o conteúdo do arquivo baixado → 
                        Ctrl+S para salvar
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      💡 Ou arraste o arquivo .js direto para a página do Tampermonkey
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Pronto! Use no Chatwoot</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Abra seu Chatwoot normalmente. Você vai ver um botão roxo no canto superior direito. 
                    Clique nele e pronto!
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="font-medium text-green-900 text-sm">Funciona porque:</span>
                    </div>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• O script roda DENTRO do Chatwoot (mesmo domínio)</li>
                      <li>• Não tem problema de CORS</li>
                      <li>• Usa o token que já está logado</li>
                      <li>• Não precisa configurar servidor</li>
                      <li>• Não precisa de proxy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
              >
                Entendi! Voltar para o Manager
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        {/* Banner de solução simples */}
        {currentView === 'accounts' && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">🚀 Problema com CORS?</h3>
                <p className="text-indigo-100 text-sm">
                  Temos uma solução mais simples! Instale o script direto no Chatwoot e funcione sem CORS.
                </p>
              </div>
              <button
                onClick={() => setShowInstallGuide(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm flex-shrink-0"
              >
                Ver como →
              </button>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
