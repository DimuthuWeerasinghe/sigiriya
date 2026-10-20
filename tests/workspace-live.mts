import assert from 'node:assert/strict';
import { createInterface } from 'node:readline';
import { once } from 'node:events';
import { createHash, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import type { Conversation, DocumentRecord, ListPage, Thread } from '../lib/workspace/types.ts';

console.log('Ready for workspace test credentials as one JSON line on hidden stdin.');
if (process.stdin.isTTY) process.stdin.setRawMode(true);
const input = createInterface({ input: process.stdin, terminal: false });
const [line] = await once(input, 'line'); input.close();
if (process.stdin.isTTY) process.stdin.setRawMode(false);
process.stdin.pause();
const credentials = JSON.parse(line) as { username: string; password: string };
const base = process.env.ADMIN_TEST_URL ?? 'http://localhost:3000';
let cookie = ''; let csrf = ''; let checks = 0;
const pass = (message: string) => { checks++; console.log(`PASS ${message}`); };
async function call(path: string, options: { method?: string; data?: unknown; auth?: boolean; noCsrf?: boolean; origin?: string } = {}) {
  const isForm = options.data instanceof FormData;
  return fetch(`${base}${path}`, { method: options.method ?? 'GET', redirect: 'manual', headers: {
    ...(options.method ? { Origin: options.origin ?? base } : {}),
    ...(options.data !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
    ...(options.auth ? { Cookie: cookie, ...(!options.noCsrf ? { 'X-CSRF-Token': csrf } : {}) } : {}),
  }, ...(options.data !== undefined ? { body: isForm ? options.data as FormData : JSON.stringify(options.data) } : {}) });
}
async function expect(response: Response, status: number) { if (response.status !== status) assert.equal(response.status, status, `${response.url}: ${(await response.clone().text()).slice(0, 500)}`); return response; }
async function json<T>(response: Response, status = 200): Promise<T> { await expect(response, status); return await response.json() as T; }
function pdfFixture(): Uint8Array {
  const content = `% Database persistence test\n%${'x'.repeat(2300 * 1024)}\n`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R >>', `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`];
  let data = '%PDF-1.4\n'; const offsets = [0];
  for (let index = 0; index < objects.length; index++) { offsets.push(Buffer.byteLength(data)); data += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`; }
  const xref = Buffer.byteLength(data);
  data += `xref\n0 5\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(data);
}
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function archiveVerificationFixtures() {
  const records = await json<ListPage<Conversation>>(await call('/api/admin/conversations?search=Verification', { auth: true }));
  for (const record of records.items) {
    if (record.name === 'Verification Visitor' && record.email === 'verification@example.invalid' && /^Verification [a-f0-9]{8} (enquiry|request)$/.test(record.subject)) {
      await expect(await call(`/api/admin/conversations/${record.id}`, { method: 'PATCH', auth: true, data: { status: 'archived', priority: record.priority, version: record.version } }), 200);
    }
  }
}

async function main() {
  await expect(await call('/api/admin/conversations'), 401);
  await expect(await call('/api/admin/documents'), 401);
  pass('Private inbox and document APIs reject anonymous requests.');
  const login = await expect(await call('/api/admin/login', { method: 'POST', data: credentials }), 200);
  cookie = login.headers.get('set-cookie')!.split(';')[0];
  csrf = (await json<{ csrfToken: string }>(await call('/api/admin/session', { auth: true }))).csrfToken;
  pass('Requested administrator credentials authenticate successfully.');
  for (const [path, label] of [['/admin', 'Overview'], ['/admin/inbox', 'Enquiries & requests'], ['/admin/documents', 'Documents']]) {
    const page = await expect(await call(path, { auth: true }), 200);
    assert.ok((await page.text()).replaceAll('&amp;', '&').includes(label), `Missing screen label for ${path}`);
  }
  pass('Authenticated overview, inbox and document-management screens render successfully.');

  if (process.argv.includes('--persistence-only')) {
    const saved = JSON.parse(await readFile('.wrangler/workspace-verification.json', 'utf8')) as { requestId: string; enquiryId: string; documentId: string; checksum: string };
    for (const id of [saved.requestId, saved.enquiryId]) {
      const record = await json<Thread>(await call(`/api/admin/conversations/${id}`, { auth: true }));
      assert.equal(record.conversation.status, 'archived'); assert.ok(record.messages.length);
    }
    const response = await expect(await call(`/api/public/documents/${saved.documentId}/download`, { auth: true }), 200);
    assert.equal(digest(new Uint8Array(await response.arrayBuffer())), saved.checksum);
    assert.equal((await json<{ valid: boolean }>(await call('/api/admin/activity/verify', { method: 'POST', auth: true }))).valid, true);
    await archiveVerificationFixtures();
    pass('Messages, archived documents, exact file bytes and signed logs survive server restart and the built Worker runtime.');
    return;
  }

  const tag = `Verification ${randomBytes(4).toString('hex')}`;
  const submission = { name: 'Verification Visitor', email: 'verification@example.invalid', phone: '', subject: `${tag} request`, category: 'General', message: 'Please review this automated storage verification request.' };
  await expect(await call('/api/public/enquiries', { method: 'POST', data: { ...submission, email: 'invalid' } }), 400);
  await expect(await call('/api/public/requests', { method: 'POST', data: submission, origin: 'https://attacker.invalid' }), 403);
  pass('Public forms reject invalid contact details and cross-origin submissions.');
  const request = await json<{ reference: string; token: string }>(await call('/api/public/requests', { method: 'POST', data: submission }), 201);
  const enquiry = await json<{ reference: string; token: string }>(await call('/api/public/enquiries', { method: 'POST', data: { ...submission, subject: `${tag} enquiry` } }), 201);
  assert.match(request.reference, /^REQ-/); assert.match(enquiry.reference, /^ENQ-/);
  pass('Enquiries and requests receive separate references and private tracking credentials.');

  await expect(await call('/api/public/track', { method: 'POST', data: { reference: request.reference, token: '0'.repeat(64) } }), 404);
  let tracked = await json<Thread>(await call('/api/public/track', { method: 'POST', data: request }));
  assert.equal(tracked.messages.length, 1); assert.equal(tracked.messages[0].body, submission.message);
  assert.equal('access_token_hash' in tracked.conversation, false);
  pass('Only the correct private access code reveals the saved conversation.');

  const queue = await json<ListPage<Conversation>>(await call(`/api/admin/conversations?search=${encodeURIComponent(tag)}`, { auth: true }));
  assert.equal(queue.total, 2);
  const requestId = queue.items.find((item) => item.reference === request.reference)!.id;
  const enquiryId = queue.items.find((item) => item.reference === enquiry.reference)!.id;
  await expect(await call(`/api/admin/conversations/${requestId}/messages`, { method: 'POST', auth: true, noCsrf: true, data: { message: 'Blocked reply.' } }), 403);
  await expect(await call(`/api/admin/conversations/${requestId}/messages`, { method: 'POST', auth: true, data: { message: 'The council has reviewed your request.' } }), 201);
  tracked = await json<Thread>(await call('/api/public/track', { method: 'POST', data: request }));
  assert.ok(tracked.messages.some((item) => item.sender_type === 'admin' && item.body === 'The council has reviewed your request.'));
  pass('Admin replies are persisted, CSRF-protected and visible to the correct visitor.');

  tracked = await json<Thread>(await call('/api/public/reply', { method: 'POST', data: { ...request, message: 'Thank you. Here is additional information.' } }));
  assert.equal(tracked.messages.length, 3);
  const stale = tracked.conversation.version;
  await expect(await call(`/api/admin/conversations/${requestId}`, { method: 'PATCH', auth: true, data: { status: 'resolved', priority: 'high', version: stale } }), 200);
  await expect(await call(`/api/admin/conversations/${requestId}`, { method: 'PATCH', auth: true, data: { status: 'closed', priority: 'normal', version: stale } }), 409);
  tracked = await json<Thread>(await call('/api/public/reply', { method: 'POST', data: { ...request, message: 'I still need help with this request.' } }));
  assert.equal(tracked.conversation.status, 'in_progress');
  pass('Visitor follow-ups persist, reopen resolved requests, and stale admin updates are blocked.');

  await expect(await call(`/api/admin/conversations/${requestId}`, { method: 'PATCH', auth: true, data: { status: 'archived', priority: 'normal', version: tracked.conversation.version } }), 200);
  tracked = await json<Thread>(await call('/api/public/track', { method: 'POST', data: request }));
  assert.equal(tracked.messages.length, 4);
  await expect(await call('/api/public/reply', { method: 'POST', data: { ...request, message: 'Reply to closed record.' } }), 409);
  await expect(await call(`/api/admin/conversations/${requestId}/messages`, { method: 'POST', auth: true, data: { message: 'Closed record reply.' } }), 409);
  pass('Archiving retains conversation history while blocking new replies.');

  const metadata = { title: `${tag} document`, description: 'Automated database file-storage verification.', category: 'Application Forms', language: 'English', year: '2026', status: 'draft' };
  function upload(bytes: Uint8Array, filename = 'verification.pdf') { const form = new FormData(); for (const [key, value] of Object.entries(metadata)) form.set(key, value); form.set('file', new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), filename); return form; }
  await expect(await call('/api/admin/documents', { method: 'POST', auth: true, data: upload(new TextEncoder().encode('<html>not a PDF</html>')) }), 400);
  await expect(await call('/api/admin/documents', { method: 'POST', auth: true, data: upload(new Uint8Array(5 * 1024 * 1024 + 128 * 1024)) }), 413);
  pass('Document uploads reject non-PDF content and over-limit request bodies.');
  const bytes = pdfFixture();
  const checksum = digest(bytes);
  const uploaded = await json<{ id: string }>(await call('/api/admin/documents', { method: 'POST', auth: true, data: upload(bytes) }), 201);
  const documentId = uploaded.id;
  await expect(await call(`/api/public/documents/${documentId}/download`), 404);
  const privateFile = await expect(await call(`/api/public/documents/${documentId}/download`, { auth: true }), 200);
  assert.equal(digest(new Uint8Array(await privateFile.arrayBuffer())), checksum);
  pass('PDF bytes larger than one database row are stored in chunks; draft downloads remain staff-only.');

  async function documentRow() {
    const listing = await json<ListPage<DocumentRecord>>(await call(`/api/admin/documents?search=${encodeURIComponent(tag)}`, { auth: true }));
    return listing.items.find((item) => item.id === documentId)!;
  }
  let document = await documentRow();
  await expect(await call(`/api/admin/documents/${documentId}`, { method: 'PATCH', auth: true, data: { ...document, status: 'published' } }), 200);
  let publicList = await json<ListPage<DocumentRecord>>(await call(`/api/public/documents?search=${encodeURIComponent(tag)}`));
  assert.ok(publicList.items.some((item) => item.id === documentId));
  const downloaded = await expect(await call(`/api/public/documents/${documentId}/download`), 200);
  assert.match(downloaded.headers.get('content-disposition') ?? '', /attachment/);
  assert.equal(digest(new Uint8Array(await downloaded.arrayBuffer())), checksum);
  pass('Published documents appear publicly and download with exactly the uploaded file bytes.');

  document = await documentRow();
  assert.ok(document.request_count >= 2);
  await expect(await call(`/api/admin/documents/${documentId}`, { method: 'PATCH', auth: true, data: { ...document, title: `${tag} document updated`, language: 'Sinhala' } }), 200);
  await expect(await call(`/api/admin/documents/${documentId}`, { method: 'PATCH', auth: true, data: { ...document, status: 'draft' } }), 409);
  document = await documentRow(); assert.equal(document.language, 'Sinhala');
  await expect(await call(`/api/admin/documents/${documentId}`, { method: 'PATCH', auth: true, data: { ...document, status: 'archived' } }), 200);
  await expect(await call(`/api/public/documents/${documentId}/download`), 404);
  publicList = await json<ListPage<DocumentRecord>>(await call(`/api/public/documents?search=${encodeURIComponent(tag)}`));
  assert.equal(publicList.items.some((item) => item.id === documentId), false);
  pass('Metadata edits, download counts, stale-write protection and public archive visibility work.');

  document = await documentRow();
  await expect(await call(`/api/admin/documents/${documentId}`, { method: 'PATCH', auth: true, data: { ...document, status: 'draft' } }), 200);
  document = await documentRow();
  assert.equal(document.status, 'draft');
  await expect(await call(`/api/admin/documents/${documentId}`, { method: 'PATCH', auth: true, data: { ...document, status: 'archived' } }), 200);
  const retainedFile = await expect(await call(`/api/public/documents/${documentId}/download`, { auth: true }), 200);
  assert.equal(digest(new Uint8Array(await retainedFile.arrayBuffer())), checksum);
  pass('Archived documents can be restored, and original file bytes remain available to administrators.');

  const enquiryThread = await json<Thread>(await call(`/api/admin/conversations/${enquiryId}`, { auth: true }));
  await expect(await call(`/api/admin/conversations/${enquiryId}`, { method: 'PATCH', auth: true, data: { status: 'archived', priority: 'normal', version: enquiryThread.conversation.version } }), 200);
  for (const action of ['ENQUIRY_CREATED', 'REQUEST_CREATED', 'ADMIN_REPLIED', 'VISITOR_REPLIED', 'DOCUMENT_UPLOADED', 'DOCUMENT_PUBLISHED', 'DOCUMENT_ARCHIVED', 'DOCUMENT_RESTORED', 'DOCUMENT_DOWNLOADED', 'ACCOUNT_CREDENTIALS_CHANGED']) {
    const log = await json<{ total: number }>(await call(`/api/admin/activity?action=${action}`, { auth: true }));
    assert.ok(log.total > 0, `Missing audit event ${action}`);
  }
  await expect(await call('/api/admin/activity', { method: 'DELETE', auth: true }), 405);
  const verified = await json<{ valid: boolean }>(await call('/api/admin/activity/verify', { method: 'POST', auth: true }));
  assert.equal(verified.valid, true);
  pass('Credential changes, conversations, replies, publication/archive actions and downloads are signed in the non-deletable activity log.');
  await writeFile('.wrangler/workspace-verification.json', JSON.stringify({ requestId, enquiryId, documentId, checksum }));
  await archiveVerificationFixtures();
}

try { await main(); console.log(`\n${checks} workspace integration checks passed.`); }
finally { if (cookie && csrf) await call('/api/admin/logout', { method: 'POST', auth: true }); }
