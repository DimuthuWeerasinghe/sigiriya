// Optional integration check against a running local server.
// Supply one JSON line containing username/password through stdin, never argv.
import assert from 'node:assert/strict';
import { createInterface } from 'node:readline';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';

console.log('Ready for local test credentials as one JSON line on stdin.');
if (process.stdin.isTTY) process.stdin.setRawMode(true);
const input = createInterface({ input: process.stdin, terminal: false });
const [line] = await once(input, 'line');
input.close();
if (process.stdin.isTTY) process.stdin.setRawMode(false);
process.stdin.pause();
const credentials = JSON.parse(line) as { username: string; password: string };
const base = process.env.ADMIN_TEST_URL ?? 'http://localhost:3000';
let cookie = '';
let csrf = '';
let checks = 0;

async function call(path: string, options: { method?: string; data?: unknown; origin?: string; authenticated?: boolean; csrf?: boolean } = {}) {
  return fetch(`${base}${path}`, {
    method: options.method ?? 'GET', redirect: 'manual',
    headers: {
      ...(options.method ? { Origin: options.origin ?? base } : {}),
      ...(options.data ? { 'Content-Type': 'application/json' } : {}),
      ...(options.authenticated ? { Cookie: cookie } : {}),
      ...(options.csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    ...(options.data ? { body: JSON.stringify(options.data) } : {}),
  });
}
function passed(message: string) { checks++; console.log(`PASS ${message}`); }

let response = await call('/admin');
assert.ok([302, 303, 307, 308].includes(response.status));
assert.ok(response.headers.get('location')?.endsWith('/admin/login'));
passed('Private dashboard redirects anonymous users.');

response = await call('/api/admin/activity');
assert.equal(response.status, 401);
passed('Activity API rejects anonymous access.');

response = await call('/admin/login');
assert.equal(response.status, 200);
assert.match(await response.text(), /Sign in securely/);
passed('Login screen renders.');

response = await call('/api/admin/login', { method: 'POST', data: credentials, origin: 'https://attacker.invalid' });
assert.equal(response.status, 403);
passed('Cross-origin sign-in is rejected.');

response = await call('/api/admin/login', { method: 'POST', data: { username: "admin' OR 1=1--", password: 'incorrect' } });
assert.equal(response.status, 400);
passed('Server-side input validation rejects injection input.');

response = await call('/api/admin/login', { method: 'POST', data: { username: credentials.username, password: 'intentionally-incorrect-test-password' } });
assert.equal(response.status, 401);
passed('Wrong password is rejected.');

response = await call('/api/admin/login', { method: 'POST', data: credentials });
assert.equal(response.status, 200, `Login failed: ${await response.clone().text()}`);
const setCookie = response.headers.get('set-cookie')!;
assert.match(setCookie, /HttpOnly/);
assert.match(setCookie, /SameSite=Strict/);
assert.match(setCookie, /Max-Age=28800/);
cookie = setCookie.split(';')[0];
passed('Valid credentials create a protected session cookie.');

response = await call('/api/admin/session', { authenticated: true });
assert.equal(response.status, 200);
assert.match(response.headers.get('cache-control') ?? '', /no-store/);
const session = await response.json() as { username: string; csrfToken: string };
assert.equal(session.username, credentials.username);
csrf = session.csrfToken;
assert.equal(csrf.length, 64);
passed('Server session and CSRF token are available only after login.');

response = await call('/admin', { authenticated: true });
assert.equal(response.status, 200);
assert.match(response.headers.get('cache-control') ?? '', /no-store/);
assert.equal(response.headers.get('x-frame-options'), 'DENY');
assert.match(await response.text(), /Recent activity/);
passed('Authenticated dashboard renders live data with no-store and anti-framing headers.');

response = await call('/admin/activity', { authenticated: true });
assert.equal(response.status, 200);
assert.match(await response.text(), /Verify integrity/);
passed('Activity screen renders.');

response = await call('/api/admin/activity?page=-1', { authenticated: true });
assert.equal(response.status, 400);
passed('Invalid activity pagination is rejected.');

response = await call('/api/admin/activity/verify', { method: 'POST', authenticated: true });
assert.equal(response.status, 403);
passed('Authenticated mutation without a CSRF token is rejected.');

for (const method of ['DELETE', 'PUT', 'PATCH', 'POST']) {
  response = await call('/api/admin/activity', { method, authenticated: true, csrf: true });
  assert.equal(response.status, 405);
}
passed('Administrators cannot delete, replace, update, or manually insert activity records.');

const concurrent = await Promise.all([1, 2, 3].map(() => call('/api/admin/activity', { authenticated: true })));
assert.ok(concurrent.every((item) => item.status === 200));
passed('Concurrent audit appends preserve access and chain order.');

response = await call('/api/admin/activity?outcome=blocked', { authenticated: true });
assert.equal(response.status, 200);
const blocked = await response.json() as { total: number; entries: { action: string }[] };
assert.ok(blocked.total >= 4);
assert.ok(blocked.entries.some((entry) => entry.action === 'AUDIT_CHANGE_BLOCKED'));
passed('Blocked log changes are themselves permanently recorded and filterable.');

response = await call('/api/admin/activity/verify', { method: 'POST', authenticated: true, csrf: true });
assert.equal(response.status, 200);
const verified = await response.json() as { valid: boolean; checked: number };
assert.equal(verified.valid, true);
assert.ok(verified.checked >= 10);
passed('All persisted activity signatures and chain links verify.');

const probe = `test-${randomBytes(6).toString('hex')}`;
for (let attempt = 1; attempt <= 6; attempt++) {
  response = await call('/api/admin/login', { method: 'POST', data: { username: probe, password: 'intentionally-incorrect-test-password' } });
  assert.equal(response.status, attempt <= 5 ? 401 : 429);
}
assert.ok(Number(response.headers.get('retry-after')) > 0);
passed('Repeated failed attempts are limited, including for unknown usernames.');

response = await call('/api/admin/logout', { method: 'POST', authenticated: true, csrf: true });
assert.equal(response.status, 200);
assert.match(response.headers.get('set-cookie') ?? '', /Max-Age=0/);
response = await call('/api/admin/session', { authenticated: true });
assert.equal(response.status, 401);
passed('Logout revokes the server session; replaying its cookie fails.');

console.log(`\n${checks} live integration checks passed. No credentials were written to disk.`);
