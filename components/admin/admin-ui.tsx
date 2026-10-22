'use client';

import { useState, createContext, useContext, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, Eye, EyeOff, Fingerprint, LayoutDashboard, LockKeyhole, LogOut, RefreshCw, Search, ShieldCheck, ShieldAlert, Activity, ArrowRight, CircleCheck, Clock3 } from 'lucide-react';
import type { AuditEntry, AuditPage, Overview } from '@/lib/admin/types';
import { AUDIT_ACTIONS, validateLogin } from '@/lib/admin/validation';

export const AdminContext = createContext({ csrfToken: '' });
const actionNames: Record<string, string> = {
  ACCOUNT_CREATED: 'Account created', LOGIN_SUCCEEDED: 'Signed in', LOGIN_FAILED: 'Sign-in failed',
  LOGIN_BLOCKED: 'Sign-in limited', LOGOUT: 'Signed out', SESSION_EXPIRED: 'Session expired',
  AUDIT_VIEWED: 'Activity log viewed', AUDIT_VERIFIED: 'Integrity checked', AUDIT_CHANGE_BLOCKED: 'Log change blocked',
  ACCOUNT_CREDENTIALS_CHANGED: 'Credentials changed', ENQUIRY_CREATED: 'Enquiry received', REQUEST_CREATED: 'Request received',
  INBOX_VIEWED: 'Inbox viewed', CONVERSATION_VIEWED: 'Conversation opened', CONVERSATION_UPDATED: 'Conversation updated',
  CONVERSATION_ARCHIVED: 'Conversation archived', CONVERSATION_RESTORED: 'Conversation restored', ADMIN_REPLIED: 'Staff replied',
  VISITOR_REPLIED: 'Visitor replied', DOCUMENT_UPLOADED: 'PDF uploaded', DOCUMENT_UPDATED: 'Document updated',
  DOCUMENT_PUBLISHED: 'Document published', DOCUMENT_ARCHIVED: 'Document archived', DOCUMENT_RESTORED: 'Document restored',
  DOCUMENT_DOWNLOADED: 'Download requested', DOCUMENTS_VIEWED: 'Document manager viewed',
  WEBSITE_UPDATED: 'Website section updated', WEBSITE_IMAGE_UPLOADED: 'Website image uploaded',
};
function formatDate(value: string) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' }).format(new Date(value)); }

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const validated = validateLogin({ username, password });
    setFields(validated.errors);
    setError('');
    if (Object.keys(validated.errors).length) return;
    setPending(true);
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: validated.username, password }) });
      const result = await response.json() as { error: string; fields?: Record<string, string> };
      if (!response.ok) { setError(result.error); setFields(result.fields ?? {}); return; }
      setPassword('');
      router.replace('/admin');
      router.refresh();
    } catch { setError('Could not connect. Check your connection and try again.'); }
    finally { setPending(false); }
  }

  return <main className="admin-login">
    <section className="admin-login-story">
      <Link href="/" className="admin-wordmark"><span className="admin-emblem">DPS</span><span>Dambulla<br /><strong>Pradeshiya Sabha</strong></span></Link>
      <div className="admin-login-story-content">
        <span className="admin-eyebrow"><span /> ADMINISTRATION PORTAL</span>
        <h1>Good governance<br />starts with<br /><em>accountability.</em></h1>
        <p>A secure workspace for the people behind Dambulla’s public services.</p>
        <div className="admin-story-rule" />
        <div className="admin-story-feature"><ShieldCheck size={22} /><span>Protected access.<br /><strong>A permanent record of every sign-in.</strong></span></div>
      </div>
      <p className="admin-story-foot">DAMBULLA · SRI LANKA <span>01 / ADMIN ACCESS</span></p>
    </section>
    <section className="admin-login-form-area">
      <Link href="/" className="admin-back-link"><ArrowLeft size={16} /> Back to website</Link>
      <div className="admin-login-card">
        <div className="admin-login-lock"><LockKeyhole size={26} strokeWidth={1.6} /></div>
        <p className="admin-eyebrow">AUTHORIZED PERSONNEL ONLY</p>
        <h2>Welcome back.</h2>
        <p className="admin-muted">Sign in with your administrator credentials.</p>
        <form onSubmit={submit} noValidate className="admin-login-form">
          {error && <div className="admin-alert admin-alert-error" role="alert"><ShieldAlert size={18} /><span>{error}</span></div>}
          <label htmlFor="admin-username">Username</label>
          <input id="admin-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={32} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" aria-invalid={!!fields.username} aria-describedby={fields.username ? 'username-error' : undefined} disabled={pending} />
          {fields.username && <p className="admin-field-error" id="username-error">{fields.username}</p>}
          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-input"><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" aria-invalid={!!fields.password} aria-describedby={fields.password ? 'password-error' : undefined} disabled={pending} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {fields.password && <p className="admin-field-error" id="password-error">{fields.password}</p>}
          <button className="admin-button admin-button-primary admin-login-submit" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in securely'}<ArrowRight size={18} /></button>
        </form>
        <p className="admin-login-notice"><LockKeyhole size={14} /> Access attempts are recorded in the activity log.</p>
      </div>
      <p className="admin-login-bottom">Dambulla Pradeshiya Sabha <span>Secure administration</span></p>
    </section>
  </main>;
}

