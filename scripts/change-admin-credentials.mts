// Trusted local operator command. Credentials are read from hidden stdin.
import { createInterface } from 'node:readline';
import { once } from 'node:events';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { hashPassword, digest, signAuditEntry } from '../lib/admin/security.ts';
import { validateLogin } from '../lib/admin/validation.ts';
import { wrangler } from './setup-admin.mts';
import type { AuditEntry } from '../lib/admin/types.ts';

console.log('Ready for credential-change JSON on stdin (input is hidden).');
if (process.stdin.isTTY) process.stdin.setRawMode(true);
const reader = createInterface({ input: process.stdin, terminal: false });
const [line] = await once(reader, 'line'); reader.close();
if (process.stdin.isTTY) process.stdin.setRawMode(false);
process.stdin.pause();
const input = JSON.parse(line) as { username: string; password: string };
const validated = validateLogin(input);
if (Object.keys(validated.errors).length) throw new Error('Invalid username or password.');
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const query = <T,>(sql: string) => (JSON.parse(wrangler(['execute', 'DB', '--command', sql, '--json'])) as { results: T[] }[])[0].results;
const user = query<{ id: string; username: string }>("SELECT id, username FROM admin_users WHERE username = 'admin'")[0];
if (!user) throw new Error('The administrator account was not found.');
const key = (await readFile('.dev.vars', 'utf8')).match(/^ADMIN_AUDIT_KEY\s*=\s*"?([a-f0-9]{64,})"?\s*$/m)?.[1];
if (!key) throw new Error('Audit signing key is missing.');
const passwordHash = await hashPassword(validated.password);
for (let attempt = 0; attempt < 8; attempt++) {
  const previous = query<AuditEntry>('SELECT * FROM admin_audit_log ORDER BY id DESC LIMIT 1')[0];
  const event = { id: (previous?.id ?? 0) + 1, event_id: randomUUID(), occurred_at: new Date().toISOString(), actor_id: user.id, username: validated.username, action: 'ACCOUNT_CREDENTIALS_CHANGED', outcome: 'success', summary: 'Administrator credentials changed by the local operator; existing sessions revoked.', source: 'local operator', previous_hash: previous?.entry_hash ?? '0'.repeat(64) };
  const entryHash = signAuditEntry(event, key);
  const sql = `INSERT INTO admin_audit_log (id,event_id,occurred_at,actor_id,username,action,outcome,summary,source,previous_hash,entry_hash) VALUES (${event.id},${[event.event_id,event.occurred_at,user.id,event.username,event.action,event.outcome,event.summary,event.source,event.previous_hash,entryHash].map(quote).join(',')});
UPDATE admin_users SET username=${quote(validated.username)},password_hash=${quote(passwordHash)} WHERE id=${quote(user.id)};
DELETE FROM admin_sessions WHERE user_id=${quote(user.id)};
DELETE FROM admin_login_limits WHERE key IN (${quote(digest(`account:${user.username}`))},${quote(digest(`account:${validated.username}`))});`;
  const temporary = `.wrangler/admin-change-${randomUUID()}.sql`;
  try {
    await writeFile(temporary, sql, { mode: 0o600 });
    wrangler(['execute', 'DB', '--file', temporary]);
    console.log('Administrator credentials changed, existing sessions revoked, and activity recorded.');
    break;
  } catch (error) {
    if (!/UNIQUE constraint failed: admin_audit_log|Activity log chain conflict/.test(String(error)) || attempt === 7) throw error;
  } finally { await unlink(temporary).catch(() => {}); }
}
