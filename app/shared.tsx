import { LanguageSwitcher, Text } from '@/components/language-provider';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function SubpageShell({ children }: { children: ReactNode }) {
  return (
    <main>
      <header className="subpage-header">
        <Link className="brand compact-brand" href="/">
          <span className="mini-logo" aria-hidden="true">DPS</span>
          <span>
            <strong><Text>{"Dambulla Pradeshiya Sabha"}</Text></strong>
            <small><Text>{"Official Prototype"}</Text></small>
          </span>
        </Link>
        <LanguageSwitcher/>
        <nav aria-label="Section navigation">
          <Link href="/about"><Text>{"About"}</Text></Link>
          <Link href="/services"><Text>{"Services"}</Text></Link>
          <Link href="/news"><Text>{"News"}</Text></Link>
          <Link href="/downloads"><Text>{"Downloads"}</Text></Link>
          <Link href="/tourism"><Text>{"Tourism"}</Text></Link>
          <Link href="/contact"><Text>{"Contact"}</Text></Link>
          <Link href="/track">Track a request</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function SubpageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="subpage-hero section-shell">
      <p className="eyebrow"><Text>{eyebrow}</Text></p>
      <h1><Text>{title}</Text></h1>
      <div>{children}</div>
    </section>
  );
}

export function InfoBand({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="info-band section-shell" aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>
      <h2 id={`${title.toLowerCase().replaceAll(' ', '-')}-title`}><Text>{title}</Text></h2>
      <ul>
        {items.map((item) => (
          <li key={item}><Text>{item}</Text></li>
        ))}
      </ul>
    </section>
  );
}