export function AdminShell({ username, csrfToken, children }: { username: string; csrfToken: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } });
      if (!response.ok && response.status !== 401) throw new Error('Sign-out failed. Try again.');
      router.replace('/admin/login');
      router.refresh();
    } catch { setError('Could not sign out. Please try again.'); }
    finally { setPending(false); }
  }
  return <AdminContext.Provider value={{ csrfToken }}><div className="admin-workspace">
    <aside className="admin-sidebar">
      <Link className="admin-wordmark" href="/admin" prefetch={false}><span className="admin-emblem">DPS</span><span>Dambulla<br /><strong>Administration</strong></span></Link>
      <p className="admin-sidebar-label">WORKSPACE</p>
      <nav aria-label="Admin navigation">
        <Link href="/admin" prefetch={false} className={pathname === '/admin' ? 'active' : ''} aria-current={pathname === '/admin' ? 'page' : undefined}><LayoutDashboard size={18} />Overview</Link>
        <Link href="/admin/website" prefetch={false} className={pathname.startsWith('/admin/website') ? 'active' : ''}><LayoutDashboard size={18} />Website sections</Link>
        <Link href="/admin/inbox" prefetch={false} className={pathname === '/admin/inbox' ? 'active' : ''} aria-current={pathname === '/admin/inbox' ? 'page' : undefined}><Activity size={18} />Enquiries & requests</Link>
        <Link href="/admin/documents" prefetch={false} className={pathname === '/admin/documents' ? 'active' : ''} aria-current={pathname === '/admin/documents' ? 'page' : undefined}><LayoutDashboard size={18} />Documents</Link>
        <Link href="/admin/activity" prefetch={false} className={pathname === '/admin/activity' ? 'active' : ''} aria-current={pathname === '/admin/activity' ? 'page' : undefined}><Activity size={18} />Activity log<LockKeyhole size={13} className="admin-nav-lock" /></Link>
      </nav>
      <div className="admin-sidebar-bottom">
        <div className="admin-retention-note"><ShieldCheck size={21} /><strong>Accountability, always.</strong><p>Activity records are permanent and read-only for every administrator.</p></div>
        <Link className="admin-site-link" href="/">View public website<ArrowUpRight size={16} /></Link>
        <div className="admin-profile"><span>{username.slice(0, 2).toUpperCase()}</span><div><strong>{username}</strong><small>Administrator</small></div><button onClick={logout} type="button" title="Sign out" aria-label="Sign out" disabled={pending}><LogOut size={18} /></button></div>
        {error && <p className="admin-field-error" role="alert">{error}</p>}
      </div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><span>Administration <span className="admin-breadcrumb">/ {pathname.startsWith('/admin/website') ? 'Website sections' : pathname === '/admin/activity' ? 'Activity log' : pathname === '/admin/inbox' ? 'Enquiries & requests' : pathname === '/admin/documents' ? 'Documents' : 'Overview'}</span></span><span className="admin-secure-status"><span />Secure session</span></header>
      <div className="admin-content">{children}</div>
      <footer className="admin-workspace-footer"><span>Dambulla Pradeshiya Sabha</span><span><LockKeyhole size={12} /> Restricted administrator access</span></footer>
    </div>
  </div></AdminContext.Provider>;
}

