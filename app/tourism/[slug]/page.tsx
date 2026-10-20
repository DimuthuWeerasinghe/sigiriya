/* eslint-disable @next/next/no-img-element */

import { Text } from '@/components/language-provider';
import { notFound } from 'next/navigation';
import { tourismPlaces } from '../../site-data';
import { InfoBand, SubpageHero, SubpageShell } from '../../shared';

export function generateStaticParams() {
  return tourismPlaces.map((place) => ({ slug: place.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const place = tourismPlaces.find((item) => item.slug === params.slug);
  return {
    title: place ? `${place.title} | Explore Dambulla` : 'Tourism',
    description: place?.summary,
    openGraph: place ? { images: [place.image] } : undefined,
  };
}

export default function TourismDetailPage({ params }: { params: { slug: string } }) {
  const place = tourismPlaces.find((item) => item.slug === params.slug);
  if (!place) notFound();

  return (
    <SubpageShell>
      <SubpageHero eyebrow="Destination" title={place.title}>
        <p><Text>{place.summary}</Text></p>
      </SubpageHero>
      <section className="section-shell detail-image">
        <img src={place.image} alt="" />
      </section>
      <InfoBand title="Visitor Notes" items={place.notes} />
    </SubpageShell>
  );
}
