import { ChatwootAccount, ChatwootLabel, ChatwootCustomAttribute, ChatwootConversation, ChatwootInbox, ChatwootAgent } from '../types';

// Interface da resposta do proxy
interface ProxyResponse<T> {
  status: number;
  responseData: T | string | null;
}

// Função genérica para fazer requisições via proxy
async function proxyRequest<T>(
  account: ChatwootAccount,
  endpoint: string,
  method: string = 'GET',
  body?: any,
  isProfile: boolean = false
): Promise<T> {
  const response = await fetch('/api/chatwoot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: account.url.replace(/\/$/, ''),
      accountId: account.accountId,
      token: account.accessToken,
      endpoint,
      method,
      body,
      isProfile,
    }),
  });

  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.status >= 400) {
    const errorMessage = typeof result.responseData === 'string' ? result.responseData : JSON.stringify(result.responseData);
    throw new Error(`API Error (${result.status}): ${errorMessage}`);
  }

  return result.responseData as T;
}

// Labels
export async function getLabels(account: ChatwootAccount): Promise<ChatwootLabel[]> {
  return proxyRequest<ChatwootLabel[]>(account, '/labels');
}

export async function createLabel(account: ChatwootAccount, data: Partial<ChatwootLabel>): Promise<ChatwootLabel> {
  return proxyRequest<ChatwootLabel>(account, '/labels', 'POST', data);
}

export async function updateLabel(account: ChatwootAccount, id: number, data: Partial<ChatwootLabel>): Promise<ChatwootLabel> {
  return proxyRequest<ChatwootLabel>(account, `/labels/${id}`, 'PATCH', data);
}

export async function deleteLabel(account: ChatwootAccount, id: number): Promise<void> {
  await proxyRequest<void>(account, `/labels/${id}`, 'DELETE');
}

// Custom Attributes
export async function getCustomAttributes(account: ChatwootAccount): Promise<ChatwootCustomAttribute[]> {
  return proxyRequest<ChatwootCustomAttribute[]>(account, '/custom_attributes');
}

export async function createCustomAttribute(account: ChatwootAccount, data: Partial<ChatwootCustomAttribute>): Promise<ChatwootCustomAttribute> {
  return proxyRequest<ChatwootCustomAttribute>(account, '/custom_attributes', 'POST', data);
}

export async function updateCustomAttribute(account: ChatwootAccount, id: number, data: Partial<ChatwootCustomAttribute>): Promise<ChatwootCustomAttribute> {
  return proxyRequest<ChatwootCustomAttribute>(account, `/custom_attributes/${id}`, 'PATCH', data);
}

export async function deleteCustomAttribute(account: ChatwootAccount, id: number): Promise<void> {
  await proxyRequest<void>(account, `/custom_attributes/${id}`, 'DELETE');
}

// Conversations
export async function getConversations(account: ChatwootAccount, status: string = 'open', page: number = 1): Promise<{ payload: ChatwootConversation[]; meta: any }> {
  return proxyRequest<{ payload: ChatwootConversation[]; meta: any }>(account, `/conversations?status=${status}&page=${page}`);
}

export async function getConversationDetails(account: ChatwootAccount, conversationId: number): Promise<ChatwootConversation> {
  return proxyRequest<ChatwootConversation>(account, `/conversations/${conversationId}`);
}

export async function updateConversation(account: ChatwootAccount, conversationId: number, data: Record<string, any>): Promise<ChatwootConversation> {
  return proxyRequest<ChatwootConversation>(account, `/conversations/${conversationId}`, 'PATCH', data);
}

export async function toggleConversationStatus(account: ChatwootAccount, conversationId: number, status: string): Promise<ChatwootConversation> {
  return proxyRequest<ChatwootConversation>(account, `/conversations/${conversationId}/toggle_status`, 'POST', { status });
}

export async function assignConversation(account: ChatwootAccount, conversationId: number, data: { agent_id?: number; team_id?: number }): Promise<ChatwootConversation> {
  return proxyRequest<ChatwootConversation>(account, `/conversations/${conversationId}/assignments`, 'POST', data);
}

// Inboxes
export async function getInboxes(account: ChatwootAccount): Promise<{ payload: ChatwootInbox[] }> {
  return proxyRequest<{ payload: ChatwootInbox[] }>(account, '/inboxes');
}

// Agents
export async function getAgents(account: ChatwootAccount): Promise<ChatwootAgent[]> {
  return proxyRequest<ChatwootAgent[]>(account, '/agents');
}

// Profile
export async function getProfile(account: ChatwootAccount): Promise<{ id: number; name: string; email: string; account_id: number }> {
  return proxyRequest<{ id: number; name: string; email: string; account_id: number }>(account, '/profile', 'GET', undefined, true);
}
