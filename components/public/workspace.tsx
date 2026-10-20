'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Copy, Download, FileText, MessageSquare, Search, Send, ShieldCheck } from 'lucide-react';
import { DOCUMENT_CATEGORIES, REQUEST_CATEGORIES, validateReply, validateSubmission, validateTracking, type ConversationKind } from '@/lib/workspace/validation';
import type { DocumentRecord, ListPage, Thread } from '@/lib/workspace/types';
import './workspace.css';

type ApiError = { error?: string; fields?: Record<string, string> };
const date = (value: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' }).format(new Date(value));
export const fileSize = (size: number) => size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.ceil(size / 1024))} KB`;

export function SubmissionForm({ kind }: { kind: ConversationKind }) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<{ reference: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const input = Object.fromEntries(new FormData(event.currentTarget));
    const validated = validateSubmission(input); setFields(validated.errors); setError('');
    if (Object.keys(validated.errors).length) return;
    setPending(true);
    try {
      const response = await fetch(`/api/public/${kind === 'enquiry' ? 'enquiries' : 'requests'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validated.value) });
      const result = await response.json() as ApiError & { reference: string; token: string };
      if (!response.ok) { setError(result.error ?? 'Your message could not be saved.'); setFields(result.fields ?? {}); return; }
      setSaved({ reference: result.reference, token: result.token });
    } catch { setError('Could not connect. Please try again.'); }
    finally { setPending(false); }
  }
  if (saved) {
    const href = `/track?reference=${encodeURIComponent(saved.reference)}#access=${saved.token}`;
    return <section className="public-workspace public-confirmation" aria-live="polite">
      <CheckCircle2 size={34} /><h2>{kind === 'enquiry' ? 'Your enquiry is saved.' : 'Your request is saved.'}</h2>
      <p>Keep these details. You can use them to view the status, read staff replies and add a follow-up message.</p>
      <dl><dt>Reference number</dt><dd><strong>{saved.reference}</strong></dd><dt>Private access code</dt><dd><code>{saved.token}</code></dd></dl>
      <p className="public-small"><ShieldCheck size={15} />Your access code opens your conversation. Keep it private.</p>
      <div className="public-actions"><Link className="button primary" href={href}>View replies & status</Link><button type="button" className="button light" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}${href}`); setCopied(true); } catch { setError('Copy the reference and access code shown above.'); } }}><Copy size={15} />{copied ? 'Private link copied' : 'Copy private link'}</button></div>
      {error && <p role="alert" className="public-form-error">{error}</p>}
    </section>;
  }
  return <form className="public-workspace public-message-form" noValidate onSubmit={submit}>
    <div className="public-form-heading"><MessageSquare size={22} /><div><h2>{kind === 'enquiry' ? 'Send an enquiry' : 'Submit a request'}</h2><p>All fields marked * are required.</p></div></div>
    {error && <p role="alert" className="public-form-error">{error}</p>}
    <div className="public-form-grid">
      <label>Full name *<input name="name" autoComplete="name" required minLength={2} maxLength={100} aria-invalid={!!fields.name} aria-describedby={fields.name ? 'submission-name-error' : undefined} />{fields.name && <small id="submission-name-error" className="public-field-error">{fields.name}</small>}</label>
      <label>Email address *<input name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={!!fields.email} aria-describedby={fields.email ? 'submission-email-error' : undefined} />{fields.email && <small id="submission-email-error" className="public-field-error">{fields.email}</small>}</label>
      <label>Phone number <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={25} aria-invalid={!!fields.phone} />{fields.phone && <small className="public-field-error">{fields.phone}</small>}</label>
      <label>Category *<select name="category" defaultValue="General">{REQUEST_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>{fields.category && <small className="public-field-error">{fields.category}</small>}</label>
    </div>
    <label>Subject *<input name="subject" required minLength={3} maxLength={160} aria-invalid={!!fields.subject} />{fields.subject && <small className="public-field-error">{fields.subject}</small>}</label>
    <label>{kind === 'enquiry' ? 'Your message' : 'Request details'} *<textarea name="message" required minLength={10} maxLength={5000} rows={6} aria-invalid={!!fields.message} placeholder="Include the information the council needs to help you." />{fields.message && <small className="public-field-error">{fields.message}</small>}</label>
    <p className="public-small">Your contact details and messages will be saved for authorized staff to review. Replies are available through your private tracking link. <Link href="/privacy">Privacy information</Link></p>
    <button className="button primary" type="submit" disabled={pending}><Send size={16} />{pending ? 'Saving…' : kind === 'enquiry' ? 'Send enquiry' : 'Submit request'}</button>
    <Link className="public-existing-link" href="/track">Already submitted? View your conversation →</Link>
  </form>;
}

export function ConversationTracker() {
  const [reference, setReference] = useState('');
  const [token, setToken] = useState('');
  const [thread, setThread] = useState<Thread | null>(null);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  useEffect(() => {
    setReference(new URLSearchParams(window.location.search).get('reference') ?? '');
    setToken(new URLSearchParams(window.location.hash.slice(1)).get('access') ?? '');
  }, []);
  async function load(reply = false) {
    if (pending) return;
    const validated = validateTracking({ reference, token });
    const replyValidation = validateReply({ message });
    const errors = { ...validated.errors, ...(reply ? replyValidation.errors : {}) };
    setFields(errors); setError(''); setNotice('');
    if (Object.keys(errors).length) return;
    setPending(true);
    try {
      const response = await fetch(`/api/public/${reply ? 'reply' : 'track'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: validated.reference, token: validated.token, ...(reply ? { message: replyValidation.body } : {}) }) });
      const result = await response.json() as Thread & ApiError;
      if (!response.ok) { setError(result.error ?? 'Could not open your conversation.'); setFields(result.fields ?? {}); return; }
      setThread(result);
      if (reply) { setMessage(''); setNotice('Your follow-up message has been saved.'); }
    } catch { setError('Could not connect. Please try again.'); }
    finally { setPending(false); }
  }
  return <div className="public-workspace public-tracker">
    <form className="public-tracking-form" noValidate onSubmit={(event) => { event.preventDefault(); void load(); }}>
      <label>Reference number<input required value={reference} maxLength={16} onChange={(event) => { setReference(event.target.value); setThread(null); }} placeholder="REQ-0123456789AB" />{fields.reference && <small className="public-field-error">{fields.reference}</small>}</label>
      <label>Private access code<input required type="password" autoComplete="off" value={token} maxLength={64} onChange={(event) => { setToken(event.target.value); setThread(null); }} />{fields.token && <small className="public-field-error">{fields.token}</small>}</label>
      <button type="submit" className="button primary" disabled={pending}><Search size={16} />{pending ? 'Loading…' : 'View conversation'}</button>
    </form>
    {error && <p role="alert" className="public-form-error">{error}</p>}
    {notice && <p role="status" className="public-form-success">{notice}</p>}
    {thread && <section className="public-thread">
      <header><div><small>{thread.conversation.reference}</small><h2>{thread.conversation.subject}</h2></div><span className="public-status">{thread.conversation.status.replaceAll('_', ' ')}</span></header>
      <div className="public-thread-messages">{thread.messages.map((entry) => <article key={entry.id} className={`public-message ${entry.sender_type}`}><div><strong>{entry.sender_type === 'admin' ? 'Council staff' : 'You'}</strong><time dateTime={entry.created_at}>{date(entry.created_at)}</time></div><p>{entry.body}</p></article>)}</div>
      {!['closed', 'archived'].includes(thread.conversation.status) ? <form className="public-reply-form" onSubmit={(event) => { event.preventDefault(); void load(true); }}>
        <label>Add a follow-up message<textarea rows={4} required maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} />{fields.message && <small className="public-field-error">{fields.message}</small>}</label>
        <button type="submit" className="button primary" disabled={pending}><Send size={16} />{pending ? 'Saving…' : 'Send follow-up'}</button>
      </form> : <p className="public-small">This conversation is closed. You can still read its history, or <Link href="/contact">send a new enquiry</Link>.</p>}
    </section>}
  </div>;
}

