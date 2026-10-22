import HomePage from '@/components/site/home-page';
import { WebsiteTranslations } from '@/components/language-provider';
import { getWebsiteContent } from '@/lib/site/server';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const content = await getWebsiteContent();
  return <WebsiteTranslations translations={content.translations}><HomePage content={content.sections}/></WebsiteTranslations>;
}
