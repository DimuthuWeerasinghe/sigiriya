import type { Metadata } from 'next';
import assetManifest from '../content/assets.json';
import { LanguageProvider } from '@/components/language-provider';
import './globals.css';

type AssetEntry = { variants: { src: string; width: number }[] };
const heroAsset = (assetManifest as Record<string, AssetEntry>)['hero-visitor-sigiriya.png'];
const heroSrcSet = heroAsset?.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ');

export const metadata: Metadata = {
  metadataBase: new URL('https://dambulla-pradeshiya-sabha-prototype.bxinnovations.chatgpt.site'),
  title: 'Gateway to Dambulla & Sigiriya | Dambulla Pradeshiya Sabha',
  description:
    'A premium official civic and tourism gateway for Dambulla Pradeshiya Sabha, public services, notices, heritage and Sigiriya destination discovery.',
  openGraph: {
    title: 'Gateway to Dambulla & Sigiriya | Dambulla Pradeshiya Sabha',
    description:
      'A premium official civic and tourism gateway for Dambulla Pradeshiya Sabha, public services, notices, heritage and Sigiriya destination discovery.',
    images: ['/assets/optimized/dambulla-hero-1200.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="image"
          href={heroAsset?.variants.at(-1)?.src ?? '/assets/hero-visitor-sigiriya.png'}
          imageSrcSet={heroSrcSet}
          imageSizes="100vw"
        />
      </head>
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
