import { Text } from '@/components/language-provider';
import { SubmissionForm } from '@/components/public/workspace';
import { SubpageHero, SubpageShell } from '../shared';

export default function ComplaintsPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Public requests" title="Complaints and Requests">
        <p><Text>{"Submit a civic issue or service request and follow its progress using your private tracking details."}</Text></p>
      </SubpageHero>
      <section className="section-shell service-search">
        <div>
          <h2><Text>{"Submit a civic issue"}</Text></h2>
          <p><Text>{"Your request and follow-up messages are saved for council staff to review."}</Text></p>
        </div>
        <SubmissionForm kind="request" />
      </section>
    </SubpageShell>
  );
}
