'use client';

import { useCallback, useContext, useEffect, useRef, useState, type FormEvent } from 'react';
import { Archive, ArrowLeft, Download, FileText, Inbox, MessageSquare, Plus, RefreshCw, Search, Send, Upload, X } from 'lucide-react';
import { AdminContext } from './admin-ui';
import { CONVERSATION_STATUSES, DOCUMENT_CATEGORIES, DOCUMENT_LANGUAGES, MAX_DOCUMENT_BYTES, PRIORITIES, validateDocument, validateReply } from '@/lib/workspace/validation';
import type { Conversation, DocumentRecord, ListPage, Thread } from '@/lib/workspace/types';

const date = (value: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' }).format(new Date(value));
const size = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
type Failure = { error?: string; fields?: Record<string, string> };

class ApiError extends Error { constructor(message: string, public fields: Record<string, string> = {}) { super(message); } }

function useAdminApi() {
  const { csrfToken } = useContext(AdminContext);
  return useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`/api/admin/${path}`, { ...options, cache: 'no-store', headers: { 'X-CSRF-Token': csrfToken, ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
    if (response.status === 401) { window.location.assign('/admin/login'); throw new ApiError('Please sign in again.'); }
    const result = await response.json() as T & Failure;
    if (!response.ok) throw new ApiError(result.error ?? 'The request could not be completed.', result.fields);
    return result;
  }, [csrfToken]);
}

function useAdminList<T>(path: string, params: URLSearchParams) {
  const api = useAdminApi();
  const query = params.toString();
  const [data, setData] = useState<ListPage<T>>({ items: [], page: 1, pageSize: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((value) => value + 1), []);
  useEffect(() => {
    let current = true; setLoading(true); setError('');
    void api<ListPage<T>>(`${path}?${query}`).then((value) => { if (current) setData(value); }).catch((failure) => { if (current) setError(failure instanceof Error ? failure.message : 'Could not load records.'); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [api, path, query, reload]);
  return { data, loading, error, refresh };
}

function Pagination({ data, setPage, disabled }: { data: { page: number; pageSize: number; total: number }; setPage: (page: number) => void; disabled: boolean }) {
  return <div className="admin-pagination"><span>{data.total} records</span><div><button type="button" disabled={disabled || data.page <= 1} onClick={() => setPage(data.page - 1)}>←</button><span>Page {data.page} / {Math.max(1, Math.ceil(data.total / data.pageSize))}</span><button type="button" disabled={disabled || data.page * data.pageSize >= data.total} onClick={() => setPage(data.page + 1)}>→</button></div></div>;
}

export function InboxManager() {
  const api = useAdminApi();
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ kind, search, page: String(page), ...(status === 'all' ? { includeArchived: '1' } : { status }) });
  const list = useAdminList<Conversation>('conversations', params);
  const [thread, setThread] = useState<Thread | null>(null);
  const [draftStatus, setDraftStatus] = useState('new');
  const [priority, setPriority] = useState('normal');
  const [reply, setReply] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const detailSequence = useRef(0);

  async function open(id: string) {
    const sequence = ++detailSequence.current;
    setLoadingThread(true); setError('');
    try {
      const result = await api<Thread>(`conversations/${id}`);
      if (sequence !== detailSequence.current) return;
      setThread(result); setDraftStatus(result.conversation.status); setPriority(result.conversation.priority);
    } catch (failure) { if (sequence === detailSequence.current) setError(failure instanceof Error ? failure.message : 'Could not open conversation.'); }
    finally { if (sequence === detailSequence.current) setLoadingThread(false); }
  }

  async function update(nextStatus = draftStatus) {
    if (!thread || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`conversations/${thread.conversation.id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus, priority, version: thread.conversation.version }) });
      await open(thread.conversation.id); list.refresh(); setNotice('Conversation status and priority saved.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save this conversation.'); }
    finally { setBusy(false); }
  }

  async function send(event: FormEvent) {
    event.preventDefault(); if (!thread || busy) return;
    const validated = validateReply({ message: reply });
    if (Object.keys(validated.errors).length) { setError(validated.errors.message); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`conversations/${thread.conversation.id}/messages`, { method: 'POST', body: JSON.stringify({ message: validated.body }) });
      setReply(''); await open(thread.conversation.id); list.refresh(); setNotice('Reply saved. The visitor can read it using their private tracking link.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save your reply.'); }
    finally { setBusy(false); }
  }

  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">PUBLIC CONVERSATIONS</p><h1>Enquiries & requests<span>.</span></h1><p className="admin-muted">Review messages, reply to visitors and follow each request.</p></div><button className="admin-button admin-button-secondary" type="button" disabled={list.loading} onClick={list.refresh}><RefreshCw size={15} />Refresh inbox</button></div>
    <form className="admin-panel admin-resource-filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput); list.refresh(); }}>
      <label className="admin-resource-search"><Search size={16} /><span className="admin-sr-only">Search inbox</span><input type="search" maxLength={100} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Reference, name, email or subject" /></label>
      <label><span className="admin-sr-only">Message type</span><select value={kind} onChange={(event) => { setPage(1); setKind(event.target.value); }}><option value="">All message types</option><option value="enquiry">Enquiries</option><option value="request">Requests</option></select></label>
      <label><span className="admin-sr-only">Status</span><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}><option value="">Active records</option><option value="all">All including archived</option>{CONVERSATION_STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
      <button className="admin-button admin-button-primary" type="submit" disabled={list.loading}>Search</button>
    </form>
    {(error || list.error) && <div className="admin-alert admin-alert-error" role="alert">{error || list.error}</div>}
    {notice && <div className="admin-alert admin-alert-success" role="status">{notice}</div>}
    <div className="admin-inbox-layout">
      <section className="admin-panel admin-inbox-list" aria-label="Saved enquiries and requests" aria-busy={list.loading}>
        <div className="admin-panel-heading"><h2>{list.loading ? 'Loading…' : `${list.data.total} conversations`}</h2><Inbox size={18} /></div>
        {!list.loading && !list.data.items.length && <div className="admin-resource-empty"><Inbox size={28} /><h3>No conversations found</h3><p>Messages submitted through the website appear here.</p></div>}
        {list.data.items.map((conversation) => <button className={`admin-inbox-item ${thread?.conversation.id === conversation.id ? 'selected' : ''}`} type="button" key={conversation.id} onClick={() => { setReply(''); setNotice(''); void open(conversation.id); }}>
          <span className="admin-inbox-item-top"><code>{conversation.reference}</code><span className={`admin-record-status ${conversation.status}`}>{conversation.status.replaceAll('_', ' ')}</span></span>
          <strong>{conversation.subject}</strong><span>{conversation.name} · {conversation.kind}</span><small>{date(conversation.updated_at)}<span><MessageSquare size={11} />{conversation.message_count}</span></small>
        </button>)}
        <Pagination data={list.data} setPage={setPage} disabled={list.loading} />
      </section>
      <section className="admin-panel admin-conversation-detail" aria-busy={loadingThread}>
        {loadingThread ? <div className="admin-resource-empty">Opening conversation…</div> : !thread ? <div className="admin-resource-empty"><MessageSquare size={34} /><h3>Select a conversation</h3><p>Read the message history, update its status and send a reply.</p></div> : <>
          <header className="admin-conversation-heading"><div><small>{thread.conversation.reference}</small><h2>{thread.conversation.subject}</h2><p>{thread.conversation.category} · {thread.conversation.kind}</p></div><button type="button" className="admin-refresh" aria-label="Refresh conversation" onClick={() => void open(thread.conversation.id)}><RefreshCw size={16} /></button></header>
          <div className="admin-contact-summary"><span><strong>From</strong>{thread.conversation.name}</span><span><strong>Email</strong>{thread.conversation.email}</span>{thread.conversation.phone && <span><strong>Phone</strong>{thread.conversation.phone}</span>}</div>
          <div className="admin-conversation-controls"><label>Status<select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)} disabled={busy}>{CONVERSATION_STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)} disabled={busy}>{PRIORITIES.map((value) => <option key={value}>{value}</option>)}</select></label><button className="admin-button admin-button-primary" type="button" disabled={busy} onClick={() => void update()}>Save changes</button>{thread.conversation.status !== 'archived' && <button className="admin-button admin-button-secondary" type="button" disabled={busy} onClick={() => void update('archived')}><Archive size={14} />Archive</button>}</div>
          <div className="admin-message-history">{thread.messages.map((message) => <article className={`admin-saved-message ${message.sender_type}`} key={message.id}><div><strong>{message.sender_type === 'admin' ? `${message.sender_name} · staff reply` : message.sender_name}</strong><time dateTime={message.created_at}>{date(message.created_at)}</time></div><p>{message.body}</p></article>)}</div>
          {['closed', 'archived'].includes(thread.conversation.status) ? <p className="admin-resource-note">This record is retained. Change its status to new or in progress before replying.</p> : <form className="admin-reply-editor" onSubmit={send}><label htmlFor="admin-reply">Reply to visitor</label><textarea id="admin-reply" rows={4} required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Your reply will appear in the visitor's private conversation." disabled={busy} /><div><small>Saved on the website. No email is sent.</small><button className="admin-button admin-button-primary" type="submit" disabled={busy}><Send size={14} />{busy ? 'Saving…' : 'Save reply'}</button></div></form>}
        </>}
      </section>
    </div>
  </>;
}

export function DocumentManager() {
  const api = useAdminApi();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const list = useAdminList<DocumentRecord>('documents', new URLSearchParams({ search, status, page: String(page) }));
  const [editor, setEditor] = useState<DocumentRecord | 'new' | null>(null);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = editor && editor !== 'new' ? editor : null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    const validated = validateDocument(Object.fromEntries(form));
    setFields(validated.errors); setError(''); setNotice('');
    if (Object.keys(validated.errors).length) return;
    if (!editing) {
      const file = form.get('file');
      if (!file || typeof file === 'string' || !file.size || file.size > MAX_DOCUMENT_BYTES || !/\.pdf$/i.test(file.name)) { setFields({ file: 'Choose a PDF file no larger than 5 MB.' }); return; }
    }
    setBusy(true);
    try {
      if (editing) await api(`documents/${editing.id}`, { method: 'PATCH', body: JSON.stringify({ ...validated.value, version: editing.version }) });
      else await api('documents', { method: 'POST', body: form });
      setEditor(null); list.refresh(); setNotice(editing ? 'Document details saved.' : 'PDF saved in the database. Published documents are available on the website.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save the document.'); if (failure instanceof ApiError) setFields(failure.fields); }
    finally { setBusy(false); }
  }

  async function archive(document: DocumentRecord) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const nextStatus = document.status === 'archived' ? 'draft' : 'archived';
      await api(`documents/${document.id}`, { method: 'PATCH', body: JSON.stringify({ ...document, status: nextStatus }) });
      setEditor(null); list.refresh(); setNotice(nextStatus === 'archived' ? 'Document archived. It is no longer publicly downloadable; its file is retained.' : 'Document restored as a draft. Edit it to publish.');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not change the document.'); }
    finally { setBusy(false); }
  }

  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">FORMS, REPORTS & PUBLICATIONS</p><h1>Documents<span>.</span></h1><p className="admin-muted">Upload PDFs, maintain their details and control public downloads.</p></div><button className="admin-button admin-button-primary" type="button" disabled={busy} onClick={() => { setEditor('new'); setFields({}); setError(''); }}><Plus size={16} />Upload PDF</button></div>
    {(error || list.error) && <div className="admin-alert admin-alert-error" role="alert">{error || list.error}</div>}
    {notice && <div className="admin-alert admin-alert-success" role="status">{notice}</div>}
    {editor && <section className="admin-panel admin-document-editor" key={editing?.id ?? 'new'}>
      <div className="admin-panel-heading"><div><h2>{editing ? 'Edit document details' : 'Upload a document'}</h2><p>{editing ? `${editing.filename} · ${size(editing.size_bytes)}` : 'PDF files up to 5 MB. Choose draft or published.'}</p></div><button type="button" className="admin-refresh" aria-label="Close document editor" onClick={() => setEditor(null)} disabled={busy}><X size={17} /></button></div>
      <form noValidate onSubmit={save} className="admin-document-form">
        <label className="admin-form-wide">Title<input name="title" required minLength={3} maxLength={160} defaultValue={editing?.title ?? ''} aria-invalid={!!fields.title} />{fields.title && <small className="admin-field-error">{fields.title}</small>}</label>
        <label>Category<select name="category" defaultValue={editing?.category ?? 'Application Forms'}>{DOCUMENT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select>{fields.category && <small className="admin-field-error">{fields.category}</small>}</label>
        <label>Language<select name="language" defaultValue={editing?.language ?? 'English'}>{DOCUMENT_LANGUAGES.map((value) => <option key={value}>{value}</option>)}</select>{fields.language && <small className="admin-field-error">{fields.language}</small>}</label>
        <label>Year<input name="year" type="number" min={1900} max={2100} defaultValue={editing?.year ?? Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Colombo' }).format(new Date()))} />{fields.year && <small className="admin-field-error">{fields.year}</small>}</label>
        <label>Publication status<select name="status" defaultValue={editing?.status ?? 'draft'}><option value="draft">Draft — staff only</option><option value="published">Published — public download</option>{editing && <option value="archived">Archived — retained</option>}</select>{fields.status && <small className="admin-field-error">{fields.status}</small>}</label>
        <label className="admin-form-wide">Description <small>(optional)</small><textarea name="description" rows={3} maxLength={2000} defaultValue={editing?.description ?? ''} />{fields.description && <small className="admin-field-error">{fields.description}</small>}</label>
        {!editing && <label className="admin-form-wide admin-file-upload"><Upload size={22} /><span>Choose PDF file</span><input name="file" type="file" accept="application/pdf,.pdf" required />{fields.file && <small className="admin-field-error">{fields.file}</small>}</label>}
        {editing && <p className="admin-resource-note admin-form-wide">The original PDF is retained. To publish a replacement file, upload it as a new document and archive this version.</p>}
        <div className="admin-editor-actions admin-form-wide"><button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={() => setEditor(null)}>Cancel</button><button className="admin-button admin-button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save document' : 'Upload document'}</button></div>
      </form>
    </section>}
    <form className="admin-panel admin-resource-filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput); list.refresh(); }}><label className="admin-resource-search"><Search size={16} /><span className="admin-sr-only">Search documents</span><input type="search" maxLength={100} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search title, category or language" /></label><label><span className="admin-sr-only">Publication status</span><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}><option value="">All publication statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label><button className="admin-button admin-button-secondary" type="submit" disabled={list.loading}>Search</button></form>
    <section className="admin-panel" aria-busy={list.loading}><div className="admin-panel-heading"><h2>{list.loading ? 'Loading…' : `${list.data.total} documents`}</h2><FileText size={18} /></div>
      {!list.loading && !list.data.items.length && <div className="admin-resource-empty"><FileText size={30} /><h3>No documents found</h3><p>Upload a PDF to start the document library.</p></div>}
      {list.data.items.map((document) => <article className="admin-document-item" key={document.id}><span className="admin-document-icon"><FileText size={22} />PDF</span><div><div className="admin-document-item-heading"><h3>{document.title}</h3><span className={`admin-record-status ${document.status}`}>{document.status}</span></div><p>{document.category} · {document.language} · {document.year} · {size(document.size_bytes)}</p><small>{document.filename} · {document.request_count} download requests</small></div><div className="admin-document-actions"><a className="admin-button admin-button-secondary" href={`/api/public/documents/${document.id}/download`} aria-label={`Download ${document.title}`}><Download size={14} /></a><button className="admin-button admin-button-secondary" type="button" disabled={busy} onClick={() => { setEditor(document); setFields({}); setError(''); }}>Edit</button><button className="admin-button admin-button-secondary" type="button" disabled={busy} onClick={() => void archive(document)}>{document.status === 'archived' ? <ArrowLeft size={14} /> : <Archive size={14} />}{document.status === 'archived' ? 'Restore draft' : 'Archive'}</button></div></article>)}
      <Pagination data={list.data} setPage={setPage} disabled={list.loading} />
    </section>
    <p className="admin-resource-note">PDF file bytes and document details are stored in the database. Archiving hides a document publicly while preserving its file and history.</p>
  </>;
}
