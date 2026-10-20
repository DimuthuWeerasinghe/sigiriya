import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { appendAudit, bindings, getSession, requestSource } from '@/lib/admin/server';
import { digest, randomToken, safeEqual } from '@/lib/admin/security';
import type { AdminIdentity } from '@/lib/admin/types';
import { boundedBody, checkFields, HttpError, json, readJson } from '@/lib/http';
import { CONVERSATION_STATUSES, DOCUMENT_CATEGORIES, DOCUMENT_CHUNK_BYTES, MAX_DOCUMENT_BYTES, parseListQuery, validId, validateConversationUpdate, validateDocument, validatePdf, validateReply, validateSubmission, validateTracking } from './validation';
import type { Conversation, DocumentRecord, ListPage, Message, Thread } from './types';

const conversationColumns = 'id, reference, kind, name, email, phone, subject, category, status, priority, version, created_at, updated_at';
const actor = (identity: AdminIdentity, request: Request) => ({ actorId: identity.id, username: identity.username, source: requestSource(request.headers) });

async function auditChange(event: Parameters<typeof appendAudit>[0], statements: D1PreparedStatement[] = []) {
  try { return await appendAudit(event, statements); }
  catch (error) {
    if (String(error).includes('Concurrent record change')) throw new HttpError(409, 'This record changed. Refresh it before saving again.');
    if (String(error).includes('Conversation is closed')) throw new HttpError(409, 'This conversation is closed. It must be reopened before another reply.');
    throw error;
  }
}

export async function takePublicLimit(key: string, maximum: number, seconds = 900) {
  const now = Math.floor(Date.now() / 1000);
  const limit = await bindings().DB.prepare(`INSERT INTO public_rate_limits (key, attempts, window_started_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN window_started_at <= ? THEN 1 ELSE attempts + 1 END,
    window_started_at = CASE WHEN window_started_at <= ? THEN ? ELSE window_started_at END RETURNING attempts`)
    .bind(digest(key), now, now - seconds, now - seconds, now).first<{ attempts: number }>();
  if ((limit?.attempts ?? 0) > maximum) throw new HttpError(429, 'Too many requests. Please wait a few minutes and try again.');
}

