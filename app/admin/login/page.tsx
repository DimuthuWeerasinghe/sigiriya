import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/admin/server';
import { LoginForm } from '@/components/admin/admin-ui';

export default async function AdminLoginPage() {
  if (await getSession(new Headers(await headers()))) redirect('/admin');
  return <LoginForm />;
}
