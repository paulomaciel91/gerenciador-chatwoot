import { ChatwootAccount, ChatwootLabel, ChatwootCustomAttribute, ChatwootConversation, ChatwootInbox, ChatwootAgent } from '../types';

async function request<T>(account: ChatwootAccount, endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${account.url.replace(/\/$/, '')}/api/v1/accounts/${account.accountId}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'api_access_token': account.accessToken,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

// Labels
export async function getLabels(account: ChatwootAccount): Promise<ChatwootLabel[]> {
  return request<ChatwootLabel[]>(account, '/labels');
}

export async function createLabel(account: ChatwootAccount, data: Partial<ChatwootLabel>): Promise<ChatwootLabel> {
  return request<ChatwootLabel>(account, '/labels', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLabel(account: ChatwootAccount, id: number, data: Partial<ChatwootLabel>): Promise<ChatwootLabel> {
  return request<ChatwootLabel>(account, `/labels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteLabel(account: ChatwootAccount, id: number): Promise<void> {
  await request<void>(account, `/labels/${id}`, {
    method: 'DELETE',
  });
}

// Custom Attributes
export async function getCustomAttributes(account: ChatwootAccount): Promise<ChatwootCustomAttribute[]> {
  return request<ChatwootCustomAttribute[]>(account, '/custom_attributes');
}

export async function createCustomAttribute(account: ChatwootAccount, data: Partial<ChatwootCustomAttribute>): Promise<ChatwootCustomAttribute> {
  return request<ChatwootCustomAttribute>(account, '/custom_attributes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomAttribute(account: ChatwootAccount, id: number, data: Partial<ChatwootCustomAttribute>): Promise<ChatwootCustomAttribute> {
  return request<ChatwootCustomAttribute>(account, `/custom_attributes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomAttribute(account: ChatwootAccount, id: number): Promise<void> {
  await request<void>(account, `/custom_attributes/${id}`, {
    method: 'DELETE',
  });
}

// Conversations
export async function getConversations(account: ChatwootAccount, status: string = 'open', page: number = 1): Promise<{ data: ChatwootConversation[]; meta: any }> {
  return request<{ data: ChatwootConversation[]; meta: any }>(account, `/conversations?status=${status}&page=${page}`);
}

export async function getConversationDetails(account: ChatwootAccount, conversationId: number): Promise<ChatwootConversation> {
  return request<ChatwootConversation>(account, `/conversations/${conversationId}`);
}

export async function updateConversation(account: ChatwootAccount, conversationId: number, data: Record<string, any>): Promise<ChatwootConversation> {
  return request<ChatwootConversation>(account, `/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function toggleConversationStatus(account: ChatwootAccount, conversationId: number, status: string): Promise<ChatwootConversation> {
  return request<ChatwootConversation>(account, `/conversations/${conversationId}/toggle_status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function assignConversation(account: ChatwootAccount, conversationId: number, data: { agent_id?: number; team_id?: number }): Promise<ChatwootConversation> {
  return request<ChatwootConversation>(account, `/conversations/${conversationId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Inboxes
export async function getInboxes(account: ChatwootAccount): Promise<{ payload: ChatwootInbox[] }> {
  return request<{ payload: ChatwootInbox[] }>(account, '/inboxes');
}

// Agents
export async function getAgents(account: ChatwootAccount): Promise<ChatwootAgent[]> {
  return request<ChatwootAgent[]>(account, '/agents');
}

// Profile
export async function getProfile(account: ChatwootAccount): Promise<{ id: number; name: string; email: string; account_id: number }> {
  const url = `${account.url.replace(/\/$/, '')}/api/v1/profile`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'api_access_token': account.accessToken,
    },
  });
  if (!response.ok) throw new Error(`API Error (${response.status})`);
  return response.json();
}
