export const DOCUMENT_CATEGORIES = ['Application Forms', 'Council Reports', 'Budget Reports', 'Publications', 'Citizen Charter', 'Gazette', 'Strategic Plan', 'Other'] as const;
export const DOCUMENT_LANGUAGES = ['English', 'Sinhala', 'Tamil', 'Trilingual'] as const;
export const CONVERSATION_STATUSES = ['new', 'in_progress', 'resolved', 'closed', 'archived'] as const;
export const PRIORITIES = ['normal', 'high', 'urgent'] as const;
export const REQUEST_CATEGORIES = ['General', 'Rates and taxes', 'Trade licences', 'Building applications', 'Waste management', 'Roads and drainage', 'Other'] as const;
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_CHUNK_BYTES = 256 * 1024;
export type FieldErrors = Record<string, string>;
export type ConversationStatus = typeof CONVERSATION_STATUSES[number];
export type DocumentStatus = 'draft' | 'published' | 'archived';
export type ConversationKind = 'enquiry' | 'request';

function object(input: unknown): Record<string, unknown> { return input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}; }
function text(input: unknown): string { return typeof input === 'string' ? input.trim().replace(/\r\n?/g, '\n') : ''; }
const control = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
function bounded(value: string, min: number, max: number) { return value.length >= min && value.length <= max && !control.test(value); }

export function validateSubmission(input: unknown) {
  const record = object(input);
  const value = { name: text(record.name), email: text(record.email), phone: text(record.phone), subject: text(record.subject), category: text(record.category) || 'General', message: text(record.message) };
  const errors: FieldErrors = {};
  if (!bounded(value.name, 2, 100) || /[\r\n\t]/.test(value.name)) errors.name = 'Enter your name using 2–100 characters.';
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) errors.email = 'Enter a valid email address.';
  if (value.phone && !/^[+0-9() .-]{7,25}$/.test(value.phone)) errors.phone = 'Enter a valid phone number, or leave it blank.';
  if (!bounded(value.subject, 3, 160) || /[\r\n\t]/.test(value.subject)) errors.subject = 'Use 3–160 characters for the subject.';
  if (!(REQUEST_CATEGORIES as readonly string[]).includes(value.category)) errors.category = 'Choose a valid category.';
  if (!bounded(value.message, 10, 5000)) errors.message = 'Enter a message using 10–5,000 characters.';
  return { value, errors };
}

export function validateReply(input: unknown) {
  const body = text(object(input).message);
  return { body, errors: bounded(body, 1, 5000) ? {} : { message: 'Use 1–5,000 characters for your reply.' } as FieldErrors };
}

export function validateTracking(input: unknown) {
  const record = object(input);
  const reference = text(record.reference).toUpperCase();
  const token = text(record.token);
  const errors: FieldErrors = {};
  if (!/^(ENQ|REQ)-[A-F0-9]{12}$/.test(reference)) errors.reference = 'Enter the reference number you received.';
  if (!/^[a-f0-9]{64}$/.test(token)) errors.token = 'Enter your private access code.';
  return { reference, token, errors };
}

export function validateConversationUpdate(input: unknown) {
  const record = object(input);
  const status = text(record.status) as ConversationStatus;
  const priority = text(record.priority) as typeof PRIORITIES[number];
  const version = record.version;
  const errors: FieldErrors = {};
  if (!(CONVERSATION_STATUSES as readonly string[]).includes(status)) errors.status = 'Choose a valid status.';
  if (!(PRIORITIES as readonly string[]).includes(priority)) errors.priority = 'Choose a valid priority.';
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) errors.version = 'Refresh this conversation and try again.';
  return { status, priority, version: version as number, errors };
}

export function validateDocument(input: unknown) {
  const record = object(input);
  const value = { title: text(record.title), description: text(record.description), category: text(record.category), language: text(record.language), year: Number(record.year), status: text(record.status) as DocumentStatus };
  const errors: FieldErrors = {};
  if (!bounded(value.title, 3, 160) || /[\r\n\t]/.test(value.title)) errors.title = 'Use 3–160 characters for the document title.';
  if (!bounded(value.description, 0, 2000)) errors.description = 'Use up to 2,000 characters for the description.';
  if (!(DOCUMENT_CATEGORIES as readonly string[]).includes(value.category)) errors.category = 'Choose a valid document category.';
  if (!(DOCUMENT_LANGUAGES as readonly string[]).includes(value.language)) errors.language = 'Choose a valid language.';
  if (!Number.isInteger(value.year) || value.year < 1900 || value.year > 2100) errors.year = 'Enter a year between 1900 and 2100.';
  if (!['draft', 'published', 'archived'].includes(value.status)) errors.status = 'Choose a valid publication status.';
  return { value, errors };
}

export function validId(value: string): boolean { return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value); }

export function validatePdf(bytes: Uint8Array, filename: string): string | undefined {
  if (bytes.byteLength < 12 || bytes.byteLength > MAX_DOCUMENT_BYTES) return 'Upload a PDF no larger than 5 MB.';
  if (!/\.pdf$/i.test(filename) || filename.length > 180 || /[\r\n\u0000/\\]/.test(filename)) return 'Choose a PDF file with a valid filename.';
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-' || !new TextDecoder().decode(bytes.slice(-2048)).includes('%%EOF')) return 'The file does not contain a valid PDF header and end marker.';
  return undefined;
}

export function parseListQuery(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim();
  const pageText = params.get('page') ?? '1';
  const errors: FieldErrors = {};
  if (search.length > 100 || control.test(search)) errors.search = 'Use up to 100 characters to search.';
  if (!/^[1-9]\d{0,5}$/.test(pageText)) errors.page = 'Choose a valid page.';
  return { search, page: Number(pageText), errors };
}
