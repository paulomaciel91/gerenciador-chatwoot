# 🚀 Guia Rápido de Deploy

## ❌ Por que o Preview não funciona?

O preview estático serve apenas arquivos HTML/CSS/JS. Ele **NÃO executa serverless functions**, 
por isso aparece o erro "Proxy error: 500".

## ✅ Como resolver (3 minutos)

### Opção 1: Deploy no Vercel (Recomendado)

```bash
# 1. Instale o Vercel CLI
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy
vercel

# 4. Deploy para produção
vercel --prod
```

**Pronto!** O proxy serverless vai funcionar automaticamente.

### Opção 2: Via GitHub

1. Faça push deste projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Clique em "Deploy"
5. Pronto!

### Opção 3: Desenvolvimento Local

```bash
# Instalar dependências
npm install express cors

# Rodar servidor local
node server.js
```

Acesse `http://localhost:3000`

## 🔍 Verificar se está funcionando

Após o deploy, acesse a URL do Vercel. Você vai ver uma mensagem verde:
"✅ Proxy funcionando corretamente!"

Se aparecer essa mensagem, está tudo certo e você pode começar a usar!

## 📞 Precisa de ajuda?

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Chatwoot API](https://developers.chatwoot.com/)
