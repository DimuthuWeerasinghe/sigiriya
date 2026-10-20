/* eslint-disable @next/next/no-img-element */

import { Text } from '@/components/language-provider';
import Link from 'next/link';
import { notices } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

export default function NewsPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Official information" title="Notices and News">
        <p><Text>{"Latest dated council notices can be added here once approved text and publication dates are supplied."}</Text></p>
      </SubpageHero>
      <section className="section-shell media-list">
        {notices.map((notice) => (
          <Link href={`/news/${notice.slug}`} key={notice.slug}>
            {notice.image ? <img src={notice.image} alt="" /> : null}
            <div>
              <span><Text>{notice.date}</Text></span>
              <h2><Text>{notice.title}</Text></h2>
              <p><Text>{notice.summary}</Text></p>
            </div>
          </Link>
        ))}
      </section>
    </SubpageShell>
  );
}
