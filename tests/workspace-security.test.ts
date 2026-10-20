import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { validateSubmission, validateReply, validateTracking, validateDocument, validatePdf, validateConversationUpdate, parseListQuery, MAX_DOCUMENT_BYTES } from '../lib/workspace/validation.ts';

const submission = { name: "Nimal O'Connor", email: 'person@example.invalid', phone: '+94 77 123 4567', category: 'General', subject: 'Service information', message: 'Please provide the service information.' };
test('submission validation preserves Unicode/plain text and rejects malformed or oversized input', () => {
  assert.deepEqual(validateSubmission(submission).errors, {});
  assert.deepEqual(validateSubmission({ ...submission, name: 'නිමල් පෙරේරා', message: '<script>alert(1)</script> is handled as plain text.' }).errors, {});
  for (const value of [null, [], { ...submission, email: 'not-an-email' }, { ...submission, name: 'a' }, { ...submission, phone: 'javascript:123' }, { ...submission, subject: 'x'.repeat(161) }, { ...submission, category: 'arbitrary' }, { ...submission, message: 'x'.repeat(5001) }, { ...submission, message: 'short' }]) assert.ok(Object.keys(validateSubmission(value).errors).length);
});
test('reply and tracking validation require bounded messages and a private random-token format', () => {
  assert.ok(Object.keys(validateReply({ message: ' ' }).errors).length);
  assert.ok(Object.keys(validateReply({ message: 'x'.repeat(5001) }).errors).length);
  assert.deepEqual(validateReply({ message: 'A follow-up question.' }).errors, {});
  assert.deepEqual(validateTracking({ reference: 'req-0123456789ab', token: 'a'.repeat(64) }).errors, {});
  assert.ok(Object.keys(validateTracking({ reference: 'REQ-other', token: 'wrong' }).errors).length);
});
test('document metadata and upload validation reject unsafe filenames, wrong file signatures, and over-limit files', () => {
  const document = { title: 'Council document', description: '', category: 'Application Forms', language: 'English', year: 2026, status: 'draft' };
  assert.deepEqual(validateDocument(document).errors, {});
  for (const invalid of [{ ...document, status: 'admin' }, { ...document, year: 0 }, { ...document, language: 'invalid' }, { ...document, description: 'x'.repeat(2001) }]) assert.ok(Object.keys(validateDocument(invalid).errors).length);
  const bytes = new TextEncoder().encode('%PDF-1.4\nfixture\n%%EOF');
  assert.equal(validatePdf(bytes, 'form.pdf'), undefined);
  for (const filename of ['form.html', '../form.pdf', 'header\r\ninjection.pdf']) assert.ok(validatePdf(bytes, filename));
  assert.ok(validatePdf(new TextEncoder().encode('<html>not a PDF</html>'), 'form.pdf'));
  assert.ok(validatePdf(new Uint8Array(MAX_DOCUMENT_BYTES + 1), 'large.pdf'));
});
test('record updates and list pagination reject invalid states and unbounded page numbers', () => {
  assert.deepEqual(validateConversationUpdate({ status: 'resolved', priority: 'high', version: 1 }).errors, {});
  for (const input of [{ status: 'deleted', priority: 'high', version: 1 }, { status: 'new', priority: 'anything', version: 1 }, { status: 'new', priority: 'normal', version: -1 }]) assert.ok(Object.keys(validateConversationUpdate(input).errors).length);
  assert.ok(Object.keys(parseListQuery(new URLSearchParams('page=-1')).errors).length);
  assert.ok(Object.keys(parseListQuery(new URLSearchParams(`search=${'a'.repeat(101)}`)).errors).length);
});
test('actual schema preserves message/file history and rejects stale state updates', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const file of ['0001_admin.sql', '0002_workspace.sql']) db.exec(readFileSync(new URL(`../db/migrations/${file}`, import.meta.url), 'utf8'));
    db.exec("INSERT INTO inbox_conversations (id,reference,access_token_hash,kind,name,email,subject,category,created_at,updated_at) VALUES ('thread','REQ-0123456789AB','hash','request','Visitor','person@example.invalid','Test request','General','2026-10-20','2026-10-20')");
    db.exec("INSERT INTO inbox_messages (id,conversation_id,sender_type,sender_name,body,created_at) VALUES ('message','thread','visitor','Visitor','Saved message','2026-10-20')");
    assert.throws(() => db.exec("UPDATE inbox_messages SET body='changed'"), /cannot be edited/);
    assert.throws(() => db.exec('DELETE FROM inbox_messages'), /cannot be deleted/);
    db.exec("UPDATE inbox_conversations SET status='closed',version=2 WHERE id='thread'");
    assert.throws(() => db.exec("UPDATE inbox_conversations SET status='new',version=2 WHERE id='thread'"), /Concurrent record change/);
    assert.throws(() => db.exec("INSERT INTO inbox_messages (id,conversation_id,sender_type,sender_name,body,created_at) VALUES ('late','thread','visitor','Visitor','Closed message','2026-10-20')"), /Conversation is closed/);
    db.exec(`INSERT INTO document_records (id,title,category,language,year,status,filename,mime_type,size_bytes,chunk_count,checksum,uploaded_by,created_at,updated_at) VALUES ('doc','PDF form','Application Forms','English',2026,'draft','form.pdf','application/pdf',3,1,'${'a'.repeat(64)}','admin','2026-10-20','2026-10-20')`);
    db.prepare('INSERT INTO document_chunks (document_id,part,data,checksum) VALUES (?,?,?,?)').run('doc', 0, new Uint8Array([1,2,3]), 'b'.repeat(64));
    assert.throws(() => db.exec('DELETE FROM document_chunks'), /retained/);
    assert.throws(() => db.exec("UPDATE document_chunks SET checksum='changed'"), /cannot be overwritten/);
    db.exec("UPDATE document_records SET status='archived',version=2 WHERE id='doc'");
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM document_chunks WHERE document_id='doc'").get()?.count, 1);
  } finally { db.close(); }
});
