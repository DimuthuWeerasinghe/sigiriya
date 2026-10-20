/* eslint-disable @next/next/no-img-element */

import { Text } from '@/components/language-provider';
import { notices, tourismPlaces } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

const images = [
  ...tourismPlaces.map((place) => ({ title: place.title, image: place.image })),
  ...notices.filter((notice) => notice.image).map((notice) => ({ title: notice.title, image: notice.image as string })),
];

export default function GalleryPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Gallery" title="Documentary Image Library">
        <p><Text>{"Images extracted from the supplied source documents and existing project assets."}</Text></p>
      </SubpageHero>
      <section className="section-shell gallery-grid">
        {images.map((item) => (
          <figure key={`${item.title}-${item.image}`}>
            <img src={item.image} alt="" />
            <figcaption><Text>{item.title}</Text></figcaption>
          </figure>
        ))}
      </section>
    </SubpageShell>
  );
}
