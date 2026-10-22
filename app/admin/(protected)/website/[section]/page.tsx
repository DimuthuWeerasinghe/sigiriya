import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/admin/server';
import { isSectionId } from '@/lib/site/schema';
import { getWebsiteSection } from '@/lib/site/server';
import { WebsiteSectionEditor } from '@/components/admin/website-editor';
export default async function WebsiteSectionPage({ params }: { params: Promise<{ section: string }> }) {
  if (!await getSession(new Headers(await headers()))) redirect('/admin/login');
  const { section } = await params;
  if (!isSectionId(section)) notFound();
  return <WebsiteSectionEditor key={section} id={section} initial={await getWebsiteSection(section)}/>;
}