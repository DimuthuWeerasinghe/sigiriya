import type { Metadata } from 'next';
import { SubpageHero, SubpageShell } from '../shared';
import { ConversationTracker } from '@/components/public/workspace';

export const metadata: Metadata = { title: 'Track Your Enquiry or Request | Dambulla Pradeshiya Sabha', robots: { index: false, follow: false } };

export default function TrackPage() {
  return <SubpageShell><SubpageHero eyebrow="Your conversation" title="Replies and request status"><p>Enter the reference number and private access code received after submitting your enquiry or request.</p></SubpageHero><section className="section-shell route-downloads"><ConversationTracker /></section></SubpageShell>;
}
