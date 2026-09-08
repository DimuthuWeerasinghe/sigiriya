import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://dambulla-pradeshiya-sabha-prototype.bxinnovations.chatgpt.site'),
  title: 'Dambulla Pradeshiya Sabha | Official Prototype',
  description:
    'A polished civic website prototype for Dambulla Pradeshiya Sabha with public services, notices, future online services, and heritage discovery.',
  openGraph: {
    title: 'Dambulla Pradeshiya Sabha | Official Prototype',
    description:
      'A polished civic website prototype for Dambulla Pradeshiya Sabha with public services, notices, future online services, and heritage discovery.',
    images: ['/assets/dambulla-hero.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
