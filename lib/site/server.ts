import { env } from 'cloudflare:workers';
import { randomUUID } from 'node:crypto';
import { appendAudit, bindings, requestSource } from '@/lib/admin/server';
import type { AdminIdentity } from '@/lib/admin/types';
import { boundedBody, checkFields, HttpError, json, readJson } from '@/lib/http';
import { defaultSections, type SavedSection, type SectionId, type SiteSections, type Translations } from './defaults';
import { definition, imageMime, isSectionId, sectionIds, validateSection } from './schema';

type Revision = { section_id: SectionId; version: number; content_json: string; updated_at: string };
const currentSql = 'SELECT r.* FROM site_section_revisions r WHERE r.version = (SELECT MAX(s.version) FROM site_section_revisions s WHERE s.section_id = r.section_id)';
export async function getWebsiteContent(): Promise<{ sections: SiteSections; translations: Translations }> {
  const sections = structuredClone(defaultSections);
  const translations: Translations = Object.create(null);
  const { results } = await bindings().DB.prepare(currentSql).all<Revision>();
  for (const row of results) {
    if (!isSectionId(row.section_id)) continue;
    const saved = JSON.parse(row.content_json);
    const validated = validateSection(row.section_id, { ...saved, version: row.version });
    if (Object.keys(validated.errors).length) throw new Error(`Invalid saved website section: ${row.section_id}`);
    Object.assign(sections, { [row.section_id]: validated.values });
    Object.assign(translations, validated.translations);
  }
  return { sections, translations: { ...translations } };
}
export async function getWebsiteSection(id: SectionId): Promise<SavedSection> {
  const row = await bindings().DB.prepare('SELECT version, content_json, updated_at FROM site_section_revisions WHERE section_id = ? ORDER BY version DESC LIMIT 1').bind(id).first<Revision>();
  if (!row) return { values: structuredClone(defaultSections[id]), translations: {}, version: 0, updatedAt: null };
  return { ...JSON.parse(row.content_json), version: row.version, updatedAt: row.updated_at };
}
export async function listWebsiteSections() {
  const { results } = await bindings().DB.prepare(currentSql).all<Revision>();
  return sectionIds.map(id => {
    const row = results.find(value => value.section_id === id);
    const saved = row ? JSON.parse(row.content_json) : { values: defaultSections[id] };
    return { id, label: definition(id).label, visible: saved.values.visible, version: row?.version ?? 0, updatedAt: row?.updated_at ?? null };
  });
}
export async function handleWebsiteAdmin(request: Request, path: string, identity: AdminIdentity): Promise<Response | null> {
  if (path === 'website' && request.method === 'GET') return json({ sections: await listWebsiteSections() });
  if (path === 'website/media' && request.method === 'POST') return uploadImage(request, identity);
  const match = /^website\/([a-z]+)$/.exec(path);
  if (!match) return null;
  const id = match[1];
  if (!isSectionId(id)) throw new HttpError(404, 'Website section not found.');
  if (request.method === 'GET') return json(await getWebsiteSection(id));
  if (request.method !== 'PUT') throw new HttpError(405, 'Use GET or PUT for website sections.');
  const validated = validateSection(id, await readJson(request, 262144));
  checkFields(validated.errors);
  const previous = await getWebsiteSection(id);
  if (previous.version !== validated.version) throw new HttpError(409, 'Someone changed this section. Reload it before saving. Your draft is still in the editor.');
  const version = previous.version + 1;
  const now = new Date().toISOString();
  try {
    await appendAudit({ actorId: identity.id, username: identity.username, action: 'WEBSITE_UPDATED', outcome: 'success', summary: `Updated ${definition(id).label}, revision ${version}.`, source: requestSource(request.headers) }, [
      bindings().DB.prepare('INSERT INTO site_section_revisions (section_id, version, content_json, updated_by, updated_at) VALUES (?, ?, ?, ?, ?)').bind(id, version, JSON.stringify({ values: validated.values, translations: validated.translations }), identity.id, now),
    ]);
  } catch (error) {
    if (/Concurrent website change|UNIQUE constraint failed: site_section_revisions/.test(String(error))) throw new HttpError(409, 'Someone changed this section. Reload it before saving. Your draft is still in the editor.');
    throw error;
  }
  return json({ values: validated.values, translations: validated.translations, version, updatedAt: now });
}
function bucket(): R2Bucket {
  const storage = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!storage) throw new HttpError(503, 'Image storage is unavailable. Restart the local server after updating its bindings.');
  return storage;
}
async function uploadImage(request: Request, identity: AdminIdentity) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.startsWith('multipart/form-data;')) throw new HttpError(415, 'Choose an image file.');
  const bytes = await boundedBody(request, 2097152 + 65536);
  let form: FormData;
  try { form = await new Request(request.url, { method: 'POST', headers: { 'Content-Type': contentType }, body: bytes.buffer as ArrayBuffer }).formData(); }
  catch { throw new HttpError(400, 'The image upload could not be read.'); }
  const file = form.get('file');
  if (!file || typeof file === 'string') throw new HttpError(400, 'Choose a PNG, JPEG or WebP image.');
  const image = new Uint8Array(await file.arrayBuffer());
  const mime = imageMime(image);
  if (!image.length || image.length > 2097152 || !mime) throw new HttpError(400, 'Use a PNG, JPEG or WebP image up to 2 MB.');
  const id = randomUUID(); const storageKey = `website/${id}`;
  const filename = file.name.replace(/[\p{Cc}]/gu, '').slice(0, 160);
  await bucket().put(storageKey, image, { httpMetadata: { contentType: mime } });
  try {
    await appendAudit({ actorId: identity.id, username: identity.username, action: 'WEBSITE_IMAGE_UPLOADED', outcome: 'success', summary: `Uploaded website image ${id}.`, source: requestSource(request.headers) }, [
      bindings().DB.prepare('INSERT INTO site_media (id, storage_key, filename, mime_type, size_bytes, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, storageKey, filename, mime, image.length, identity.id, new Date().toISOString()),
    ]);
  } catch (error) { await bucket().delete(storageKey); throw error; }
  return json({ url: `/api/public/site-media/${id}` }, 201);
}
export async function serveWebsiteImage(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new HttpError(404, 'Image not found.');
  const row = await bindings().DB.prepare('SELECT storage_key, mime_type FROM site_media WHERE id = ?').bind(id).first<{ storage_key: string; mime_type: string }>();
  if (!row) throw new HttpError(404, 'Image not found.');
  const object = await bucket().get(row.storage_key);
  if (!object) throw new HttpError(404, 'Image not found.');
  return new Response(object.body, { headers: { 'Content-Type': row.mime_type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', ETag: object.httpEtag } });
}