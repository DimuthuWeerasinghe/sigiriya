import type { ConversationKind, ConversationStatus, DocumentStatus } from './validation';
export type Conversation = {
  id: string; reference: string; kind: ConversationKind; name: string; email: string; phone: string;
  subject: string; category: string; status: ConversationStatus; priority: 'normal' | 'high' | 'urgent';
  version: number; created_at: string; updated_at: string; message_count?: number;
};
export type Message = { id: string; sender_type: 'visitor' | 'admin'; sender_name: string; body: string; created_at: string };
export type Thread = { conversation: Conversation; messages: Message[] };
export type DocumentRecord = {
  id: string; title: string; description: string; category: string; language: string; year: number;
  status: DocumentStatus; filename: string; mime_type: string; size_bytes: number; checksum: string;
  chunk_count: number; version: number; created_at: string; updated_at: string; request_count: number;
};
export type ListPage<T> = { items: T[]; total: number; page: number; pageSize: number };
export type WorkspaceCounts = { enquiries: number; requests: number; openConversations: number; documents: number; publishedDocuments: number };
