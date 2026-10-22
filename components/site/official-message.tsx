'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ArrowLeft, UserRound } from 'lucide-react';
import { Text, useLanguage } from '@/components/language-provider';
import { SubpageShell } from '@/app/shared';
import type { SiteSections } from '@/lib/site/defaults';
export function OfficialMessage({ official }: { official: SiteSections['chairman'] }) {
  const { t } = useLanguage();
  return <SubpageShell><article className="official-message-page section-shell">
    <div className="official-message-toolbar"><Link className="button light" href="/#council"><ArrowLeft size={17}/><Text>Back to council</Text></Link></div>
    <header className="official-message-heading"><h1><Text>{official.title}</Text></h1></header>
    <div className="official-message-photo" role={official.photo ? undefined : 'img'} aria-label={official.photo ? undefined : t('Official photograph')}>
      {official.photo ? <img src={official.photo} alt={official.name || t('Official photograph')}/> : <UserRound size={76} strokeWidth={1} aria-hidden="true"/>}
    </div>
    <section className="official-message-details" aria-label={t('Official details')}>
      {official.name && <p className="official-message-name"><Text>{official.name}</Text></p>}
      {official.role && <p><Text>{official.role}</Text></p>}
      {official.details && <p><Text>{official.details}</Text></p>}
    </section>
    <section className="official-message-body" aria-label={t('Official message')}>
      {official.message && <p><Text>{official.message}</Text></p>}
    </section>
  </article></SubpageShell>;
}