import { env } from 'cloudflare:workers';
import { randomUUID } from 'node:crypto';
import { digest, IDLE_SECONDS, readSessionCookie, safeEqual, signAuditEntry } from './security';
import type { AdminIdentity, AuditEntry, AuditPage, Overview } from './types';
import type { AuditAction } from './validation';

type Bindings = { DB: D1Database; ADMIN_AUDIT_KEY: string };
export function bindings(): Bindings {
  const runtime = env as unknown as Bindings;
  if (!runtime.DB || !/^[a-f0-9]{64,}$/.test(runtime.ADMIN_AUDIT_KEY ?? '')) throw new Error('Admin storage is not configured. Run npm run admin:setup and restart the dev server.');
  return runtime;
}

type AuditEvent = { actorId?: string; username: string; action: AuditAction; outcome: AuditEntry['outcome']; summary: string; source?: string };

export async function appendAudit(event: AuditEvent, statements: D1PreparedStatement[] = []) {
  const { DB, ADMIN_AUDIT_KEY } = bindings();
  for (let attempt = 0; attempt < 8; attempt++) {
    const head = await DB.prepare('SELECT id, entry_hash FROM admin_audit_log ORDER BY id DESC LIMIT 1').first<{ id: number; entry_hash: string }>();
    const entry: AuditEntry = {
      id: (head?.id ?? 0) + 1, event_id: randomUUID(), occurred_at: new Date().toISOString(),
      actor_id: event.actorId ?? null, username: event.username, action: event.action,
      outcome: event.outcome, summary: event.summary, source: event.source ?? 'local',
      previous_hash: head?.entry_hash ?? '0'.repeat(64), entry_hash: '',
    };
    entry.entry_hash = signAuditEntry(entry, ADMIN_AUDIT_KEY);
    try {
      // A concurrent append fails the first INSERT and rolls back the entire batch.
      return await DB.batch([
        DB.prepare('INSERT INTO admin_audit_log (id, event_id, occurred_at, actor_id, username, action, outcome, summary, source, previous_hash, entry_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(entry.id, entry.event_id, entry.occurred_at, entry.actor_id, entry.username, entry.action, entry.outcome, entry.summary, entry.source, entry.previous_hash, entry.entry_hash),
        ...statements,
      ]);
    } catch (error) {
      const message = String(error);
      if (!/UNIQUE constraint failed: admin_audit_log\.(id|previous_hash)|Activity log chain conflict/.test(message) || attempt === 7) throw error;
    }
  }
  throw new Error('Unable to append activity.');
}

export function requestSource(headers: Headers): string {
  // On Cloudflare this header is set by the platform. Do not use X-Forwarded-For.
  return headers.get('cf-connecting-ip')?.replace(/[^a-fA-F0-9:.]/g, '').slice(0, 100) || 'local';
}

export async function getSession(headers: Headers): Promise<AdminIdentity | null> {
  const token = readSessionCookie(headers);
  if (!token) return null;
  const { DB } = bindings();
  const tokenHash = digest(token);
  const session = await DB.prepare('SELECT s.*, u.username, u.disabled FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token_hash = ?').bind(tokenHash)
    .first<{ token_hash: string; user_id: string; username: string; csrf_token: string; last_seen_at: number; expires_at: number; disabled: number }>();
  if (!session || session.disabled) return null;
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at <= now || session.last_seen_at + IDLE_SECONDS <= now) {
    await appendAudit({ actorId: session.user_id, username: session.username, action: 'SESSION_EXPIRED', outcome: 'success', summary: 'Session ended after its time limit.', source: requestSource(headers) }, [DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash)]);
    return null;
  }
  if (now - session.last_seen_at >= 60) await DB.prepare('UPDATE admin_sessions SET last_seen_at = ? WHERE token_hash = ?').bind(now, tokenHash).run();
  return { id: session.user_id, username: session.username, csrfToken: session.csrf_token, tokenHash, expiresAt: session.expires_at };
}

