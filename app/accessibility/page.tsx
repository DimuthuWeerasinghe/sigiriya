import { Text } from '@/components/language-provider';
import { SubpageHero, SubpageShell } from '../shared';

export default function AccessibilityPage() {
  return (
    <SubpageShell>
      <SubpageHero eyebrow="Accessibility" title="Accessibility Statement">
        <p><Text>{"The prototype uses keyboard-accessible navigation, visible focus styles, responsive layouts, and reduced-motion support."}</Text></p>
      </SubpageHero>
    </SubpageShell>
  );
}
