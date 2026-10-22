import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { defaultSections } from '../lib/site/defaults.ts';
import { definition, imageMime, isSectionId, safeDestination, sectionIds, validateSection } from '../lib/site/schema.ts';

const payload = <T extends keyof typeof defaultSections>(id: T) => ({ version: 0, values: structuredClone(defaultSections[id]), translations: {} });
test('all 17 website sections have valid defaults and controls for every field', () => {
  assert.equal(sectionIds.length, 17);
  for (const id of sectionIds) {
    assert.deepEqual(validateSection(id, payload(id)).errors, {}, id);
    assert.deepEqual(definition(id).fields.map(field=>field.key), Object.keys(defaultSections[id]));
  }
  assert.equal(isSectionId('__proto__'), false);
  assert.equal(isSectionId('unknown'), false);
});
test('message pages support blank photo and message areas and multilingual details', () => {
  const input = { ...payload('chairman'), translations: { 'Message from the Chairman': ['සභාපතිතුමාගේ පණිවිඩය', 'தலைவரின் செய்தி'] } };
  assert.deepEqual(validateSection('chairman', input).errors, {});
  assert.equal(defaultSections.chairman.photo, '');
  assert.equal(defaultSections.chairman.message, '');
});
test('links and image URLs reject executable protocols, credentials and disguised external paths', () => {
  for (const link of ['javascript:alert(1)', 'data:text/html,x', '//attacker.example', '/\\attacker.example', 'https://user:password@example.com', 'https://example.com\n']) assert.equal(safeDestination(link), false, link);
  for (const link of ['/contact', '#council', 'https://example.com/path', 'mailto:office@example.com', 'tel:+94661234567']) assert.equal(safeDestination(link), true, link);
  assert.equal(safeDestination('mailto:office@example.com', true), false);
  assert.equal(safeDestination('/api/public/site-media/id', true), true);
});
test('content validation rejects unknown fields, wrong types, empty galleries and excessive text', () => {
  const unknown = payload('hero'); Object.assign(unknown.values, { unexpected: 'data' }); assert.ok(validateSection('hero', unknown).errors.unexpected);
  const bad = payload('gallery'); bad.values.items = []; assert.ok(validateSection('gallery', bad).errors.items);
  const long = payload('chairman'); long.values.message = 'x'.repeat(20001); assert.ok(validateSection('chairman', long).errors.message);
  const photo = payload('chairman'); photo.values.photo = 'data:image/svg+xml,<svg/>'; assert.ok(validateSection('chairman', photo).errors.photo);
  const version = payload('chairman'); version.version = -1; assert.ok(validateSection('chairman', version).errors.version);
  assert.ok(Object.keys(validateSection('hero', null).errors).length);
  const malformed = { ...payload('chairman'), translations: { header: ['only one language'] } }; assert.ok(validateSection('chairman', malformed).errors.translations);
});
test('section revisions survive edits and reject stale saves, overwrites and deletions', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(readFileSync(new URL('../db/migrations/0001_admin.sql', import.meta.url),'utf8'));
    db.exec(readFileSync(new URL('../db/migrations/0003_site_content.sql', import.meta.url),'utf8'));
    db.prepare('INSERT INTO admin_users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)').run('test-admin','test-admin','not-a-login','2026-10-22');
    const insert = db.prepare('INSERT INTO site_section_revisions (section_id, version, content_json, updated_by, updated_at) VALUES (?, ?, ?, ?, ?)');
    insert.run('hero',1,'{}','test-admin','2026-10-22');
    assert.throws(()=>insert.run('hero',1,'{}','test-admin','2026-10-22'), /Concurrent website change/);
    assert.throws(()=>insert.run('hero',3,'{}','test-admin','2026-10-22'), /Concurrent website change/);
    insert.run('hero',2,'{"title":"New title"}','test-admin','2026-10-22');
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM site_section_revisions').get()?.count, 2);
    assert.throws(()=>db.exec("UPDATE site_section_revisions SET content_json = '{}'"), /retained/);
    assert.throws(()=>db.exec('DELETE FROM site_section_revisions'), /retained/);
  } finally { db.close(); }
});
test('image signatures allow raster images and reject HTML/SVG uploads', () => {
  assert.equal(imageMime(Uint8Array.from([137,80,78,71,13,10,26,10])), 'image/png');
  assert.equal(imageMime(Uint8Array.from([255,216,255,224])), 'image/jpeg');
  assert.equal(imageMime(new TextEncoder().encode('RIFFabcdWEBP')), 'image/webp');
  for (const data of ['', '<svg xmlns="http://www.w3.org/2000/svg"/>', '<html>bad</html>']) assert.equal(imageMime(new TextEncoder().encode(data)), null);
});