import { Text } from '@/components/language-provider';
import { PublicDocuments } from '@/components/public/workspace';
import { SubpageHero, SubpageShell } from '../shared';

export default function DownloadsPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Downloads" title="Forms and Documents">
        <p><Text>{"Search the published document library and download forms, reports and publications."}</Text></p>
      </SubpageHero>
      <section className="section-shell route-downloads">
        <PublicDocuments />
      </section>
    </SubpageShell>
  );
}
