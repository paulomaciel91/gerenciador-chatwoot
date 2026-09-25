export interface ChatwootAccount {
  id: string;
  name: string;
  url: string;
  accessToken: string;
  accountId: number;
  color: string;
}

export interface ChatwootLabel {
  id: number;
  title: string;
  description: string;
  color: string;
  show_on_sidebar: boolean;
}

export interface ChatwootCustomAttribute {
  id: number;
  attribute_display_name: string;
  attribute_display_type: number; // 0 = text, 1 = number, 2 = email, 3 = date, 4 = boolean, 5 = link, 6 = list, 7 = checkbox
  attribute_description: string;
  attribute_key: string;
  attribute_values: string[];
  default_value: string;
  attribute_model: number; // 0 = conversation, 1 = contact
}

export interface ChatwootConversation {
  id: number;
  status: string;
  inbox_id: number;
  meta: {
    channel?: string;
    sender?: {
      id: number;
      name: string;
      thumbnail?: string;
      email?: string;
    };
    assignee?: {
      id: number;
      name: string;
      thumbnail?: string;
    };
  };
  messages?: ChatwootMessage[];
  labels: string[];
  priority: string | null;
  created_at: number;
  timestamp: number;
  custom_attributes: Record<string, any>;
  additional_attributes?: Record<string, any>;
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number; // 0 = incoming, 1 = outgoing, 2 = activity
  created_at: number;
  sender?: {
    id: number;
    name: string;
    thumbnail?: string;
  };
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  greeting_enabled: boolean;
}

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  role: string;
  thumbnail?: string;
  availability_status?: string;
}

export type ViewType = 'accounts' | 'labels' | 'attributes' | 'kanban';
