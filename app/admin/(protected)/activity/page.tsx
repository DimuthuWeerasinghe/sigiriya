import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ActivityLog } from '@/components/admin/admin-ui';
import { appendAudit, getAuditPage, getSession, requestSource } from '@/lib/admin/server';

export default async function AdminActivityPage() {
  const requestHeaders = new Headers(await headers());
  const identity = await getSession(requestHeaders);
  if (!identity) redirect('/admin/login');
  await appendAudit({ actorId: identity.id, username: identity.username, action: 'AUDIT_VIEWED', outcome: 'success', summary: 'Opened the activity log.', source: requestSource(requestHeaders) });
  return <ActivityLog initial={await getAuditPage({ search: '', action: '', outcome: '', page: 1 })} />;
}
