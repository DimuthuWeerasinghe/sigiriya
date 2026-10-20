'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CoverflowCarousel, type CoverflowSlide } from '@/components/ui/coverflow-carousel';
import assetManifest from '../content/assets.json';
import { Text, useLanguage } from '@/components/language-provider';
import { PublicDocuments } from '@/components/public/workspace';

const navItems = [
  ['Home', '#home'],
  ['Services', '#services'],
  ['Council', '#council'],
  ['Notices', '#notices'],
  ['Community', '#community'],
];

const trailingNavItems = [
  ['Downloads', '#downloads'],
  ['Contact', '#contact'],
];

const exploreItems = [
  ['Culture', '#culture'],
  ['Heritage', '#council'],
  ['Gallery', '#gallery'],
  ['Nature', '/tourism'],
];

const quickActions = [
  ['Rates & Taxes', '#online'],
  ['Trade Licences', '#services'],
  ['Download Forms', '#downloads'],
  ['Submit a Request', '/complaints'],
  ['Track Application', '/track'],
];

const priorityServices = [
  {
    title: 'Download Forms',
    category: 'Forms',
    summary: 'Search published application forms and council documents.',
    meta: 'Download published PDFs',
    status: 'Available',
    href: '/downloads',
  },
  {
    title: 'Rates and Taxes',
    category: 'Rates & Taxes',
    summary: 'Find rates guidance and related application requirements.',
    meta: 'Requirements: assessment number, property details',
    status: 'Pending official confirmation',
    href: '/services/rates-and-taxes',
  },
  {
    title: 'Trade Licences',
    category: 'Licences',
    summary: 'Application and renewal guidance for local businesses.',
    meta: 'Requirements: business details, premises information',
    status: 'Requirements pending',
    href: '/services/trade-licences',
  },
  {
    title: 'Building Plan Approval',
    category: 'Construction',
    summary: 'Planning and approval guidance for building applications.',
    meta: 'Requirements: plans, location, ownership documents',
    status: 'Guidance pending',
    href: '/services/building-applications',
  },
  {
    title: 'Complaints and Requests',
    category: 'Public Requests',
    summary: 'Submit a civic issue or service request for follow-up.',
    meta: 'Submit a request and follow up using private tracking details',
    status: 'Online requests',
    href: '/complaints',
  },
  {
    title: 'Survey Plan Approval',
    category: 'Construction',
    summary: 'Check the documents needed for survey plan approval.',
    meta: 'Official checklist pending',
    status: 'Pending',
    href: '/services',
  },
  {
    title: 'Street Line Certificates',
    category: 'Certificates',
    summary: 'Find guidance for street line and non-acquisition certificates.',
    meta: 'Official wording pending',
    status: 'Pending',
    href: '/services',
  },
  {
    title: 'Certificate of Conformity',
    category: 'Certificates',
    summary: 'Prepare for conformity certificate applications.',
    meta: 'Official requirements pending',
    status: 'Pending',
    href: '/services',
  },
  {
    title: 'Waste Management',
    category: 'Public Requests',
    summary: 'Request help or find service guidance for waste collection.',
    meta: 'Schedule pending',
    status: 'Pending',
    href: '/services',
  },
];

const serviceDirectory = [
  'Download Application Forms',
  'Track Your Application',
  'Service Help Centre',
];

const notices = [
  ['Public Information Update', 'Date to be confirmed'],
  ['Tender Notice', 'Date to be confirmed'],
  ['Community Programme', 'Date to be confirmed'],
  ['Official publication area', 'Date to be confirmed'],
];

const stats = [
  ['Good Governance', 'Service transparency and accountable public information'],
  ['Community', 'Resident support and inclusive local communication'],
  ['Sustainable Development', 'Planning decisions pending official council content'],
];

const cultureScenes = [
  {
    side: 'right',
    asset: 'dambulla/ChatGPT Image Sep 8, 2026, 10_09_00 AM.png',
    title: 'Traditional performance',
  },
  {
    side: 'left',
    asset: 'dambulla/A4.png',
    title: 'Hospitality is part of everyday heritage',
  },
];

