export function formatApiError(error: any): string {
  const message = error?.message || 'Erro desconhecido';
  
  if (message === 'CORS_BLOCKED' || message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Erro de CORS: Não foi possível conectar ao Chatwoot. Configure um proxy CORS ou ajuste as configurações de CORS no seu servidor Chatwoot.';
  }
  
  if (message.includes('401')) {
    return 'Token de acesso inválido. Verifique suas credenciais.';
  }
  
  if (message.includes('404')) {
    return 'Recurso não encontrado. Verifique o Account ID.';
  }
  
  return message;
}