export async function createConversation(request: Request, kind: 'enquiry' | 'request') {
  const source = requestSource(request.headers);
  await takePublicLimit(`submit:${source}`, 10);
  const { value, errors } = validateSubmission(await readJson(request, 32768));
  checkFields(errors);
  const { DB } = bindings();
  const id = randomUUID();
  const reference = `${kind === 'enquiry' ? 'ENQ' : 'REQ'}-${randomBytes(6).toString('hex').toUpperCase()}`;
  const token = randomToken();
  const now = new Date().toISOString();
  await auditChange({ username: 'Public visitor', action: kind === 'enquiry' ? 'ENQUIRY_CREATED' : 'REQUEST_CREATED', outcome: 'success', summary: `Saved ${kind} ${reference}.`, source }, [
    DB.prepare('INSERT INTO inbox_conversations (id, reference, access_token_hash, kind, name, email, phone, subject, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, reference, digest(token), kind, value.name, value.email, value.phone, value.subject, value.category, now, now),
    DB.prepare('INSERT INTO inbox_messages (id, conversation_id, sender_type, sender_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(randomUUID(), id, 'visitor', value.name, value.message, now),
  ]);
  return json({ reference, token, message: 'Your message has been saved. Keep your reference and private access code to view replies.' }, 201);
}

async function publicConversation(input: unknown, source: string) {
  await takePublicLimit(`track:${source}`, 60, 60);
  const { reference, token, errors } = validateTracking(input);
  checkFields(errors);
  const row = await bindings().DB.prepare(`SELECT ${conversationColumns}, access_token_hash FROM inbox_conversations WHERE reference = ?`).bind(reference)
    .first<Conversation & { access_token_hash: string }>();
  if (!row || !safeEqual(row.access_token_hash, digest(token))) throw new HttpError(404, 'The reference number or private access code is incorrect.');
  const { access_token_hash: omitted, ...conversation } = row;
  void omitted;
  return conversation;
}

async function thread(conversation: Conversation): Promise<Thread> {
  const messages = await bindings().DB.prepare('SELECT id, sender_type, sender_name, body, created_at FROM inbox_messages WHERE conversation_id = ? ORDER BY created_at, rowid')
    .bind(conversation.id).all<Message>();
  return { conversation, messages: messages.results };
}

export async function trackConversation(request: Request, reply: boolean) {
  const input = await readJson(request, 32768);
  const source = requestSource(request.headers);
  const conversation = await publicConversation(input, source);
  if (reply) {
    const { body, errors } = validateReply(input);
    checkFields(errors);
    await takePublicLimit(`reply:${conversation.id}`, 10, 600);
    if (['closed', 'archived'].includes(conversation.status)) throw new HttpError(409, 'This conversation is closed. Please submit a new enquiry or request.');
    const now = new Date().toISOString();
    const { DB } = bindings();
    await auditChange({ username: 'Public visitor', action: 'VISITOR_REPLIED', outcome: 'success', summary: `Added a visitor reply to ${conversation.reference}.`, source }, [
      DB.prepare('INSERT INTO inbox_messages (id, conversation_id, sender_type, sender_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(randomUUID(), conversation.id, 'visitor', conversation.name, body, now),
      DB.prepare("UPDATE inbox_conversations SET updated_at = ?, version = version + 1, status = CASE WHEN status = 'resolved' THEN 'in_progress' ELSE status END WHERE id = ?").bind(now, conversation.id),
    ]);
    const updated = await bindings().DB.prepare(`SELECT ${conversationColumns} FROM inbox_conversations WHERE id = ?`).bind(conversation.id).first<Conversation>();
    return json(await thread(updated!));
  }
  return json(await thread(conversation));
}

export async function listConversations(params: URLSearchParams): Promise<ListPage<Conversation>> {
  const query = parseListQuery(params);
  checkFields(query.errors);
  const kind = params.get('kind') ?? '';
  const status = params.get('status') ?? '';
  if (kind && !['enquiry', 'request'].includes(kind)) throw new HttpError(400, 'Choose a valid message type.');
  if (status && !(CONVERSATION_STATUSES as readonly string[]).includes(status)) throw new HttpError(400, 'Choose a valid status.');
  const conditions: string[] = [];
  const values: string[] = [];
  if (kind) { conditions.push('kind = ?'); values.push(kind); }
  if (status) { conditions.push('status = ?'); values.push(status); }
  else if (!params.has('includeArchived')) conditions.push("status != 'archived'");
  if (query.search) { conditions.push('(instr(lower(reference || name || email || subject), lower(?)) > 0)'); values.push(query.search); }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const { DB } = bindings();
  const total = (await DB.prepare(`SELECT COUNT(*) AS total FROM inbox_conversations${where}`).bind(...values).first<{ total: number }>())!.total;
  const pageSize = 15;
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / pageSize)));
  const items = await DB.prepare(`SELECT ${conversationColumns}, (SELECT COUNT(*) FROM inbox_messages m WHERE m.conversation_id = inbox_conversations.id) AS message_count FROM inbox_conversations${where} ORDER BY updated_at DESC, id LIMIT ? OFFSET ?`)
    .bind(...values, pageSize, (page - 1) * pageSize).all<Conversation>();
  return { items: items.results, total, page, pageSize };
}

export async function listDocuments(params: URLSearchParams, publicOnly = false): Promise<ListPage<DocumentRecord>> {
  const query = parseListQuery(params);
  checkFields(query.errors);
  const status = params.get('status') ?? '';
  const category = params.get('category') ?? '';
  if (category && !(DOCUMENT_CATEGORIES as readonly string[]).includes(category)) throw new HttpError(400, 'Choose a valid document category.');
  if (status && !['draft', 'published', 'archived'].includes(status)) throw new HttpError(400, 'Choose a valid publication status.');
  const conditions: string[] = [];
  const values: string[] = [];
  if (publicOnly) conditions.push("d.status = 'published'");
  else if (status) { conditions.push('d.status = ?'); values.push(status); }
  if (category) { conditions.push('d.category = ?'); values.push(category); }
  if (query.search) { conditions.push('(instr(lower(d.title || d.description || d.category || d.language), lower(?)) > 0)'); values.push(query.search); }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const { DB } = bindings();
  const total = (await DB.prepare(`SELECT COUNT(*) AS total FROM document_records d${where}`).bind(...values).first<{ total: number }>())!.total;
  const pageSize = 15;
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / pageSize)));
  const items = await DB.prepare(`SELECT d.*, COALESCE(dl.request_count, 0) AS request_count FROM document_records d LEFT JOIN document_downloads dl ON dl.document_id = d.id${where} ORDER BY d.created_at DESC, d.id LIMIT ? OFFSET ?`)
    .bind(...values, pageSize, (page - 1) * pageSize).all<DocumentRecord>();
  return { items: items.results, total, page, pageSize };
}

