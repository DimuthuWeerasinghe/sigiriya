import { bindings, appendAudit, getSession, getAuditPage, getOverview, requestSource, verifyAuditChain } from '@/lib/admin/server';
import { checkRequestOrigin, digest, randomToken, safeEqual, sessionCookie, SESSION_SECONDS, verifyPassword } from '@/lib/admin/security';
import { parseAuditQuery, validateLogin } from '@/lib/admin/validation';
import type { AdminIdentity } from '@/lib/admin/types';
import { HttpError, json, readJson } from '@/lib/http';
import { handleWebsiteAdmin } from '@/lib/site/server';
import { handleWorkspaceAdmin } from '@/lib/workspace/server';

export const dynamic = 'force-dynamic';

async function signIn(request: Request) {
  const { DB } = bindings();
  const { username, password, errors } = validateLogin(await readJson(request));
  const source = requestSource(request.headers);
  if (Object.keys(errors).length) {
    await appendAudit({ username: /^[a-z0-9][a-z0-9._-]{2,31}$/.test(username) ? username : '(invalid input)', action: 'LOGIN_FAILED', outcome: 'failure', summary: 'Sign-in input validation failed.', source });
    throw new HttpError(400, 'Check the highlighted fields.', errors);
  }
  const now = Math.floor(Date.now() / 1000);
  const accountKey = digest(`account:${username}`);
  const sourceKey = digest(`source:${source}`);
  const limits = await DB.batch([accountKey, sourceKey].map((key) => DB.prepare(`
    INSERT INTO admin_login_limits (key, attempts, window_started_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN window_started_at <= ? THEN 1 ELSE attempts + 1 END,
      window_started_at = CASE WHEN window_started_at <= ? THEN ? ELSE window_started_at END
    RETURNING attempts, window_started_at`).bind(key, now, now - 900, now - 900, now)));
  const accountLimit = limits[0].results[0] as { attempts: number; window_started_at: number };
  const sourceLimit = limits[1].results[0] as { attempts: number; window_started_at: number };
  if (accountLimit.attempts > 5 || sourceLimit.attempts > 25) {
    await appendAudit({ username, action: 'LOGIN_BLOCKED', outcome: 'blocked', summary: 'Sign-in temporarily limited after repeated attempts.', source });
    const retryAfter = Math.max(1, 900 - (now - (accountLimit.attempts > 5 ? accountLimit.window_started_at : sourceLimit.window_started_at)));
    return json({ error: 'Too many sign-in attempts. Please try again after 15 minutes.' }, 429, { 'Retry-After': String(retryAfter) });
  }
  const user = await DB.prepare('SELECT id, username, password_hash, disabled FROM admin_users WHERE username = ? COLLATE NOCASE').bind(username)
    .first<{ id: string; username: string; password_hash: string; disabled: number }>();
  const dummyHash = `scrypt-v1:${'0'.repeat(48)}:${'0'.repeat(128)}`;
  const passwordMatches = await verifyPassword(password, user?.password_hash ?? dummyHash);
  if (!user || !passwordMatches || user.disabled) {
    await appendAudit({ username, action: 'LOGIN_FAILED', outcome: 'failure', summary: 'Username or password was not accepted.', source });
    throw new HttpError(401, 'Username or password is incorrect.');
  }
  const token = randomToken();
  const csrfToken = randomToken();
  const previous = await getSession(request.headers);
  await appendAudit({ actorId: user.id, username: user.username, action: 'LOGIN_SUCCEEDED', outcome: 'success', summary: 'Signed in to the administration panel.', source }, [
    ...(previous ? [DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(previous.tokenHash)] : []),
    DB.prepare('INSERT INTO admin_sessions (token_hash, user_id, csrf_token, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').bind(digest(token), user.id, csrfToken, now, now, now + SESSION_SECONDS),
    DB.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').bind(new Date().toISOString(), user.id),
    DB.prepare('DELETE FROM admin_login_limits WHERE key = ?').bind(accountKey),
  ]);
  return json({ username: user.username }, 200, { 'Set-Cookie': sessionCookie(token, new URL(request.url).protocol === 'https:') });
}

async function protectedRequest(request: Request, path: string, identity: AdminIdentity) {
  const { DB } = bindings();
  const source = requestSource(request.headers);
  const auditActor = { actorId: identity.id, username: identity.username, source };
  if (path === 'session' && request.method === 'GET') return json({ username: identity.username, csrfToken: identity.csrfToken, expiresAt: identity.expiresAt });
  if (path === 'overview' && request.method === 'GET') return json(await getOverview());
  if (path === 'logout' && request.method === 'POST') {
    await appendAudit({ ...auditActor, action: 'LOGOUT', outcome: 'success', summary: 'Signed out of the administration panel.' }, [DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(identity.tokenHash)]);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', new URL(request.url).protocol === 'https:', 0) });
  }
  if (path === 'activity' && request.method === 'GET') {
    const query = parseAuditQuery(new URL(request.url).searchParams);
    if (Object.keys(query.errors).length) throw new HttpError(400, 'Check the activity filters.', query.errors);
    await appendAudit({ ...auditActor, action: 'AUDIT_VIEWED', outcome: 'success', summary: 'Viewed the activity log.' });
    return json(await getAuditPage(query));
  }
  if (path === 'activity/verify' && request.method === 'POST') {
    const result = await verifyAuditChain();
    await appendAudit({ ...auditActor, action: 'AUDIT_VERIFIED', outcome: result.valid ? 'success' : 'failure', summary: result.valid ? `Verified ${result.checked} activity records.` : `Activity verification failed at record ${result.failedAt}.` });
    return json(result);
  }
  if (path === 'activity' && request.method !== 'GET') {
    await appendAudit({ ...auditActor, action: 'AUDIT_CHANGE_BLOCKED', outcome: 'blocked', summary: `Blocked a ${request.method} attempt against the read-only activity log.` });
    return json({ error: 'Activity records are permanent. Editing and deletion are not allowed, including for administrators.' }, 405, { Allow: 'GET' });
  }
  const websiteResponse = await handleWebsiteAdmin(request, path, identity);
  if (websiteResponse) return websiteResponse;
  const workspaceResponse = await handleWorkspaceAdmin(request, path, identity);
  if (workspaceResponse) return workspaceResponse;
  throw new HttpError(404, 'This admin endpoint does not exist.');
}

async function handle(request: Request) {
  try {
    const path = new URL(request.url).pathname.replace(/^\/api\/admin\//, '').replace(/\/$/, '');
    if (!['GET', 'HEAD'].includes(request.method) && !checkRequestOrigin(request)) throw new HttpError(403, 'This request must come from this website.');
    if (path === 'login') {
      if (request.method !== 'POST') return json({ error: 'Use POST to sign in.' }, 405, { Allow: 'POST' });
      return await signIn(request);
    }
    const identity = await getSession(request.headers);
    if (!identity) throw new HttpError(401, 'Your session has ended. Please sign in.');
    if (!['GET', 'HEAD'].includes(request.method) && !safeEqual(request.headers.get('x-csrf-token') ?? '', identity.csrfToken)) throw new HttpError(403, 'The security token is missing or invalid. Refresh and try again.');
    return await protectedRequest(request, path, identity);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message, fields: error.fields }, error.status);
    console.error('Admin service request failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'The admin service is temporarily unavailable. Please try again.' }, 503);
  }
}

export { handle as GET, handle as POST, handle as DELETE, handle as PUT, handle as PATCH };
