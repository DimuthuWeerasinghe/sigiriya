import type { AuditAction } from './validation';

export type AuditEntry = {
  id: number;
  event_id: string;
  occurred_at: string;
  actor_id: string | null;
  username: string;
  action: AuditAction;
  outcome: 'success' | 'failure' | 'blocked';
  summary: string;
  source: string;
  previous_hash: string;
  entry_hash: string;
};

export type AuditPage = { entries: AuditEntry[]; total: number; page: number; pageSize: number };
export type Overview = { totalEvents: number; successfulLogins: number; failedLogins: number; activeSessions: number; enquiries: number; requests: number; documents: number; publishedDocuments: number; openConversations: number; recent: AuditEntry[] };
export type AdminIdentity = { id: string; username: string; csrfToken: string; tokenHash: string; expiresAt: number };
