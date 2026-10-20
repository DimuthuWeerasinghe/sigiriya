import { Text } from '@/components/language-provider';
import { SubpageHero, SubpageShell } from '../shared';

export default function PrivacyPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Policy" title="Privacy">
        <p><Text>{"This prototype does not submit forms, store personal information, or process payments."}</Text></p>
      </SubpageHero>
    </SubpageShell>
  );
}
