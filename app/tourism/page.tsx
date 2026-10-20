/* eslint-disable @next/next/no-img-element */

import { Text } from '@/components/language-provider';
import Link from 'next/link';
import { tourismPlaces } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

export default function TourismPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Explore Dambulla" title="Heritage and Visitor Places">
        <p><Text>{"Discover places named in the source material, with operational details reserved for official review."}</Text></p>
      </SubpageHero>
      <section className="section-shell route-card-grid image-cards">
        {tourismPlaces.map((place) => (
          <Link href={`/tourism/${place.slug}`} key={place.slug}>
            <img src={place.image} alt="" />
            <span><Text>{"Destination"}</Text></span>
            <h2><Text>{place.title}</Text></h2>
            <p><Text>{place.summary}</Text></p>
          </Link>
        ))}
      </section>
    </SubpageShell>
  );
}