const destinations = [
  {
    title: 'Sigiriya',
    image: '/assets/rock-fortress-close.png',
  },
  {
    title: 'Mapagala',
    image: '/assets/documents/gallery-image1.jpeg',
  },
  {
    title: 'Kaludiya Pokuna',
    image: '/assets/documents/gallery-image2.jpeg',
  },
  {
    title: 'Kandalama Lake',
    image: '/assets/heritage-water-garden.png',
  },
];

const galleryImages = [
  ['Community', 'Council activity', '/assets/documents/news-image1.jpeg'],
  ['Community', 'School and awareness programme', '/assets/documents/news-image2.jpeg'],
  ['Heritage', 'Sigiriya water gardens', '/assets/dambulla/ChatGPT Image Sep 7, 2026, 10_34_10 PM.png'],
  ['Heritage', 'Fresco heritage', '/assets/dambulla/ChatGPT Image Sep 7, 2026, 10_47_00 PM.png'],
  ['Culture', 'Living craft', '/assets/dambulla/ChatGPT Image Sep 7, 2026, 11_55_39 PM.png'],
  ['Culture', 'Traditional performance', '/assets/dambulla/ChatGPT Image Sep 8, 2026, 10_09_00 AM.png'],
  ['Local life', 'Traditional food', '/assets/dambulla/A4.png'],
  ['Nature', 'Nature of the wider Dambulla region', '/assets/nature-elephants.png'],
];

const serviceCategories = ['Most Used', 'Licences', 'Construction', 'Certificates', 'Rates & Taxes', 'Public Requests', 'Forms'];
const serviceSteps = ['Find service', 'Check requirements', 'Download or prepare form', 'Submit', 'Track or follow up'];

const heroDockItems = [
  ['Rates & Taxes', '#online'],
  ['Licences', '#services'],
  ['Forms', '#downloads'],
  ['Report an Issue', '/complaints'],
];

type AssetEntry = {
  width: number;
  height: number;
  variants: { src: string; width: number }[];
};

const assets = assetManifest as Record<string, AssetEntry>;

