import { Text } from '@/components/language-provider';
import { InfoBand, SubpageHero, SubpageShell } from '../shared';
import { verificationItems } from '../site-data';

export default function AboutPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Our council" title="About Dambulla Pradeshiya Sabha">
        <p><Text>{" Dambulla Pradeshiya Sabha serves communities across a culturally significant landscape of villages, heritage places, agricultural land, and visitor destinations. "}</Text></p>
      </SubpageHero>
      <section className="section-shell narrative-grid">
        <article>
          <span><Text>{"Vision"}</Text></span>
          <h2><Text>{"Responsive local government"}</Text></h2>
          <p><Text>{" The draft source material frames the council around public service, accountable administration, community wellbeing, and sustainable development. "}</Text></p>
        </article>
        <article>
          <span><Text>{"Mission"}</Text></span>
          <h2><Text>{"Practical civic support"}</Text></h2>
          <p><Text>{" This prototype presents the council as a clear service gateway for residents, businesses, visitors, and institutions that need reliable information. "}</Text></p>
        </article>
      </section>
      <InfoBand title="Content Still Needing Verification" items={verificationItems} />
    </SubpageShell>
  );
}
