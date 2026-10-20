import { Text } from '@/components/language-provider';
import { notFound } from 'next/navigation';
import { services } from '../../site-data';
import { InfoBand, SubpageHero, SubpageShell } from '../../shared';

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = services.find((item) => item.slug === params.slug);
  return {
    title: service ? `${service.title} | Dambulla Pradeshiya Sabha` : 'Service',
    description: service?.summary,
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = services.find((item) => item.slug === params.slug);
  if (!service) notFound();

  return (
    <SubpageShell>
      <SubpageHero eyebrow={service.status} title={service.title}>
        <p><Text>{service.summary}</Text></p>
      </SubpageHero>
      <InfoBand title="Service Notes" items={service.details} />
    </SubpageShell>
  );
}
