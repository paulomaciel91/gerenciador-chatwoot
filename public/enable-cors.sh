#!/bin/bash

# Script para habilitar CORS no Chatwoot
# Execute este script no servidor onde o Chatwoot está instalado

echo "🔧 Configurando CORS no Chatwoot..."
echo ""

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Erro: Este script precisa ser executado como root (use sudo)"
    exit 1
fi

# Detecta o tipo de instalação
if [ -f "/home/chatwoot/chatwoot/.env" ]; then
    # Instalação via script (Linux)
    ENV_FILE="/home/chatwoot/chatwoot/.env"
    SERVICE_NAME="chatwoot.target"
    echo "✅ Instalação Linux detectada"
elif [ -f "/app/.env" ]; then
    # Instalação Docker
    ENV_FILE="/app/.env"
    SERVICE_NAME="docker"
    echo "✅ Instalação Docker detectada"
else
    echo "❌ Não foi possível encontrar o arquivo .env do Chatwoot"
    echo "   Procurando em locais comuns..."
    
    # Tenta encontrar o arquivo .env
    FOUND_ENV=$(find / -name ".env" -path "*/chatwoot/*" 2>/dev/null | head -1)
    if [ -n "$FOUND_ENV" ]; then
        ENV_FILE="$FOUND_ENV"
        echo "✅ Arquivo .env encontrado em: $ENV_FILE"
    else
        echo "❌ Arquivo .env não encontrado. Verifique a instalação do Chatwoot."
        exit 1
    fi
fi

echo ""
echo "📝 Arquivo .env: $ENV_FILE"
echo ""

# Verifica se ENABLE_API_CORS já está configurado
if grep -q "^ENABLE_API_CORS=" "$ENV_FILE"; then
    echo "⚠️  ENABLE_API_CORS já está configurado"
    read -p "Deseja sobrescrever? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sed -i 's/^ENABLE_API_CORS=.*/ENABLE_API_CORS=true/' "$ENV_FILE"
        echo "✅ ENABLE_API_CORS atualizado para true"
    else
        echo "⏭️  Mantendo configuração atual"
    fi
else
    # Adiciona ENABLE_API_CORS=true ao arquivo .env
    echo "ENABLE_API_CORS=true" >> "$ENV_FILE"
    echo "✅ ENABLE_API_CORS=true adicionado ao arquivo .env"
fi

echo ""
echo "🔄 Reiniciando o Chatwoot..."
echo ""

# Reinicia o serviço apropriado
if [ "$SERVICE_NAME" = "docker" ]; then
    # Docker
    if command -v docker-compose &> /dev/null; then
        cd "$(dirname "$ENV_FILE")"
        docker-compose down
        docker-compose up -d
        echo "✅ Chatwoot reiniciado via Docker Compose"
    elif command -v docker &> /dev/null; then
        cd "$(dirname "$ENV_FILE")"
        docker compose down
        docker compose up -d
        echo "✅ Chatwoot reiniciado via Docker Compose"
    else
        echo "❌ Docker não encontrado. Reinicie manualmente."
    fi
else
    # Systemd (Linux)
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl restart "$SERVICE_NAME"
        echo "✅ Chatwoot reiniciado via systemd"
    else
        echo "⚠️  Serviço $SERVICE_NAME não está ativo"
        echo "   Tentando reiniciar serviços individuais..."
        systemctl restart chatwoot-web 2>/dev/null || true
        systemctl restart chatwoot-worker 2>/dev/null || true
        echo "✅ Serviços reiniciados"
    fi
fi

echo ""
echo "✨ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Aguarde alguns segundos para o Chatwoot iniciar"
echo "   2. Volte para o Chatwoot Manager"
echo "   3. Desative o proxy CORS (se estiver usando)"
echo "   4. Teste a conexão novamente"
echo ""
echo "🌐 Se precisar de ajuda: https://developers.chatwoot.com/self-hosted/configuration/environment-variables"
echo ""
