import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT_OPTIONS, (error, key) => error ? reject(error) : resolve(key));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(24).toString('hex');
  return `scrypt-v1:${salt}:${(await derive(password, salt)).toString('hex')}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [scheme, salt, hash] = encoded.split(':');
  if (scheme !== 'scrypt-v1' || !/^[a-f0-9]{48}$/.test(salt ?? '') || !/^[a-f0-9]{128}$/.test(hash ?? '')) return false;
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

export function randomToken(): string { return randomBytes(32).toString('hex'); }
export function digest(value: string): string { return createHash('sha256').update(value).digest('hex'); }
export function safeEqual(left: string, right: string): boolean {
  const first = Buffer.from(left);
  const second = Buffer.from(right);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function signAuditEntry(entry: { id: number; event_id: string; occurred_at: string; actor_id: string | null; username: string; action: string; outcome: string; summary: string; source: string; previous_hash: string }, key: string): string {
  const canonical = JSON.stringify([entry.id, entry.event_id, entry.occurred_at, entry.actor_id, entry.username, entry.action, entry.outcome, entry.summary, entry.source, entry.previous_hash]);
  return createHmac('sha256', key).update(canonical).digest('hex');
}

export function checkRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(request.url).origin && request.headers.get('sec-fetch-site') !== 'cross-site';
}

export const SESSION_COOKIE = 'dps_admin_session';
export const SESSION_SECONDS = 8 * 60 * 60;
export const IDLE_SECONDS = 30 * 60;

export function sessionCookie(token: string, secure: boolean, maxAge = SESSION_SECONDS): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export function readSessionCookie(headers: Headers): string | undefined {
  const raw = headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  return raw && /^[a-f0-9]{64}$/.test(raw) ? raw : undefined;
}