async function uploadDocument(request: Request, identity: AdminIdentity) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.startsWith('multipart/form-data;')) throw new HttpError(415, 'Upload a PDF using a document form.');
  const bounded = await boundedBody(request, MAX_DOCUMENT_BYTES + 65536);
  let form: FormData;
  try { form = await new Request(request.url, { method: 'POST', headers: { 'Content-Type': contentType }, body: bounded.buffer as ArrayBuffer }).formData(); }
  catch { throw new HttpError(400, 'The document form could not be read.'); }
  const { value, errors } = validateDocument(Object.fromEntries(form.entries()));
  checkFields(errors);
  const file = form.get('file');
  if (!file || typeof file === 'string') throw new HttpError(400, 'Choose a PDF file.', { file: 'Choose a PDF file.' });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileError = validatePdf(bytes, file.name);
  if (fileError) throw new HttpError(400, fileError, { file: fileError });
  const { DB } = bindings();
  const id = randomUUID();
  const now = new Date().toISOString();
  const checksum = createHash('sha256').update(bytes).digest('hex');
  const parts = Math.ceil(bytes.length / DOCUMENT_CHUNK_BYTES);
  const statements = [DB.prepare('INSERT INTO document_records (id, title, description, category, language, year, status, filename, mime_type, size_bytes, chunk_count, checksum, uploaded_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, value.title, value.description, value.category, value.language, value.year, value.status, file.name, 'application/pdf', bytes.length, parts, checksum, identity.id, now, now)];
  for (let part = 0; part < parts; part++) {
    const chunk = bytes.slice(part * DOCUMENT_CHUNK_BYTES, (part + 1) * DOCUMENT_CHUNK_BYTES);
    statements.push(DB.prepare('INSERT INTO document_chunks (document_id, part, data, checksum) VALUES (?, ?, ?, ?)').bind(id, part, chunk.buffer, createHash('sha256').update(chunk).digest('hex')));
  }
  await auditChange({ ...actor(identity, request), action: 'DOCUMENT_UPLOADED', outcome: 'success', summary: `Uploaded "${value.title}" (${id}) as ${value.status}. SHA-256 ${checksum}.` }, statements);
  return json({ id, message: 'PDF saved in the database.' }, 201);
}

export async function downloadDocument(request: Request, id: string) {
  if (!validId(id)) throw new HttpError(404, 'Document not found.');
  const { DB } = bindings();
  const document = await DB.prepare('SELECT * FROM document_records WHERE id = ?').bind(id).first<DocumentRecord>();
  if (!document) throw new HttpError(404, 'Document not found.');
  const identity = await getSession(request.headers);
  if (document.status !== 'published' && !identity) throw new HttpError(404, 'Document not found.');
  await auditChange({ ...(identity ? actor(identity, request) : { username: 'Public visitor', source: requestSource(request.headers) }), action: 'DOCUMENT_DOWNLOADED', outcome: 'success', summary: `Requested download of document ${document.id}.` }, [
    DB.prepare('INSERT INTO document_downloads (document_id, request_count) VALUES (?, 1) ON CONFLICT(document_id) DO UPDATE SET request_count = request_count + 1').bind(id),
  ]);
  let part = 0;
  let size = 0;
  const checksum = createHash('sha256');
  const stream = new ReadableStream<Uint8Array>({ async pull(controller) {
    try {
      const row = await DB.prepare('SELECT data, checksum FROM document_chunks WHERE document_id = ? AND part = ?').bind(id, part).first<{ data: number[] | ArrayBuffer; checksum: string }>();
      if (!row) throw new Error('Document chunk missing.');
      const bytes = Array.isArray(row.data) ? Uint8Array.from(row.data) : new Uint8Array(row.data);
      if (createHash('sha256').update(bytes).digest('hex') !== row.checksum) throw new Error('Document integrity check failed.');
      checksum.update(bytes); size += bytes.length; part++;
      if (part === document.chunk_count && (size !== document.size_bytes || checksum.digest('hex') !== document.checksum)) throw new Error('Document integrity check failed.');
      controller.enqueue(bytes);
      if (part === document.chunk_count) controller.close();
    } catch (error) { controller.error(error); }
  } });
  const filename = document.filename.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 180);
  return new Response(stream, { headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(document.size_bytes), 'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(document.filename).replaceAll("'", '%27')}`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export async function handleWorkspaceAdmin(request: Request, path: string, identity: AdminIdentity): Promise<Response | undefined> {
  const { DB } = bindings();
  if (path === 'conversations' && request.method === 'GET') {
    const result = await listConversations(new URL(request.url).searchParams);
    await auditChange({ ...actor(identity, request), action: 'INBOX_VIEWED', outcome: 'success', summary: 'Viewed the enquiries and requests inbox.' });
    return json(result);
  }
  const conversationMatch = /^conversations\/([^/]+)(\/messages)?$/.exec(path);
  if (conversationMatch) {
    const id = conversationMatch[1];
    if (!validId(id)) throw new HttpError(404, 'Conversation not found.');
    const conversation = await DB.prepare(`SELECT ${conversationColumns} FROM inbox_conversations WHERE id = ?`).bind(id).first<Conversation>();
    if (!conversation) throw new HttpError(404, 'Conversation not found.');
    if (!conversationMatch[2] && request.method === 'GET') {
      await auditChange({ ...actor(identity, request), action: 'CONVERSATION_VIEWED', outcome: 'success', summary: `Opened ${conversation.reference}.` });
      return json(await thread(conversation));
    }
    if (!conversationMatch[2] && request.method === 'PATCH') {
      const update = validateConversationUpdate(await readJson(request)); checkFields(update.errors);
      if (update.version !== conversation.version) throw new HttpError(409, 'This conversation changed. Refresh before saving.');
      const action = update.status === 'archived' ? 'CONVERSATION_ARCHIVED' : conversation.status === 'archived' ? 'CONVERSATION_RESTORED' : 'CONVERSATION_UPDATED';
      await auditChange({ ...actor(identity, request), action, outcome: 'success', summary: `Updated ${conversation.reference}: ${conversation.status} → ${update.status}; priority ${conversation.priority} → ${update.priority}.` }, [
        DB.prepare('UPDATE inbox_conversations SET status = ?, priority = ?, version = ?, updated_at = ? WHERE id = ?').bind(update.status, update.priority, update.version + 1, new Date().toISOString(), id),
      ]);
      return json({ ok: true });
    }
    if (conversationMatch[2] && request.method === 'POST') {
      const { body, errors } = validateReply(await readJson(request, 32768)); checkFields(errors);
      if (['closed', 'archived'].includes(conversation.status)) throw new HttpError(409, 'Reopen this conversation before replying.');
      const now = new Date().toISOString();
      await auditChange({ ...actor(identity, request), action: 'ADMIN_REPLIED', outcome: 'success', summary: `Replied to ${conversation.reference}.` }, [
        DB.prepare('INSERT INTO inbox_messages (id, conversation_id, sender_type, sender_name, admin_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(randomUUID(), id, 'admin', identity.username, identity.id, body, now),
        DB.prepare("UPDATE inbox_conversations SET version = version + 1, updated_at = ?, status = CASE WHEN status = 'new' THEN 'in_progress' ELSE status END WHERE id = ?").bind(now, id),
      ]);
      return json({ ok: true }, 201);
    }
    throw new HttpError(405, 'Use the reply and status controls; message history is retained.');
  }
  if (path === 'documents' && request.method === 'GET') {
    const result = await listDocuments(new URL(request.url).searchParams);
    await auditChange({ ...actor(identity, request), action: 'DOCUMENTS_VIEWED', outcome: 'success', summary: 'Viewed the document manager.' });
    return json(result);
  }
  if (path === 'documents' && request.method === 'POST') return uploadDocument(request, identity);
  const documentMatch = /^documents\/([^/]+)$/.exec(path);
  if (documentMatch) {
    const id = documentMatch[1];
    if (!validId(id)) throw new HttpError(404, 'Document not found.');
    const document = await DB.prepare('SELECT * FROM document_records WHERE id = ?').bind(id).first<DocumentRecord>();
    if (!document) throw new HttpError(404, 'Document not found.');
    if (request.method === 'PATCH') {
      const input = await readJson(request, 16384) as Record<string, unknown>;
      const { value, errors } = validateDocument(input); checkFields(errors);
      if (!Number.isSafeInteger(input.version) || input.version !== document.version) throw new HttpError(409, 'This document changed. Refresh before saving.');
      const action = value.status === 'archived' ? 'DOCUMENT_ARCHIVED' : document.status === 'archived' ? 'DOCUMENT_RESTORED' : value.status === 'published' && document.status !== 'published' ? 'DOCUMENT_PUBLISHED' : 'DOCUMENT_UPDATED';
      await auditChange({ ...actor(identity, request), action, outcome: 'success', summary: `Updated "${value.title}" (${id}): ${document.status} → ${value.status}; ${value.category}, ${value.language}, ${value.year}.` }, [
        DB.prepare('UPDATE document_records SET title = ?, description = ?, category = ?, language = ?, year = ?, status = ?, version = ?, updated_at = ? WHERE id = ?')
          .bind(value.title, value.description, value.category, value.language, value.year, value.status, document.version + 1, new Date().toISOString(), id),
      ]);
      return json({ ok: true });
    }
    throw new HttpError(405, 'Archive documents to retain their file and activity history.');
  }
  return undefined;
}
