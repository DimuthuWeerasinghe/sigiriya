import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/admin/server';
import { AdminShell } from '@/components/admin/admin-ui';

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const identity = await getSession(new Headers(await headers()));
  if (!identity) redirect('/admin/login');
  return <AdminShell username={identity.username} csrfToken={identity.csrfToken}>{children}</AdminShell>;
}
