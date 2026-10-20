import { Text } from '@/components/language-provider';
import { TranslatedTextarea } from '@/components/language-provider';
import { SubpageHero, SubpageShell } from '../shared';

export default function ComplaintsPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Public requests" title="Complaints and Requests">
        <p><Text>{"This prototype can reserve a future complaint intake workflow without collecting personal data."}</Text></p>
      </SubpageHero>
      <section className="section-shell service-search">
        <div>
          <h2><Text>{"Submit a civic issue"}</Text></h2>
          <p><Text>{"Reference numbers, privacy notices, and officer routing should be added before production use."}</Text></p>
        </div>
        <form>
          <label><Text>{" Request details "}</Text><TranslatedTextarea placeholder="Presentation-only request area" />
          </label>
          <button className="button primary" type="button"><Text>{"Submit request"}</Text></button>
        </form>
      </section>
    </SubpageShell>
  );
}
