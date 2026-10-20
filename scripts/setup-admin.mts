import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { hashPassword, signAuditEntry } from '../lib/admin/security.ts';
import { USERNAME_PATTERN, validateNewPassword } from '../lib/admin/validation.ts';

export function wrangler(args: string[]) {
  const result = spawnSync(process.execPath, [path.resolve('node_modules/wrangler/bin/wrangler.js'), 'd1', ...args,
    '--local', '--config', 'wrangler.admin.jsonc', '--persist-to', '.wrangler/state'], {
    encoding: 'utf8', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false', WRANGLER_LOG_PATH: '.wrangler/logs' },
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Local database command failed.');
  return result.stdout;
}

export async function setupAdmin(username = 'admin') {
  username = username.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) throw new Error('Username must contain 3–32 letters, numbers, dots, underscores or hyphens.');
  await mkdir('.wrangler', { recursive: true });
  let vars = '';
  try { vars = await readFile('.dev.vars', 'utf8'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  let auditKey = vars.match(/^ADMIN_AUDIT_KEY\s*=\s*"?([a-f0-9]{64,})"?\s*$/m)?.[1];
  if (!auditKey) {
    if (/^ADMIN_AUDIT_KEY\s*=/m.test(vars)) throw new Error('ADMIN_AUDIT_KEY exists but is invalid. Do not replace a key used by existing activity records.');
    auditKey = randomBytes(32).toString('hex');
    await writeFile('.dev.vars', `${vars}${vars && !vars.endsWith('\n') ? '\n' : ''}ADMIN_AUDIT_KEY=${auditKey}\n`, { mode: 0o600 });
  }
  wrangler(['migrations', 'apply', 'DB']);
  const existing = JSON.parse(wrangler(['execute', 'DB', '--command', 'SELECT COUNT(*) AS count FROM admin_users', '--json'])) as { results: { count: number }[] }[];
  if (existing[0].results[0].count > 0) return null;
  let password: string;
  do { password = randomBytes(21).toString('base64url'); } while (validateNewPassword(password, username));
  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  const entry = { id: 1, event_id: randomUUID(), occurred_at: new Date().toISOString(), actor_id: id, username, action: 'ACCOUNT_CREATED', outcome: 'success', summary: 'Initial administrator account provisioned by the local setup tool.', source: 'local setup', previous_hash: '0'.repeat(64) };
  const entryHash = signAuditEntry(entry, auditKey);
  const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
  const sql = `INSERT INTO admin_users (id, username, password_hash, created_at) VALUES (${[id, username, passwordHash, entry.occurred_at].map(quote).join(', ')});
INSERT INTO admin_audit_log (id, event_id, occurred_at, actor_id, username, action, outcome, summary, source, previous_hash, entry_hash) VALUES (1, ${[entry.event_id, entry.occurred_at, id, username, entry.action, entry.outcome, entry.summary, entry.source, entry.previous_hash, entryHash].map(quote).join(', ')});`;
  const temporary = `.wrangler/admin-provision-${randomUUID()}.sql`;
  try { await writeFile(temporary, sql, { mode: 0o600 }); wrangler(['execute', 'DB', '--file', temporary]); }
  finally { await unlink(temporary).catch(() => {}); }
  return { username, password };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const credentials = await setupAdmin(process.argv[2] ?? 'admin');
  if (credentials) {
    console.log('\nLocal administrator created. Save these credentials in your password manager.');
    console.log(`Username: ${credentials.username}\nPassword: ${credentials.password}`);
    console.log('Sign in: http://localhost:3000/admin/login\nRestart the dev server after the first setup.');
  } else console.log('An administrator already exists. No credentials or activity records were changed.');
}
