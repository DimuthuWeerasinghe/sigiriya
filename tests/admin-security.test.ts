import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword, verifyPassword, safeEqual, signAuditEntry, digest, randomToken, sessionCookie, readSessionCookie, checkRequestOrigin } from '../lib/admin/security.ts';
import { validateLogin, validateNewPassword, parseAuditQuery } from '../lib/admin/validation.ts';

test('login validation rejects missing fields, oversized input, and SQL/HTML usernames', () => {
  for (const input of [null, {}, { username: "admin' OR 1=1--", password: 'hello' }, { username: '<script>alert(1)</script>', password: 'hello' }, { username: 'a'.repeat(33), password: 'hello' }, { username: 'admin', password: 'x'.repeat(129) }]) {
    assert.ok(Object.keys(validateLogin(input).errors).length > 0);
  }
  const valid = validateLogin({ username: ' ADMIN ', password: ' correct horse battery staple ' });
  assert.equal(valid.username, 'admin');
  assert.equal(valid.password, ' correct horse battery staple ');
  assert.deepEqual(valid.errors, {});
});

test('new account passwords require a long nonpredictable passphrase', () => {
  for (const password of ['short', 'password123456789', 'admin-in-a-long-password', 'xxxxxxxxxxxxxxxx', 'a'.repeat(129), ' long password here ', 'long\npassphrase\nwith\ncontrols']) assert.ok(validateNewPassword(password, 'admin'));
  assert.equal(validateNewPassword('river garden mountain lantern', 'admin'), undefined);
});

test('password hashes are salted, reject wrong passwords, and fail safely on bad encodings', async () => {
  const first = await hashPassword('river garden mountain lantern');
  const second = await hashPassword('river garden mountain lantern');
  assert.notEqual(first, second);
  assert.equal(first.includes('river'), false);
  assert.equal(await verifyPassword('river garden mountain lantern', first), true);
  assert.equal(await verifyPassword('incorrect password', first), false);
  assert.equal(await verifyPassword('anything', 'broken-hash'), false);
  assert.equal(await verifyPassword('anything', 'scrypt-v1:00:00'), false);
});

test('session cookies are private and malformed tokens are ignored', () => {
  const token = randomToken();
  assert.equal(token.length, 64);
  assert.notEqual(digest(token), token);
  const cookie = sessionCookie(token, true);
  for (const attribute of ['HttpOnly', 'SameSite=Strict', 'Secure', 'Max-Age=28800', 'Path=/']) assert.ok(cookie.includes(attribute));
  assert.equal(sessionCookie(token, false).includes('Secure'), false);
  assert.equal(readSessionCookie(new Headers({ Cookie: `another=1; dps_admin_session=${token}` })), token);
  assert.equal(readSessionCookie(new Headers({ Cookie: 'dps_admin_session=bad-token' })), undefined);
  assert.equal(safeEqual(token, token), true);
  assert.equal(safeEqual(token, token.slice(1)), false);
});

test('cross-origin, absent-origin, and spoofed cross-site mutations fail validation', () => {
  const request = (origin?: string, site?: string) => new Request('https://council.example/api/admin/login', { method: 'POST', headers: { ...(origin ? { Origin: origin } : {}), ...(site ? { 'Sec-Fetch-Site': site } : {}) } });
  assert.equal(checkRequestOrigin(request('https://council.example', 'same-origin')), true);
  assert.equal(checkRequestOrigin(request('https://attacker.example')), false);
  assert.equal(checkRequestOrigin(request()), false);
  assert.equal(checkRequestOrigin(request('https://council.example', 'cross-site')), false);
});

test('activity query validation blocks unbounded and unexpected filters', () => {
  for (const query of ['page=-1', 'page=1e3', 'page=9999999', 'action=DROP_TABLE', 'outcome=anything', `search=${'x'.repeat(101)}`]) assert.ok(Object.keys(parseAuditQuery(new URLSearchParams(query)).errors).length);
  assert.deepEqual(parseAuditQuery(new URLSearchParams('search=admin&action=LOGIN_FAILED&outcome=failure&page=2')).errors, {});
});

test('changing any signed audit field or the signing key changes its signature', () => {
  const event = { id: 1, event_id: 'event-1', occurred_at: '2026-10-20T10:00:00.000Z', actor_id: null, username: 'admin', action: 'LOGIN_FAILED', outcome: 'failure', summary: 'Rejected sign-in.', source: 'local', previous_hash: '0'.repeat(64) };
  const key = 'a'.repeat(64);
  const signature = signAuditEntry(event, key);
  for (const changed of [{ ...event, username: 'someone' }, { ...event, outcome: 'success' }, { ...event, summary: 'Altered' }, { ...event, previous_hash: 'b'.repeat(64) }, { ...event, occurred_at: '2026-10-21T10:00:00.000Z' }]) assert.notEqual(signAuditEntry(changed, key), signature);
  assert.notEqual(signAuditEntry(event, 'c'.repeat(64)), signature);
});

test('real schema rejects UPDATE, DELETE, replacement, chain forks, and out-of-order records', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(readFileSync(new URL('../db/migrations/0001_admin.sql', import.meta.url), 'utf8'));
    const insert = db.prepare('INSERT INTO admin_audit_log (id, event_id, occurred_at, username, action, outcome, summary, source, previous_hash, entry_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insert.run(1, 'first', '2026-10-20', 'admin', 'ACCOUNT_CREATED', 'success', 'Created.', 'local', '0'.repeat(64), 'a'.repeat(64));
    assert.throws(() => db.exec("UPDATE admin_audit_log SET username = 'attacker'"), /cannot be updated/);
    assert.throws(() => db.exec('DELETE FROM admin_audit_log'), /cannot be deleted/);
    assert.throws(() => db.exec("INSERT OR REPLACE INTO admin_audit_log SELECT * FROM admin_audit_log"), /chain conflict/);
    assert.throws(() => insert.run(2, 'fork', '2026-10-20', 'admin', 'LOGIN_FAILED', 'failure', 'Fork.', 'local', '0'.repeat(64), 'b'.repeat(64)), /chain conflict/);
    assert.throws(() => insert.run(3, 'gap', '2026-10-20', 'admin', 'LOGIN_FAILED', 'failure', 'Gap.', 'local', 'a'.repeat(64), 'c'.repeat(64)), /chain conflict/);
    insert.run(2, 'second', '2026-10-20', 'admin', 'LOGIN_SUCCEEDED', 'success', 'Signed in.', 'local', 'a'.repeat(64), 'b'.repeat(64));
    assert.equal((db.prepare('SELECT COUNT(*) AS count FROM admin_audit_log').get() as { count: number }).count, 2);
    assert.equal(db.prepare('SELECT username FROM admin_audit_log WHERE id=1').get()?.username, 'admin');
  } finally { db.close(); }
});
