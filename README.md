# Chatwoot Manager

Gerenciador de múltiplas contas Chatwoot com interface para etiquetas, atributos personalizados e visualização Kanban.

## 🚀 Funcionalidades

- **Gerenciamento de Múltiplas Contas**: Adicione e gerencie várias contas Chatwoot
- **Etiquetas**: Crie, edite e exclua etiquetas com cores personalizadas
- **Atributos Personalizados**: Gerencie atributos customizados para conversas e contatos
- **Kanban Board**: Visualize e gerencie conversas em formato Kanban
- **Sem CORS**: Todas as chamadas passam por um proxy serverless, evitando problemas de CORS

## 📋 Como Funciona

O projeto usa uma **Serverless Function** (`/api/chatwoot.js`) como proxy para todas as chamadas à API do Chatwoot. Isso elimina completamente os problemas de CORS, pois:

1. O frontend faz requisições para `/api/chatwoot` (mesmo domínio)
2. O proxy serverless faz a chamada real para a API do Chatwoot
3. Não há restrição de CORS entre servidor e servidor

## 🛠️ Instalação e Uso

### ⚠️ Importante: Preview Estático vs Deploy Completo

O **preview estático** (que você está vendo agora) **NÃO executa serverless functions**. 
Ele serve apenas o build estático do frontend, por isso aparece o erro "Proxy error: 500".

Para usar o Chatwoot Manager, você precisa fazer o **deploy completo no Vercel**.

### 🚀 Deploy no Vercel (Recomendado)

**Opção 1: Deploy Direto (Mais Rápido)**
```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

**Opção 2: Via GitHub (Automático)**
1. Faça push deste projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe o repositório
5. Clique em "Deploy"
6. Pronto! O proxy serverless vai funcionar automaticamente

### 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Opção 1: Usar Vercel CLI (recomendado)
npm i -g vercel
vercel dev

# Opção 2: Usar servidor local
npm install express cors
node server.js
```

O servidor local (`server.js`) roda o frontend + proxy em `http://localhost:3000`

## 🔒 Segurança

- ✅ Tokens são armazenados apenas no localStorage do navegador
- ✅ Tokens são enviados apenas para o proxy serverless
- ✅ Tokens nunca são armazenados no servidor
- ✅ Cada conta tem seu próprio token independente

## 📁 Estrutura do Projeto

```
├── api/
│   └── chatwoot.js          # Serverless Function - Proxy para Chatwoot
├── src/
│   ├── api/
│   │   └── chatwoot.ts      # Cliente API (usa o proxy)
│   ├── components/
│   │   ├── AccountManager.tsx
│   │   ├── LabelsManager.tsx
│   │   ├── CustomAttributesManager.tsx
│   │   ├── KanbanBoard.tsx
│   │   └── Sidebar.tsx
│   ├── store.ts             # Zustand store com persistência
│   ├── types.ts             # Tipos TypeScript
│   └── App.tsx
└── package.json
```

## 🔧 Como Adicionar uma Conta

1. Acesse seu Chatwoot
2. Vá em **Configurações → Configurações da Conta**
3. Copie o **Account ID** (número na URL)
4. Vá em **Perfil → Configurações do Perfil**
5. Copie o **Token de Acesso à API**
6. No Chatwoot Manager, clique em **Nova Conta**
7. Preencha:
   - **Nome**: Nome da conta (ex: "Empresa X")
   - **URL**: URL do seu Chatwoot (ex: `https://chatwoot.empresa.com`)
   - **Token**: Token copiado no passo 5
   - **Account ID**: ID copiado no passo 3
8. Clique em **Testar Conexão** para verificar
9. Clique em **Adicionar Conta**

## 📝 Endpoints Suportados

O proxy suporta todos os endpoints da API do Chatwoot:

- **Labels**: GET, POST, PATCH, DELETE `/labels`
- **Custom Attributes**: GET, POST, PATCH, DELETE `/custom_attributes`
- **Conversations**: GET, PATCH, POST `/conversations`
- **Inboxes**: GET `/inboxes`
- **Agents**: GET `/agents`
- **Profile**: GET `/profile`

## 🐛 Troubleshooting

### Erro "Failed to fetch"
- Verifique se o proxy serverless está funcionando
- No Vercel, verifique os logs da função `/api/chatwoot`
- Em desenvolvimento local, use `vercel dev` para testar

### Erro 401 Unauthorized
- Verifique se o token está correto
- Verifique se o Account ID está correto
- Gere um novo token no Chatwoot se necessário

### Erro 404 Not Found
- Verifique se a URL do Chatwoot está correta (sem barra no final)
- Verifique se o endpoint existe na sua versão do Chatwoot

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.