function assetKey(src: string) {
  return src.replace(/^\/assets\//, '');
}

function sourceSet(entry: AssetEntry | undefined) {
  return entry?.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ');
}

function OptimizedImage({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, 50vw',
  fetchPriority,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}) {
  const { t } = useLanguage();
  const entry = assets[assetKey(src)];
  const srcSet = sourceSet(entry);

  return (
    <picture>
      {srcSet ? <source type="image/webp" srcSet={srcSet} sizes={sizes} /> : null}
      <img
        className={className}
        src={entry?.variants.at(-1)?.src ?? src}
        alt={t(alt)}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        width={entry?.width}
        height={entry?.height}
      />
    </picture>
  );
}

const frescoRows = [
  {
    className: 'heritage-intro',
    reverse: false,
    asset: '/assets/dambulla/ChatGPT Image Sep 8, 2026, 10_05_45 AM.png',
    label: 'Our heritage',
    title: 'Dambulla, shaped by history, service and community.',
  },
  {
    className: 'chairman-message',
    reverse: true,
    asset: '/assets/documents/home-image1.jpeg',
    accent: '/assets/dambulla/A2.png',
    label: 'Leadership',
    title: 'Message from the Chairman',
    name: 'Official name pending confirmation',
    position: 'Chairman, Dambulla Pradeshiya Sabha',
  },
  {
    className: 'secretary-message',
    reverse: false,
    asset: '/assets/documents/home-image20.jpeg',
    accent: '/assets/dambulla/A1.png',
    label: 'Leadership',
    title: 'Message from the Secretary',
    name: 'A.L.S. Priyadarshani',
    position: 'Secretary, Dambulla Pradeshiya Sabha',
  },
];

function FrescoRow({
  className,
  reverse,
  asset,
  accent,
  label,
  title,
  name,
  position,
}: {
  className: string;
  reverse: boolean;
  asset: string;
  accent?: string;
  label: string;
  title: string;
  name?: string;
  position?: string;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      section.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.classList.toggle('is-visible', entry.isIntersecting);
      },
      {
        rootMargin: '-12% 0px -18% 0px',
        threshold: 0.22,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let frame = 0;

    const updateScroll = () => {
      if (reduced.matches || window.innerWidth < 1024) return;
      const bounds = section.getBoundingClientRect();
      const center = bounds.top + bounds.height / 2;
      const delta = (window.innerHeight / 2 - center) / Math.max(window.innerHeight, 1);
      section.style.setProperty('--living-scroll-y', `${Math.max(-24, Math.min(24, delta * 38))}px`);
      section.style.setProperty('--living-scroll-rotate', `${Math.max(-0.5, Math.min(0.5, delta * 0.8))}deg`);
    };

    const updatePointer = (event: PointerEvent) => {
      if (!finePointer.matches || reduced.matches) return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5;
        const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5;
        section.style.setProperty('--living-card-x', `${x * 2}px`);
        section.style.setProperty('--living-card-y', `${y * 2}px`);
        section.style.setProperty('--living-art-x', `${x * 7}px`);
        section.style.setProperty('--living-art-y', `${y * 7}px`);
        section.style.setProperty('--living-light-x', `${(x + 0.5) * 100}%`);
        section.style.setProperty('--living-light-y', `${(y + 0.5) * 100}%`);
      });
    };

    const resetPointer = () => {
      section.style.setProperty('--living-card-x', '0px');
      section.style.setProperty('--living-card-y', '0px');
      section.style.setProperty('--living-art-x', '0px');
      section.style.setProperty('--living-art-y', '0px');
      section.style.setProperty('--living-light-x', '68%');
      section.style.setProperty('--living-light-y', '34%');
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    section.addEventListener('pointermove', updatePointer);
    section.addEventListener('pointerleave', resetPointer);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      section.removeEventListener('pointermove', updatePointer);
      section.removeEventListener('pointerleave', resetPointer);
    };
  }, []);

  const isLeadership = label === 'Leadership';
  const leadershipContent = isLeadership ? (
    <div className="fresco-copy editorial-frame__content editorial-card__content leadership-content-flow">
      <h2><Text>{title}</Text></h2>
      <div className="fresco-art editorial-card__art living-card__art-layer leader-visual">
        <figure className="leader-photo-frame" aria-label={t(title)}>
          <span className="leader-photo-placeholder" aria-hidden="true" />
        </figure>
      </div>
      {name ? (
        <div className="leader-details">
          <strong><Text>{name}</Text></strong>
          {position ? <span><Text>{position}</Text></span> : null}
        </div>
      ) : null}
      <a className="button light leader-read-more" href="#council"><Text>{"Read full message"}</Text></a>
    </div>
  ) : null;
  const copy = (
    <div className={`fresco-copy editorial-frame__content editorial-card__content ${isLeadership ? 'leader-heading-copy' : ''}`}>
      <h2><Text>{title}</Text></h2>
    </div>
  );
  const art = (
    <div className="fresco-art editorial-card__art living-card__art-layer" aria-hidden="true">
      <OptimizedImage src={asset} alt="" className="living-card__art" />
    </div>
  );

  return (
    <section ref={ref} className={`fresco-row living-card-scene editorial-frame scroll-fresco ${reverse ? 'reverse' : ''} ${className}`}>
      <div className={`living-card ${isLeadership ? 'leadership-living-card' : ''}`}>
        {isLeadership ? leadershipContent : copy}
        {isLeadership && accent ? <OptimizedImage src={accent} alt="" className="leader-heritage-accent" /> : null}
      </div>
      {!isLeadership ? art : null}
    </section>
  );
}