export function PublicDocuments() {
  const [data, setData] = useState<ListPage<DocumentRecord> | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    void fetch(`/api/public/documents?${new URLSearchParams({ search, category, page: String(page) })}`, { signal: controller.signal, cache: 'no-store' }).then(async (response) => {
      const result = await response.json() as ListPage<DocumentRecord> & ApiError;
      if (!response.ok) throw new Error(result.error ?? 'Documents could not be loaded.');
      setData(result);
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Documents could not be loaded.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, category, page, refresh]);
  return <div className="public-workspace public-document-library">
    <form className="public-document-filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput); setRefresh((value) => value + 1); }}>
      <label><span>Search documents</span><input type="search" value={searchInput} maxLength={100} onChange={(event) => setSearchInput(event.target.value)} placeholder="Title, category or language" /></label>
      <label><span>Category</span><select value={category} onChange={(event) => { setPage(1); setCategory(event.target.value); }}><option value="">All categories</option>{DOCUMENT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <button className="button light" type="submit" disabled={loading}><Search size={16} />Search</button>
    </form>
    {error && <p role="alert" className="public-form-error">{error}</p>}
    {loading && <p role="status" className="public-small">Loading published documents…</p>}
    {!loading && !error && data && !data.items.length && <div className="public-doc-empty"><FileText size={30} /><h3>{search || category ? 'No matching documents' : 'No documents published yet'}</h3><p>{search || category ? 'Try another search or category.' : 'Council staff will publish downloadable files here.'}</p></div>}
    <div className="public-documents" aria-busy={loading}>{data?.items.map((document) => <article key={document.id} className="public-document-card"><span className="public-pdf-icon"><FileText size={23} />PDF</span><div><h3>{document.title}</h3>{document.description && <p>{document.description}</p>}<small>{document.category} · {document.language} · {document.year} · {fileSize(document.size_bytes)}</small></div><a className="button light" href={`/api/public/documents/${document.id}/download`}><Download size={15} />Download</a></article>)}</div>
    {data && data.total > data.pageSize && <div className="public-document-pagination"><button className="button light" type="button" disabled={loading || data.page <= 1} onClick={() => setPage(data.page - 1)}>Previous</button><span>Page {data.page} of {Math.ceil(data.total / data.pageSize)}</span><button className="button light" type="button" disabled={loading || data.page * data.pageSize >= data.total} onClick={() => setPage(data.page + 1)}>Next</button></div>}
  </div>;
}
