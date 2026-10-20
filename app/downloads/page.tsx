import { Text } from '@/components/language-provider';
import { downloads } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

export default function DownloadsPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Downloads" title="Forms and Documents">
        <p><Text>{"Approved PDFs are pending. The current list reflects the categories identified in the supplied source."}</Text></p>
      </SubpageHero>
      <section className="download-list section-shell route-downloads">
        {downloads.map((item) => (
          <button key={item} type="button">
            <span>PDF</span>
            <Text>{item}</Text>
          </button>
        ))}
      </section>
    </SubpageShell>
  );
}
