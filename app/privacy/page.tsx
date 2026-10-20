import { SubpageHero, SubpageShell } from '../shared';

export default function PrivacyPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Policy" title="Privacy">
        <p>When you send an enquiry or request, your name, contact details and message history are saved in the council website database for authorized administrators to review and respond to.</p>
        <p>Your conversation is also available through its reference number and private access code. Keep the code private. Replies are saved on this website; submitting a message does not send an email notification.</p>
        <p>Administrative access, replies, record changes and document downloads are recorded in a protected activity log. Archived conversations and documents retain their history.</p>
      </SubpageHero>
    </SubpageShell>
  );
}