function ActivityTable({ entries, compact = false }: { entries: AuditEntry[]; compact?: boolean }) {
  return <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Activity</th><th>Administrator</th><th>Date & time <small>(Sri Lanka)</small></th><th>Result</th>{!compact && <th>Record</th>}</tr></thead><tbody>
    {entries.map((entry) => <tr key={entry.id}><td><span className={`admin-event-icon ${entry.outcome}`}><Activity size={16} /></span><div><strong>{actionNames[entry.action] ?? entry.action}</strong><small>{entry.summary}</small></div></td><td><span className="admin-user-dot" />{entry.username}</td><td><time dateTime={entry.occurred_at}>{formatDate(entry.occurred_at)}</time></td><td><span className={`admin-badge ${entry.outcome}`}>{entry.outcome === 'success' ? <Check size={12} /> : <ShieldAlert size={12} />}{entry.outcome}</span></td>{!compact && <td><code title={entry.entry_hash}>#{String(entry.id).padStart(4, '0')}</code></td>}</tr>)}
    {!entries.length && <tr><td colSpan={compact ? 4 : 5} className="admin-empty"><Search size={25} /><strong>No matching activity</strong><span>Try another search or clear your filters.</span></td></tr>}
  </tbody></table></div>;
}

export function Dashboard({ overview }: { overview: Overview }) {
  const metrics = [
    { label: 'Total activities', value: overview.totalEvents, detail: 'Permanent records', icon: Activity, theme: 'orange' },
    { label: 'Successful sign-ins', value: overview.successfulLogins, detail: 'In the last 24 hours', icon: CircleCheck, theme: 'green' },
    { label: 'Failed / blocked sign-ins', value: overview.failedLogins, detail: 'In the last 24 hours', icon: ShieldAlert, theme: 'amber' },
    { label: 'Active sessions', value: overview.activeSessions, detail: 'Across administrator accounts', icon: Fingerprint, theme: 'brown' },
  ];
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">YOUR WORKSPACE AT A GLANCE</p><h1>Overview<span>.</span></h1><p className="admin-muted">A clear view of access, activity and accountability.</p></div><Link className="admin-button admin-button-secondary" href="/admin/activity" prefetch={false}>View activity log<ArrowUpRight size={16} /></Link></div>
    <section className="admin-metrics" aria-label="Administration statistics">{metrics.map(({ label, value, detail, icon: Icon, theme }) => <article className="admin-metric" key={label}><div><span>{label}</span><span className={`admin-metric-icon ${theme}`}><Icon size={18} /></span></div><strong>{value.toLocaleString()}</strong><small>{detail}</small></article>)}</section>
    <section className="admin-resource-cards" aria-label="Saved website records">
      <Link href="/admin/inbox" prefetch={false}><span>Enquiries & requests</span><strong>{overview.enquiries + overview.requests}</strong><small>{overview.openConversations} awaiting attention · Open inbox <ArrowRight size={14} /></small></Link>
      <Link href="/admin/documents" prefetch={false}><span>Document library</span><strong>{overview.documents}</strong><small>{overview.publishedDocuments} published · Manage PDFs <ArrowRight size={14} /></small></Link>
    </section>
    <section className="admin-panel admin-permanent-banner"><span className="admin-banner-icon"><ShieldCheck size={27} /></span><div><p className="admin-eyebrow">BUILT FOR ACCOUNTABILITY</p><h2>Every action leaves a record.</h2><p>Sign-ins, failed attempts and log access are recorded automatically. Administrators cannot edit or delete activity records.</p></div><span className="admin-permanent-pill"><LockKeyhole size={13} />Read-only history</span></section>
    <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Recent activity</h2><p>The latest events across your administration panel.</p></div><Link href="/admin/activity" prefetch={false}>View all<ArrowRight size={16} /></Link></div><ActivityTable entries={overview.recent} compact /></section>
    <div className="admin-security-foot"><Clock3 size={15} /><span>Sessions end after 30 minutes of inactivity, with an 8-hour maximum.</span></div>
  </>;
}

export function ActivityLog({ initial }: { initial: AuditPage }) {
  const router = useRouter();
  const { csrfToken } = useContext(AdminContext);
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [outcome, setOutcome] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [verification, setVerification] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function load(page = 1) {
    setPending(true); setError('');
    try {
      const params = new URLSearchParams({ search, action, outcome, page: String(page) });
      const response = await fetch(`/api/admin/activity?${params}`, { cache: 'no-store' });
      const result = await response.json() as AuditPage & { error: string };
      if (response.status === 401) { router.replace('/admin/login'); return; }
      if (!response.ok) { setError(result.error); return; }
      setData(result);
    } catch { setError('Could not load activity. Please try again.'); }
    finally { setPending(false); }
  }

  async function verify() {
    setVerifying(true); setVerification(''); setError('');
    try {
      const response = await fetch('/api/admin/activity/verify', { method: 'POST', headers: { 'X-CSRF-Token': csrfToken } });
      const result = await response.json() as { valid: boolean; checked: number; failedAt?: number; error: string };
      if (response.status === 401) { router.replace('/admin/login'); return; }
      if (!response.ok) { setError(result.error); return; }
      if (result.valid) setVerification(`Integrity verified for ${result.checked} records. All signatures and links match.`);
      else { setError(`Integrity check failed at record #${result.failedAt}. Contact the system owner.`); return; }
      await load(data.page);
    } catch { setError('Could not verify the activity log. Please try again.'); }
    finally { setVerifying(false); }
  }

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">A PERMANENT RECORD</p><h1>Activity log<span>.</span></h1><p className="admin-muted">Who did what, and when. Every record stays.</p></div><button className="admin-button admin-button-secondary" type="button" disabled={verifying || pending} onClick={verify}><ShieldCheck size={17} />{verifying ? 'Verifying…' : 'Verify integrity'}</button></div>
    <div className="admin-readonly-note"><LockKeyhole size={18} /><span><strong>Protected history.</strong> Records cannot be edited or deleted, including by administrators.</span><span className="admin-log-count">{data.total.toLocaleString()} records</span></div>
    {error && <div className="admin-alert admin-alert-error" role="alert"><ShieldAlert size={18} />{error}</div>}
    {verification && <div className="admin-alert admin-alert-success" role="status"><ShieldCheck size={18} />{verification}</div>}
    <section className="admin-panel admin-log-panel">
      <form className="admin-log-filters" onSubmit={(event) => { event.preventDefault(); void load(); }}>
        <div className="admin-search-field"><Search size={17} /><label className="admin-sr-only" htmlFor="audit-search">Search activity</label><input id="audit-search" type="search" maxLength={100} placeholder="Search activity or username…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <label className="admin-sr-only" htmlFor="audit-action">Activity type</label><select id="audit-action" value={action} onChange={(event) => setAction(event.target.value)}><option value="">All activity types</option>{AUDIT_ACTIONS.filter((name) => !name.startsWith('PASSWORD')).map((name) => <option key={name} value={name}>{actionNames[name] ?? name}</option>)}</select>
        <label className="admin-sr-only" htmlFor="audit-outcome">Result</label><select id="audit-outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)}><option value="">All results</option><option value="success">Success</option><option value="failure">Failure</option><option value="blocked">Blocked</option></select>
        <button className="admin-button admin-button-primary" type="submit" disabled={pending}>{pending ? 'Loading…' : 'Apply filters'}</button>
        <button className="admin-refresh" type="button" onClick={() => void load(data.page)} disabled={pending} aria-label="Refresh activity"><RefreshCw size={17} /></button>
      </form>
      <div aria-busy={pending}><ActivityTable entries={data.entries} /></div>
      <div className="admin-pagination"><span>{data.total ? `${(data.page - 1) * data.pageSize + 1}–${Math.min(data.page * data.pageSize, data.total)} of ${data.total} records` : '0 records'}</span><div><button aria-label="Previous page" type="button" disabled={data.page <= 1 || pending} onClick={() => void load(data.page - 1)}><ChevronLeft size={17} /></button><span>Page {data.page} of {pages}</span><button aria-label="Next page" type="button" disabled={data.page >= pages || pending} onClick={() => void load(data.page + 1)}><ChevronRight size={17} /></button></div></div>
    </section>
    <div className="admin-security-foot"><Fingerprint size={15} /><span>Each record is signed and linked to the previous record. Times are shown in Sri Lanka Standard Time.</span></div>
  </>;
}
