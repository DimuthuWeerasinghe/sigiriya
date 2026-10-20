import { Text } from '@/components/language-provider';
import Link from 'next/link';
import { services, tourismPlaces } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

const baseLinks = ['/about', '/services', '/news', '/downloads', '/tourism', '/gallery', '/contact', '/complaints', '/privacy', '/accessibility'];

export default function SitemapPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Sitemap" title="Site Index">
        <p><Text>{"All prototype sections and detail pages."}</Text></p>
      </SubpageHero>
      <section className="section-shell sitemap-list">
        {baseLinks.map((href) => <Link key={href} href={href}><Text>{href}</Text></Link>)}
        {services.map((service) => <Link key={service.slug} href={`/services/${service.slug}`}>/services/<Text>{service.slug}</Text></Link>)}
        {tourismPlaces.map((place) => <Link key={place.slug} href={`/tourism/${place.slug}`}>/tourism/<Text>{place.slug}</Text></Link>)}
      </section>
    </SubpageShell>
  );
}
