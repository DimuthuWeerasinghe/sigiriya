import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/admin/admin-ui';
import { getOverview, getSession } from '@/lib/admin/server';

export default async function AdminDashboardPage() {
  // Authorize the data read here too: layouts may run in parallel with pages.
  if (!await getSession(new Headers(await headers()))) redirect('/admin/login');
  return <Dashboard overview={await getOverview()} />;
}
