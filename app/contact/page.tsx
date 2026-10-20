import { Text } from '@/components/language-provider';
import { TranslatedTextarea } from '@/components/language-provider';
import { contactDetails } from '../site-data';
import { SubpageHero, SubpageShell } from '../shared';

export default function ContactPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Contact" title="Council Contact and Assistance">
        <p><Text>{"Use the contact details after final confirmation, or route enquiries through the council office."}</Text></p>
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
        <form>
          <label><Text>{" Your message "}</Text><TranslatedTextarea placeholder="Presentation-only message area" />
          </label>
          <button className="button primary" type="button"><Text>{"Send enquiry"}</Text></button>
        </form>
      </section>
    </SubpageShell>
  );
}