function CulturalScene({
  side,
  asset,
  title,
  children,
}: {
  side: string;
  asset: string;
  title: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 768px)');
    const update = () => {
      if (reduced.matches || compact.matches) return;
      const bounds = section.getBoundingClientRect();
      const centerOffset = window.innerHeight / 2 - (bounds.top + bounds.height / 2);
      section.style.setProperty('--story-drift', `${Math.max(-52, Math.min(52, centerOffset * 0.08))}px`);
    };

    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('is-visible', entry.isIntersecting);
      update();
    }, { threshold: 0.18 });

    observer.observe(section);
    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, []);

  const assetClass = asset.replace('.png', '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  return (
    <section ref={ref} className={`culture-scene culture-${side} culture-asset-${assetClass}`}>
      <div className="culture-art" aria-hidden="true">
        <OptimizedImage src={`/assets/${asset}`} alt="" />
      </div>
      <div className="section-shell culture-copy">
        <h2><Text>{title}</Text></h2>
        {children}
      </div>
    </section>
  );
}

function ComingSoonModal({ modal, onClose }: { modal: string | null; onClose: () => void }) {
  const { t } = useLanguage();
  if (!modal) return null;

  return (
    <div className="modal-shell" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label={t('Close modal')}>
          X
        </button>
        <p className="eyebrow"><Text>{"Coming soon"}</Text></p>
        <h2 id="coming-soon-title"><Text>{modal}</Text></h2>
        <p><Text>{"This prototype marks a future online service area and does not collect information or process requests."}</Text></p>
        <button className="button primary" type="button" onClick={onClose}><Text>{" Understood "}</Text></button>
      </section>
    </div>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Most Used');
  const [galleryCategory, setGalleryCategory] = useState('All');
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });

  const filteredServices = priorityServices.filter((service) => {
    const matchesCategory = serviceCategory === 'Most Used' || service.category === serviceCategory || (serviceCategory === 'Forms' && service.title.toLowerCase().includes('application'));
    const searchable = [service.title, service.summary, service.category].flatMap((value) => [value, t(value)]).join(' ').toLocaleLowerCase(language);
    return matchesCategory && searchable.includes(serviceQuery.trim().toLocaleLowerCase(language));
  });

  const serviceSuggestions = priorityServices.filter((service) => {
    if (!serviceQuery.trim()) return true;
    const searchable = [service.title, service.summary, service.category].flatMap((value) => [value, t(value)]).join(' ').toLocaleLowerCase(language);
    return searchable.includes(serviceQuery.trim().toLocaleLowerCase(language));
  }).slice(0, 5);

  const galleryCategories = ['All', ...Array.from(new Set(galleryImages.map(([category]) => category)))];
  const filteredGallery = useMemo(() => galleryImages.filter(([category]) => galleryCategory === 'All' || category === galleryCategory), [galleryCategory]);
  const gallerySlides: CoverflowSlide[] = useMemo(() => filteredGallery.map(([category, title, image]) => ({
    src: image,
    alt: t(title),
    title: title === 'Council activity' ? undefined : t(title),
    subtitle: title === 'Council activity' ? undefined : t(category),
  })), [filteredGallery, t]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeight = () => document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--site-header-height');
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.motion-section'));
    document.documentElement.classList.add('motion-ready');
    if (reduced.matches) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      {
        rootMargin: '-8% 0px -14% 0px',
        threshold: 0.16,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModal(null);
        setLightbox(null);
      }
      if (lightbox !== null && event.key === 'ArrowRight') setLightbox((lightbox + 1) % filteredGallery.length);
      if (lightbox !== null && event.key === 'ArrowLeft') setLightbox((lightbox + filteredGallery.length - 1) % filteredGallery.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, filteredGallery.length]);

  const moveHeroLight = (clientX: number, clientY: number) => {
    const hero = heroRef.current;
    if (!hero) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerTarget.current = {
      x: ((clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((clientY - bounds.top) / bounds.height - 0.5) * 2,
    };

    if (pointerFrame.current !== null) return;
    const animate = () => {
      const current = pointerCurrent.current;
      current.x += (pointerTarget.current.x - current.x) * 0.09;
      current.y += (pointerTarget.current.y - current.y) * 0.09;
      hero.style.setProperty('--hero-x', current.x.toFixed(3));
      hero.style.setProperty('--hero-y', current.y.toFixed(3));
      hero.style.setProperty('--glow-x', `${((current.x + 1) / 2 * 100).toFixed(1)}%`);
      hero.style.setProperty('--glow-y', `${((current.y + 1) / 2 * 100).toFixed(1)}%`);

      if (Math.abs(pointerTarget.current.x - current.x) > 0.002 || Math.abs(pointerTarget.current.y - current.y) > 0.002) {
        pointerFrame.current = requestAnimationFrame(animate);
      } else {
        pointerFrame.current = null;
      }
    };
    pointerFrame.current = requestAnimationFrame(animate);
  };

  return (
    <main id="home">
      <a className="skip-link" href="#services"><Text>{"Skip to public services"}</Text></a>

      <header ref={headerRef} className={scrolled ? 'site-header scrolled' : 'site-header'}>
        <nav className="main-nav" aria-label={t('Main navigation')}>
          <a className="brand" href="#home" aria-label={t('Dambulla Pradeshiya Sabha home')}>
            <span className="seal" aria-hidden="true">DPS</span>
            <strong><Text>{"Dambulla Pradeshiya Sabha"}</Text></strong>
          </a>
          <div className="nav-links">
            {[...navItems, ...exploreItems, ...trailingNavItems].map(([label, href]) => (
              <a key={label} href={href}><Text>{label}</Text></a>
            ))}
          </div>
        </nav>
      </header>

      <section
        ref={heroRef}
        className="hero living-gateway"
        aria-labelledby="hero-title"
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse') moveHeroLight(event.clientX, event.clientY);
        }}
        onPointerLeave={() => {
          pointerTarget.current = { x: 0, y: 0 };
          moveHeroLight(window.innerWidth / 2, window.innerHeight / 2);
        }}
      >
        <OptimizedImage
          className="hero-bg"
          src="/assets/hero-visitor-sigiriya.png"
          alt="Visitors overlooking Sigiriya at sunset"
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="hero-vignette" />
        <div className="hero-ambient" aria-hidden="true" />
        <div className="hero-mist" aria-hidden="true" />
        <div className="section-shell hero-stage">
          <div className="hero-content">
            <h1 id="hero-title">
              <span><Text>{"Your gateway to"}</Text></span>
              <span className="hero-title-focus"><Text>{"Dambulla "}</Text><br /><Text>{"& Sigiriya"}</Text></span>
            </h1>
            <div className="hero-actions">
              <a className="button primary hero-primary" href="#services"><Text>{"Find a Council Service "}</Text><span aria-hidden="true">-&gt;</span></a>
              <a className="button light hero-secondary" href="#tourism"><Text>{"Explore Dambulla & Sigiriya"}</Text></a>
            </div>
          </div>

          <div className="hero-service-dock" aria-label={t('Quick council service links')}>
            {heroDockItems.map(([label, href], index) => (
              <a key={label} href={href} style={{ '--dock-index': index } as CSSProperties}>
                <span aria-hidden="true"><Text>{String(index + 1).padStart(2, '0')}</Text></span>
                <strong><Text>{label}</Text></strong>
                <em aria-hidden="true">-&gt;</em>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="civic-panel motion-section">
        <div className="section-shell civic-layout">
          <div className="quick-actions civic-quick" aria-label={t('Quick public service actions')}>
            {quickActions.map(([title, href]) => (
              <a key={title} href={href}>
                <strong><Text>{title}</Text></strong>
              </a>
            ))}
          </div>
          <div className="civic-intro">
            <h2><Text>{"How can we help you today?"}</Text></h2>
          </div>
          <form className="service-finder" onSubmit={(event) => event.preventDefault()} role="search">
            <label htmlFor="service-search"><Text>{"What service do you need?"}</Text></label>
            <div>
              <input id="service-search" type="search" value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder={t('Search for a service, form or certificate...')} />
              <button className="button primary warm" type="submit"><Text>{"Search"}</Text></button>
            </div>
            <div className="service-suggestions" aria-label={t('Service search suggestions')}>
              {serviceSuggestions.map((service) => (
                <button key={service.title} type="button" onClick={() => setServiceQuery(t(service.title))}>
                  <Text>{service.title}</Text>
                </button>
              ))}
            </div>
          </form>
          <div className="filter-row service-filter" aria-label={t('Service categories')}>
            {serviceCategories.map((item) => (
              <button key={item} type="button" className={serviceCategory === item ? 'active' : ''} onClick={() => setServiceCategory(item)}>
                <Text>{item}</Text>
              </button>
            ))}
          </div>
          <div className="priority-grid">
            {filteredServices.map((service, index) => (
              <Link key={service.title} href={service.href} className={index === 0 ? 'priority-service featured' : 'priority-service'}>
                <span className="line-icon" aria-hidden="true" />
                <strong><Text>{service.title}</Text></strong>
              </Link>
            ))}
          </div>
          <div className="service-directory">
            <h3><Text>{"Support"}</Text></h3>
            {serviceDirectory.map((item) => (
              <Link key={item} href={item === 'Download Application Forms' ? '/downloads' : item === 'Track Your Application' ? '/track' : '/contact'}>
                <Text>{item}</Text>
                <span><Text>{"View"}</Text></span>
              </Link>
            ))}
          </div>
          <div className="service-process" aria-label={t('How to get a service')}>
            {serviceSteps.map((step) => (
              <div key={step}>
                <strong><Text>{step}</Text></strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="notices" className="notices-desk section-shell motion-section">
        <div className="section-heading editorial">
          <h2><Text>{"Latest Notices & Updates"}</Text></h2>
        </div>
        <article className="featured-notice">
          <div>
            <h3><Text>{"Public information area"}</Text></h3>
          </div>
          <Link className="button light" href="/news/public-information-update"><Text>{"Read notice"}</Text></Link>
        </article>
        <div className="notice-list">
          {notices.map(([title, date]) => (
            <Link key={title} href="/news">
              <strong><Text>{title}</Text></strong>
              <time><Text>{date}</Text></time>
            </Link>
          ))}
        </div>
        <div className="notice-links" aria-label={t('Information quick links')}>
          {['Tenders', 'Vacancies', 'Gazettes', 'Council sessions'].map((item) => <a key={item} href="#notices"><Text>{item}</Text></a>)}
        </div>
      </section>

      <section id="council" className="council-story">
        <div className="section-shell fresco-sequence">
          {frescoRows.map((row) => (
            <FrescoRow key={row.className} {...row} />
          ))}
          <div className="council-pillars motion-section">
            <div>
              <h2><Text>{"Vision, mission and public service"}</Text></h2>
            </div>
            <div className="statement-stack">
              <article>
                <span><Text>{"Vision"}</Text></span>
              </article>
              <article>
                <span><Text>{"Mission"}</Text></span>
              </article>
            </div>
            <div className="stat-row">
              {stats.map(([number, label]) => (
                <div key={label}>
                  <strong><Text>{number}</Text></strong>
                  <span><Text>{label}</Text></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="community-news section-shell motion-section">
        <div className="section-heading editorial">
          <h2><Text>{"People and programmes on the ground"}</Text></h2>
        </div>
        <article className="community-feature">
          <OptimizedImage src="/assets/documents/news-image4.jpeg" alt="Council event photograph" />
          <div>
            <h3><Text>{"Community programme coverage"}</Text></h3>
            <Link className="button light" href="/news"><Text>{"Open news centre"}</Text></Link>
          </div>
        </article>
      </section>

      <section id="culture" className="culture-journey" aria-label={t('Cultural storytelling')}>
        <div className="section-shell journey-heading motion-section">
          <h2><Text>{"Culture, craft and everyday life"}</Text></h2>
        </div>
        <section className="living-culture-banner section-shell motion-section">
          <OptimizedImage src="/assets/dambulla/ChatGPT Image Sep 8, 2026, 12_08_11 PM.png" alt="Our living culture banner with traditional mask craft" sizes="(max-width: 768px) 100vw, 1220px" />
          <nav aria-label={t('Culture links')}>
            {['Craft', 'Food', 'Living Heritage'].map((item) => (
              <a key={item} href="#culture"><Text>{item}</Text></a>
            ))}
          </nav>
        </section>
        {cultureScenes.map((scene) => (
          <CulturalScene key={scene.title} {...scene} />
        ))}
        <section id="living-craft" className="craft-scene editorial-frame motion-section">
          <div>
            <h2><Text>{"Craft and community"}</Text></h2>
            <Link className="button light" href="/gallery"><Text>{"View community gallery"}</Text></Link>
          </div>
          <figure>
            <OptimizedImage src="/assets/dambulla/ChatGPT Image Sep 7, 2026, 11_55_39 PM.png" alt="Craftsman working on a traditional mask" />
            <figcaption><Text>{"Local craft"}</Text></figcaption>
          </figure>
        </section>
      </section>

      <section id="tourism" className="destination-showcase motion-section">
        <div className="section-shell destination-layout">
          <div className="destination-lead">
            <p className="eyebrow"><Text>{"Explore Dambulla"}</Text></p>
            <h2><Text>{"Explore Dambulla & Sigiriya"}</Text></h2>
          </div>
          <Link href="/tourism/sigiriya" className="dominant-destination">
            <OptimizedImage src={destinations[0].image} alt="Sigiriya rock fortress" sizes="(max-width: 768px) 100vw, 70vw" />
            <div>
              <span><Text>{destinations[0].title}</Text></span>
            </div>
          </Link>
          <div className="destination-stack">
            {destinations.slice(1).map((place) => (
              <Link key={place.title} href="/tourism">
                <OptimizedImage src={place.image} alt="" sizes="(max-width: 768px) 100vw, 34vw" />
                <div>
                  <h3><Text>{place.title}</Text></h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="visitor-gateway" className="tourist-experience section-shell editorial-frame motion-section">
        <div>
          <h2><Text>{"A place to explore. A heritage to respect."}</Text></h2>
          <Link className="button primary" href="/tourism"><Text>{"Explore destinations"}</Text></Link>
        </div>
        <figure>
          <OptimizedImage src="/assets/dambulla/ChatGPT Image Sep 7, 2026, 11_57_21 PM.png" alt="Visitors viewing Sigiriya from a scenic landscape" />
          <figcaption><Text>{"Gateway to Dambulla & Sigiriya"}</Text></figcaption>
        </figure>
      </section>

      <section id="online" className="online-status section-shell motion-section">
        <article>
          <span><Text>{"Coming soon"}</Text></span>
          <h2><Text>{"Online Payments"}</Text></h2>
          <p><Text>{"Future council charges and selected fees can be represented here when providers and receipt rules are confirmed."}</Text></p>
          <button className="button primary" type="button" onClick={() => setModal('Online Payments')}><Text>{"View status"}</Text></button>
        </article>
        <article>
          <span><Text>{"Coming soon"}</Text></span>
          <h2><Text>{"Online Booking"}</Text></h2>
          <p><Text>{"Future access to selected facilities, appointments and visitor services can be represented here."}</Text></p>
          <button className="button primary warm" type="button" onClick={() => setModal('Online Booking')}><Text>{"View status"}</Text></button>
        </article>
      </section>

      <section id="downloads" className="document-centre motion-section">
        <div className="section-shell document-layout">
          <div>
            <h2><Text>{"Documents, Forms & Publications"}</Text></h2>
          </div>
          <PublicDocuments />
        </div>
      </section>

      <section id="gallery" className="gallery-editorial gallery-coverflow-section motion-section">
        <div className="section-shell gallery-journey-header">
          <div className="section-heading editorial">
            <p className="eyebrow"><Text>{"Gallery"}</Text></p>
            <h2><Text>{"Moments from Dambulla"}</Text></h2>
          </div>
          <div className="filter-row gallery-filter" aria-label={t('Gallery categories')}>
            {galleryCategories.map((item) => (
              <button key={item} type="button" className={galleryCategory === item ? 'active' : ''} onClick={() => setGalleryCategory(item)}>
                <Text>{item}</Text>
              </button>
            ))}
          </div>
        </div>
        <div className="section-shell gallery-coverflow-wrap">
          <CoverflowCarousel
            key={`${galleryCategory}-${language}`}
            slides={gallerySlides}
            rotate={44}
            depth={0.6}
            perspective={3}
            falloff={0.56}
            fade={0.1}
            gap={0.05}
            cardWidth="clamp(148px, 22vw, 260px)"
            showCaption
            label="Dambulla gallery carousel"
            className="gallery-coverflow"
            cardClassName="gallery-coverflow-card"
            renderImage={(slide) => (
              <OptimizedImage
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full select-none object-cover"
                sizes="(max-width: 768px) 60vw, 260px"
              />
            )}
            onSlideClick={(index) => setLightbox(index)}
          />
        </div>
      </section>

      <section id="contact" className="final-cta section-shell motion-section">
        <div>
          <h2><Text>{"Need help?"}</Text></h2>
        </div>
        <div className="cta-actions">
          <Link className="button primary" href="/contact"><Text>{"Contact the Council"}</Text></Link>
          <a className="button light" href="#services"><Text>{"Find a Service"}</Text></a>
          <Link className="button light" href="/downloads"><Text>{"Download Forms"}</Text></Link>
        </div>
      </section>

      <footer className="footer motion-section">
        <div className="section-shell footer-grid">
          <div className="footer-brand">
            <span className="seal">DPS</span>
            <h2><Text>{"Dambulla Pradeshiya Sabha"}</Text></h2>
          </div>
          <nav aria-label={t('Service links')}>
            <h3><Text>{"Council"}</Text></h3>
            <Link href="/about"><Text>{"About"}</Text></Link>
            <Link href="#council"><Text>{"Vision & Mission"}</Text></Link>
            <Link href="#council"><Text>{"Leadership"}</Text></Link>
            <Link href="/news"><Text>{"Notices"}</Text></Link>
          </nav>
          <nav aria-label={t('Service links')}>
            <h3><Text>{"Services"}</Text></h3>
            <Link href="/services"><Text>{"Public services"}</Text></Link>
            <Link href="/services/rates-and-taxes"><Text>{"Rates"}</Text></Link>
            <Link href="/services/trade-licences"><Text>{"Licences"}</Text></Link>
            <Link href="/complaints"><Text>{"Requests"}</Text></Link>
            <Link href="/downloads"><Text>{"Downloads"}</Text></Link>
          </nav>
          <nav aria-label={t('Tourism links')}>
            <h3><Text>{"Explore"}</Text></h3>
            <Link href="/tourism/sigiriya"><Text>{"Sigiriya"}</Text></Link>
            <Link href="/tourism"><Text>{"Destinations"}</Text></Link>
            <Link href="#culture"><Text>{"Culture"}</Text></Link>
            <Link href="/gallery"><Text>{"Gallery"}</Text></Link>
          </nav>
          <nav aria-label={t('Policy links')}>
            <h3><Text>{"Access"}</Text></h3>
            <Link href="/accessibility"><Text>{"Accessibility"}</Text></Link>
            <Link href="/privacy"><Text>{"Privacy"}</Text></Link>
            <Link href="/sitemap"><Text>{"Sitemap"}</Text></Link>
          </nav>
        </div>
      </footer>

      {lightbox !== null ? (
        <div className="lightbox" role="presentation" onMouseDown={() => setLightbox(null)}>
          <section role="dialog" aria-modal="true" aria-label={t(filteredGallery[lightbox][1])} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setLightbox(null)} aria-label={t('Close gallery image')}>X</button>
            <OptimizedImage src={filteredGallery[lightbox][2]} alt="" sizes="100vw" />
            {gallerySlides[lightbox]?.title ? <p>{gallerySlides[lightbox].title}</p> : null}
          </section>
        </div>
      ) : null}

      <ComingSoonModal modal={modal} onClose={() => setModal(null)} />
    </main>
  );
}
