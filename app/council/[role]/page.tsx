import { notFound } from 'next/navigation';
import { WebsiteTranslations } from '@/components/language-provider';
import { OfficialMessage } from '@/components/site/official-message';
import { getWebsiteContent } from '@/lib/site/server';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  return { title: role === 'chairman' ? "Chairman's Message | Dambulla Pradeshiya Sabha" : "Secretary's Message | Dambulla Pradeshiya Sabha" };
}
export default async function OfficialMessagePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role !== 'chairman' && role !== 'secretary') notFound();
  const content = await getWebsiteContent();
  if (!content.sections[role].visible) notFound();
  return <WebsiteTranslations translations={content.translations}><OfficialMessage official={content.sections[role]}/></WebsiteTranslations>;
}