export async function getOverview(): Promise<Overview> {
  const { DB } = bindings();
  const now = Math.floor(Date.now() / 1000);
  const counts = await DB.prepare(`SELECT
    (SELECT COUNT(*) FROM admin_audit_log) AS totalEvents,
    (SELECT COUNT(*) FROM admin_audit_log WHERE action = 'LOGIN_SUCCEEDED' AND occurred_at >= ?) AS successfulLogins,
    (SELECT COUNT(*) FROM admin_audit_log WHERE action IN ('LOGIN_FAILED', 'LOGIN_BLOCKED') AND occurred_at >= ?) AS failedLogins,
    (SELECT COUNT(*) FROM admin_sessions WHERE expires_at > ? AND last_seen_at > ?) AS activeSessions,
    (SELECT COUNT(*) FROM inbox_conversations WHERE kind = 'enquiry') AS enquiries,
    (SELECT COUNT(*) FROM inbox_conversations WHERE kind = 'request') AS requests,
    (SELECT COUNT(*) FROM inbox_conversations WHERE status IN ('new', 'in_progress')) AS openConversations,
    (SELECT COUNT(*) FROM document_records) AS documents,
    (SELECT COUNT(*) FROM document_records WHERE status = 'published') AS publishedDocuments`)
    .bind(new Date(Date.now() - 86400000).toISOString(), new Date(Date.now() - 86400000).toISOString(), now, now - IDLE_SECONDS)
    .first<Omit<Overview, 'recent'>>();
  const recent = await DB.prepare('SELECT * FROM admin_audit_log ORDER BY id DESC LIMIT 6').all<AuditEntry>();
  return { ...counts!, recent: recent.results };
}

export async function getAuditPage(query: { search: string; action: string; outcome: string; page: number }): Promise<AuditPage> {
  const { DB } = bindings();
  const conditions: string[] = [];
  const values: string[] = [];
  if (query.search) { conditions.push('(instr(lower(username), lower(?)) > 0 OR instr(lower(summary), lower(?)) > 0)'); values.push(query.search, query.search); }
  if (query.action) { conditions.push('action = ?'); values.push(query.action); }
  if (query.outcome) { conditions.push('outcome = ?'); values.push(query.outcome); }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const count = await DB.prepare(`SELECT COUNT(*) AS total FROM admin_audit_log${where}`).bind(...values).first<{ total: number }>();
  const pageSize = 15;
  const page = Math.min(query.page, Math.max(1, Math.ceil((count?.total ?? 0) / pageSize)));
  const entries = await DB.prepare(`SELECT * FROM admin_audit_log${where} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...values, pageSize, (page - 1) * pageSize).all<AuditEntry>();
  return { entries: entries.results, total: count?.total ?? 0, page, pageSize };
}

export async function verifyAuditChain(): Promise<{ valid: boolean; checked: number; head: string; failedAt?: number }> {
  const { DB, ADMIN_AUDIT_KEY } = bindings();
  // Snapshot a high-water mark so concurrent new entries do not affect verification.
  const snapshot = await DB.prepare('SELECT MAX(id) AS last FROM admin_audit_log').first<{ last: number | null }>();
  const last = snapshot?.last ?? 0;
  let cursor = 0;
  let previous = '0'.repeat(64);
  while (cursor < last) {
    const batch = await DB.prepare('SELECT * FROM admin_audit_log WHERE id > ? AND id <= ? ORDER BY id LIMIT 250').bind(cursor, last).all<AuditEntry>();
    if (!batch.results.length) return { valid: false, checked: cursor, head: previous, failedAt: cursor + 1 };
    for (const entry of batch.results) {
      if (entry.id !== cursor + 1 || entry.previous_hash !== previous || !safeEqual(entry.entry_hash, signAuditEntry(entry, ADMIN_AUDIT_KEY))) return { valid: false, checked: cursor, head: previous, failedAt: entry.id };
      cursor = entry.id;
      previous = entry.entry_hash;
    }
  }
  return { valid: true, checked: cursor, head: previous };
}
