import { Text } from '@/components/language-provider';
import Link from 'next/link';
import { services } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

export default function ServicesPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Public services" title="Council Services">
        <p><Text>{"Find the right service pathway before visiting or contacting the council office."}</Text></p>
      </SubpageHero>
      <section className="section-shell route-card-grid">
        {services.map((service) => (
          <Link href={`/services/${service.slug}`} key={service.slug}>
            <span><Text>{service.status}</Text></span>
            <h2><Text>{service.title}</Text></h2>
            <p><Text>{service.summary}</Text></p>
          </Link>
        ))}
      </section>
    </SubpageShell>
  );
}
