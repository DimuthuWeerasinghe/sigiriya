/* eslint-disable @next/next/no-img-element */

import { Text } from '@/components/language-provider';
import { notFound } from 'next/navigation';
import { notices } from '../../site-data';
import { SubpageHero, SubpageShell } from '../../shared';

export function generateStaticParams() {
  return notices.map((notice) => ({ slug: notice.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const notice = notices.find((item) => item.slug === params.slug);
  return {
    title: notice ? `${notice.title} | Dambulla Pradeshiya Sabha` : 'News',
    description: notice?.summary,
    openGraph: notice?.image ? { images: [notice.image] } : undefined,
  };
}

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const notice = notices.find((item) => item.slug === params.slug);
  if (!notice) notFound();

  return (
    <SubpageShell>
      <SubpageHero eyebrow={notice.date} title={notice.title}>
        <p><Text>{notice.summary}</Text></p>
      </SubpageHero>
      {notice.image ? (
        <section className="section-shell detail-image">
          <img src={notice.image} alt="" />
        </section>
      ) : null}
    </SubpageShell>
  );
}
