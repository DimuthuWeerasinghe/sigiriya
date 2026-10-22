export const PASSWORD_MIN = 15;
export const PASSWORD_MAX = 128;
export const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,31}$/;

export type FieldErrors = Record<string, string>;

export function validateLogin(input: unknown): { username: string; password: string; errors: FieldErrors } {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const username = typeof record.username === 'string' ? record.username.trim().toLowerCase() : '';
  const password = typeof record.password === 'string' ? record.password : '';
  const errors: FieldErrors = {};
  if (!USERNAME_PATTERN.test(username)) errors.username = 'Use 3–32 letters, numbers, dots, underscores or hyphens. Start with a letter or number.';
  if (!password || password.length > PASSWORD_MAX) errors.password = `Enter your password (up to ${PASSWORD_MAX} characters).`;
  return { username, password, errors };
}

export function validateNewPassword(password: unknown, username: string): string | undefined {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return `Use ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`;
  if (password.trim() !== password) return 'Do not start or end your password with spaces.';
  if (/\p{Cc}/u.test(password)) return 'Control characters are not allowed.';
  if (password.toLowerCase().includes(username.toLowerCase())) return 'Your password must not contain your username.';
  if (/^(.)\1+$/u.test(password) || /^(password|123456|qwerty|letmein|admin)/i.test(password)) return 'Choose a less predictable passphrase.';
  return undefined;
}

export const AUDIT_ACTIONS = [
  'ACCOUNT_CREATED', 'LOGIN_SUCCEEDED', 'LOGIN_FAILED', 'LOGIN_BLOCKED',
  'LOGOUT', 'SESSION_EXPIRED',
  'AUDIT_VIEWED', 'AUDIT_VERIFIED', 'AUDIT_CHANGE_BLOCKED',
  'ACCOUNT_CREDENTIALS_CHANGED', 'ENQUIRY_CREATED', 'REQUEST_CREATED', 'INBOX_VIEWED',
  'CONVERSATION_VIEWED', 'CONVERSATION_UPDATED', 'CONVERSATION_ARCHIVED', 'CONVERSATION_RESTORED',
  'ADMIN_REPLIED', 'VISITOR_REPLIED', 'DOCUMENT_UPLOADED', 'DOCUMENT_UPDATED',
  'DOCUMENT_PUBLISHED', 'DOCUMENT_ARCHIVED', 'DOCUMENT_RESTORED', 'DOCUMENT_DOWNLOADED', 'DOCUMENTS_VIEWED', 'WEBSITE_UPDATED', 'WEBSITE_IMAGE_UPLOADED',
] as const;

export type AuditAction = typeof AUDIT_ACTIONS[number];

export function parseAuditQuery(params: URLSearchParams) {
  const search = params.get('search')?.trim() ?? '';
  const action = params.get('action') ?? '';
  const outcome = params.get('outcome') ?? '';
  const pageText = params.get('page') ?? '1';
  const errors: FieldErrors = {};
  if (search.length > 100 || /\p{Cc}/u.test(search)) errors.search = 'Search must be at most 100 characters.';
  if (action && !(AUDIT_ACTIONS as readonly string[]).includes(action)) errors.action = 'Choose a valid activity type.';
  if (outcome && !['success', 'failure', 'blocked'].includes(outcome)) errors.outcome = 'Choose a valid result.';
  if (!/^[1-9]\d{0,5}$/.test(pageText)) errors.page = 'Choose a valid page.';
  return { search, action, outcome, page: Number(pageText), errors };
}
