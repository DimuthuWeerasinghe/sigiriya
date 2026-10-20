import { Text } from '@/components/language-provider';
import { SubmissionForm } from '@/components/public/workspace';
import { contactDetails } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

export default function ContactPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Contact" title="Council Contact and Assistance">
        <p><Text>{"Send an enquiry to the council. Keep your private tracking details to view replies and follow up."}</Text></p>
      </SubpageHero>
      <section className="section-shell contact route-contact">
        <div>
          {contactDetails.map(([label, value]) => (
            <article key={label}>
              <span><Text>{label}</Text></span>
              <p><Text>{value}</Text></p>
            </article>
          ))}
        </div>
        <SubmissionForm kind="enquiry" />
      </section>
    </SubpageShell>
  );
}
