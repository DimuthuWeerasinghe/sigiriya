import { defaultSections, type SectionId, type Translations } from './defaults.ts';

export type Field = { key: string; label: string; kind: 'text' | 'textarea' | 'image' | 'link' | 'boolean' | 'list' | 'group' | 'select'; defaultValue: unknown; fields?: Field[]; choices?: string[] };
const labels: Partial<Record<SectionId, string>> = { header: 'Navigation & languages', hero: 'Hero', services: 'Public services', notices: 'Notices', heritage: 'Council heritage', chairman: "Chairman's message", secretary: "Secretary's message", council: 'Vision, mission & values', community: 'Community', culture: 'Culture & craft', tourism: 'Destinations', visitor: 'Visitor gateway', online: 'Online services', downloads: 'Documents section', gallery: 'Photo gallery', contact: 'Contact section', footer: 'Footer' };
export const sectionIds = Object.keys(defaultSections) as SectionId[];
export function isSectionId(value: string): value is SectionId { return Object.hasOwn(defaultSections, value); }
const titleCase = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, value => value.toUpperCase());
export function fieldsFor(values: Record<string, unknown>): Field[] {
  return Object.entries(values).map(([key, value]) => {
    const base = { key, label: key === 'href' ? 'Link destination' : titleCase(key), defaultValue: value };
    if (typeof value === 'boolean') return { ...base, kind: 'boolean' };
    if (Array.isArray(value)) return { ...base, kind: 'list', fields: fieldsFor(value[0] as Record<string, unknown>) };
    if (value && typeof value === 'object') return { ...base, kind: 'group', fields: fieldsFor(value as Record<string, unknown>) };
    if (key === 'side') return { ...base, kind: 'select', choices: ['left', 'right'] };
    if (/(image|photo)$/i.test(key)) return { ...base, kind: 'image' };
    if (/(href)$/i.test(key)) return { ...base, kind: 'link' };
    return { ...base, kind: /message|details|description|summary|vision|mission/i.test(key) ? 'textarea' : 'text' };
  });
}
export function definition(id: SectionId) {
  return { id, label: labels[id] ?? titleCase(id), fields: fieldsFor(defaultSections[id]), preview: ['chairman', 'secretary'].includes(id) ? `/council/${id}` : id === 'header' || id === 'hero' ? '/#home' : id === 'heritage' ? '/#council' : id === 'visitor' ? '/#visitor-gateway' : id === 'footer' ? '/#contact' : `/#${id}` };
}
export function safeDestination(value: string, image = false): boolean {
  if (!value) return true;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (!image && (/^#[a-zA-Z][\w-]*$/.test(value) || /^(mailto:[^\s@]+@[^\s@]+|tel:\+?[\d ()-]+)$/.test(value))) return true;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
export function validateSection(id: SectionId, input: unknown) {
  const errors: Record<string, string> = {};
  const record = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const version = record.version;
  if (!Number.isSafeInteger(version) || Number(version) < 0) errors.version = 'Refresh this section before saving.';
  function validate(fields: Field[], data: unknown, path = ''): Record<string, unknown> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) { errors[path || 'values'] = 'Enter section content.'; return {}; }
    const source = data as Record<string, unknown>;
    for (const key of Object.keys(source)) if (!fields.some(field => field.key === key)) errors[path + key] = 'Unknown field.';
    const result: Record<string, unknown> = {};
    for (const field of fields) {
      const value = source[field.key]; const key = path + field.key;
      if (field.kind === 'boolean') { if (typeof value !== 'boolean') errors[key] = 'Choose on or off.'; result[field.key] = value; }
      else if (field.kind === 'group') result[field.key] = validate(field.fields!, value, key + '.');
      else if (field.kind === 'list') {
        if (!Array.isArray(value) || value.length < 1 || value.length > 40) { errors[key] = 'Keep between 1 and 40 items.'; result[field.key] = []; }
        else result[field.key] = value.map((item, index) => validate(field.fields!, item, `${key}.${index}.`));
      } else {
        if (typeof value !== 'string' || value.length > (field.kind === 'textarea' ? 20000 : 1000) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) { errors[key] = 'Enter valid text within the field limit.'; result[field.key] = ''; continue; }
        if ((field.kind === 'image' || field.kind === 'link') && !safeDestination(value, field.kind === 'image')) errors[key] = 'Use a website path or an http/https URL.';
        if (field.kind === 'image' && field.key !== 'photo' && !value.trim()) errors[key] = 'Choose an image.';
        if (field.kind === 'link' && id !== 'online' && !value.trim()) errors[key] = 'Enter a link destination.';
        if (field.kind === 'select' && !field.choices!.includes(value)) errors[key] = 'Choose a valid layout.';
        if (['title', 'label', 'brand'].includes(field.key) && !value.trim()) errors[key] = 'Enter a title or label.';
        result[field.key] = value;
      }
    }
    return result;
  }
  const values = validate(definition(id).fields, record.values);
  const translations: Translations = Object.create(null);
  if (record.translations !== undefined) {
    const entries = record.translations && typeof record.translations === 'object' && !Array.isArray(record.translations) ? Object.entries(record.translations) : [];
    if (!record.translations || Array.isArray(record.translations) || typeof record.translations !== 'object' || entries.length > 500) errors.translations = 'Enter valid translations.';
    for (const [key, value] of entries) {
      if (!key || key.length > 20000 || ['__proto__', 'constructor', 'prototype'].includes(key) || !Array.isArray(value) || value.length !== 2 || value.some(item => typeof item !== 'string' || item.length > 20000 || /[\u0000-\u0008]/.test(item))) errors.translations = 'Enter valid Sinhala and Tamil text.';
      else translations[key] = value as [string, string];
    }
  }
  return { values, translations, version: Number(version), errors };
}
export function imageMime(bytes: Uint8Array): string | null {
  if ([137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)) return 'image/png';
  if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  if (new TextDecoder().decode(bytes.slice(0,4))==='RIFF' && new TextDecoder().decode(bytes.slice(8,12))==='WEBP') return 'image/webp';
  return null;
}