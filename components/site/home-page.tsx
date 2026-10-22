'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CoverflowCarousel, type CoverflowSlide } from '@/components/ui/coverflow-carousel';
import assetManifest from '@/content/assets.json';
import type { SiteSections } from '@/lib/site/defaults';
import { LanguageSwitcher, Text, useLanguage } from '@/components/language-provider';
import { PublicDocuments } from '@/components/public/workspace';

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

function FrescoRow({
  className,
  reverse,
  asset,
  accent,
  label,
  title,
  name,
  position,
  photo,
  messageHref,
  buttonLabel,
}: {
  className: string;
  reverse: boolean;
  asset: string;
  accent?: string;
  label: string;
  title: string;
  name?: string;
  position?: string;
  photo?: string;
  messageHref?: string;
  buttonLabel?: string;
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
          {photo ? <OptimizedImage src={photo} alt={name ?? title} className="leader-portrait"/> : <span className="leader-photo-placeholder" aria-hidden="true"/>}
        </figure>
      </div>
      {name ? (
        <div className="leader-details">
          <strong><Text>{name}</Text></strong>
          {position ? <span><Text>{position}</Text></span> : null}
        </div>
      ) : null}
      <Link className="button light leader-read-more" href={messageHref ?? '#council'}><Text>{buttonLabel ?? 'Read full message'}</Text></Link>
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
  description,
  children,
}: {
  side: string;
  asset: string;
  title: string;
  description: string;
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

  const assetClass = asset.replace(/^\/assets\//, '').replace('.png', '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  return (
    <section ref={ref} className={`culture-scene culture-${side} culture-asset-${assetClass}`}>
      <div className="culture-art" aria-hidden="true">
        <OptimizedImage src={asset} alt="" />
      </div>
      <div className="section-shell culture-copy">
        <h2><Text>{title}</Text></h2>
        {description && <p><Text>{description}</Text></p>}
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

export default function Home({content}: {content: SiteSections}) {
  const priorityServices = content.services.items;
  const serviceCategories = content.services.categories.map(item=>item.label);
  const galleryImages = content.gallery.items;
  const frescoRows = [
    {className:'heritage-intro',reverse:false,asset:content.heritage.image,label:'Our heritage',title:content.heritage.title,visible:content.heritage.visible},
    ...(['chairman','secretary'] as const).map((role,index)=>({className:role+'-message',reverse:index===0,asset:content[role].photo,accent:index===0?'/assets/dambulla/A2.png':'/assets/dambulla/A1.png',label:'Leadership',title:content[role].title,name:content[role].name,position:content[role].role,photo:content[role].photo,messageHref:'/council/'+role,buttonLabel:content[role].buttonLabel,visible:content[role].visible}))
  ].filter(row=>row.visible);
  const { t, language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [serviceQuery, setServiceQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState(content.services.categories[0].label);
  const [galleryCategory, setGalleryCategory] = useState('All');
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerCurrent = useRef({ x: 0, y: 0 });

  const filteredServices = priorityServices.filter((service) => {
    const matchesCategory = serviceCategory === serviceCategories[0] || service.category === serviceCategory || (serviceCategory === 'Forms' && service.title.toLowerCase().includes('application'));
    const searchable = [service.title, service.summary, service.category].flatMap((value) => [value, t(value)]).join(' ').toLocaleLowerCase(language);
    return matchesCategory && searchable.includes(serviceQuery.trim().toLocaleLowerCase(language));
  });

  const serviceSuggestions = priorityServices.filter((service) => {
    if (!serviceQuery.trim()) return true;
    const searchable = [service.title, service.summary, service.category].flatMap((value) => [value, t(value)]).join(' ').toLocaleLowerCase(language);
    return searchable.includes(serviceQuery.trim().toLocaleLowerCase(language));
  }).slice(0, 5);

  const galleryCategories = ['All', ...Array.from(new Set(galleryImages.map(item => item.category)))];
  const filteredGallery = useMemo(() => galleryImages.filter(item => galleryCategory === 'All' || item.category === galleryCategory), [galleryCategory, galleryImages]);
  const gallerySlides: CoverflowSlide[] = useMemo(() => filteredGallery.map(({category, title, image, showCaption}) => ({
    src: image,
    alt: t(title),
    title: showCaption ? t(title) : undefined,
    subtitle: showCaption ? t(category) : undefined,
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
      <a className="skip-link" href="#services"><Text>Skip to public services</Text></a>
      {content.header.visible && <header ref={headerRef} className={scrolled ? 'site-header scrolled' : 'site-header'}>
        <nav className="main-nav" aria-label={t('Main navigation')}>
          <a className="brand" href="#home" aria-label={t('Dambulla Pradeshiya Sabha home')}><span className="seal" aria-hidden="true">{content.header.seal}</span><strong><Text>{content.header.brand}</Text></strong></a>
          {content.header.showLanguages && <LanguageSwitcher/>}
          <div className="nav-links">{content.header.links.map(({label,href},index)=><a key={index} href={href}><Text>{label}</Text></a>)}</div>
        </nav>
      </header>}
      {content.hero.visible && <section ref={heroRef} className="hero living-gateway" aria-labelledby="hero-title" onPointerMove={event=>{if(event.pointerType==='mouse')moveHeroLight(event.clientX,event.clientY);}} onPointerLeave={()=>{pointerTarget.current={x:0,y:0};moveHeroLight(window.innerWidth/2,window.innerHeight/2);}}>
        <OptimizedImage className="hero-bg" src={content.hero.image} alt={content.hero.imageAlt} loading="eager" fetchPriority="high" sizes="100vw"/>
        <div className="hero-vignette"/><div className="hero-ambient" aria-hidden="true"/><div className="hero-mist" aria-hidden="true"/>
        <div className="section-shell hero-stage"><div className="hero-content">
          <h1 id="hero-title"><span><Text>{content.hero.introduction}</Text></span><span className="hero-title-focus"><Text>{content.hero.title}</Text><br/><Text>{content.hero.subtitle}</Text></span></h1>
          <div className="hero-actions"><a className="button primary hero-primary" href={content.hero.primary.href}><Text>{content.hero.primary.label}</Text><span aria-hidden="true">→</span></a><a className="button light hero-secondary" href={content.hero.secondary.href}><Text>{content.hero.secondary.label}</Text></a></div>
        </div><div className="hero-service-dock" aria-label={t('Quick council service links')}>{content.hero.dock.map(({label,href},index)=><a key={index} href={href} style={{'--dock-index':index} as CSSProperties}><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span><strong><Text>{label}</Text></strong><em aria-hidden="true">→</em></a>)}</div></div>
      </section>}
      {content.services.visible && <section id="services" className="civic-panel motion-section"><div className="section-shell civic-layout">
        <div className="quick-actions civic-quick" aria-label={t('Quick public service actions')}>{content.services.quickActions.map(({label,href},index)=><a key={index} href={href}><strong><Text>{label}</Text></strong></a>)}</div>
        <div className="civic-intro"><h2><Text>{content.services.title}</Text></h2></div>
        <form className="service-finder" onSubmit={event=>event.preventDefault()} role="search"><label htmlFor="service-search"><Text>{content.services.searchLabel}</Text></label><div><input id="service-search" type="search" value={serviceQuery} onChange={event=>setServiceQuery(event.target.value)} placeholder={t(content.services.searchPlaceholder)}/><button className="button primary warm" type="submit"><Text>Search</Text></button></div><div className="service-suggestions" aria-label={t('Service search suggestions')}>{serviceSuggestions.map((service,index)=><button key={index} type="button" onClick={()=>setServiceQuery(t(service.title))}><Text>{service.title}</Text></button>)}</div></form>
        <div className="filter-row service-filter" aria-label={t('Service categories')}>{serviceCategories.map((item,index)=><button key={index} type="button" className={serviceCategory===item?'active':''} onClick={()=>setServiceCategory(item)}><Text>{item}</Text></button>)}</div>
        <div className="priority-grid">{filteredServices.map((service,index)=><Link key={index} href={service.href} className={index===0?'priority-service featured':'priority-service'}><span className="line-icon" aria-hidden="true"/><strong><Text>{service.title}</Text></strong>{service.summary && <p><Text>{service.summary}</Text></p>}</Link>)}</div>
        <div className="service-directory"><h3><Text>{content.services.supportTitle}</Text></h3>{content.services.supportLinks.map(({label,href},index)=><Link key={index} href={href}><Text>{label}</Text><span><Text>View</Text></span></Link>)}</div>
        <div className="service-process" aria-label={t('How to get a service')}>{content.services.steps.map(({label},index)=><div key={index}><strong><Text>{label}</Text></strong></div>)}</div>
      </div></section>}
      {content.notices.visible && <section id="notices" className="notices-desk section-shell motion-section">
        <div className="section-heading editorial"><h2><Text>{content.notices.title}</Text></h2></div><article className="featured-notice"><div><h3><Text>{content.notices.featuredTitle}</Text></h3></div><Link className="button light" href={content.notices.featuredHref}><Text>{content.notices.buttonLabel}</Text></Link></article>
        <div className="notice-list">{content.notices.items.map(({title,date,href},index)=><Link key={index} href={href}><strong><Text>{title}</Text></strong><time><Text>{date}</Text></time></Link>)}</div><div className="notice-links" aria-label={t('Information quick links')}>{content.notices.links.map(({label,href},index)=><a key={index} href={href}><Text>{label}</Text></a>)}</div>
      </section>}
      {(content.heritage.visible || content.chairman.visible || content.secretary.visible || content.council.visible) && <section id="council" className="council-story"><div className="section-shell fresco-sequence">
        {frescoRows.map(row=><FrescoRow key={row.className} {...row}/>)}
        {content.council.visible && <div className="council-pillars motion-section"><div><h2><Text>{content.council.title}</Text></h2></div><div className="statement-stack"><article><span><Text>Vision</Text></span>{content.council.vision && <p><Text>{content.council.vision}</Text></p>}</article><article><span><Text>Mission</Text></span>{content.council.mission && <p><Text>{content.council.mission}</Text></p>}</article></div><div className="stat-row">{content.council.stats.map(({title,description},index)=><div key={index}><strong><Text>{title}</Text></strong><span><Text>{description}</Text></span></div>)}</div></div>}
      </div></section>}
      {content.community.visible && <section id="community" className="community-news section-shell motion-section"><div className="section-heading editorial"><h2><Text>{content.community.title}</Text></h2></div><article className="community-feature"><OptimizedImage src={content.community.image} alt={content.community.imageAlt}/><div><h3><Text>{content.community.featureTitle}</Text></h3>{content.community.description && <p><Text>{content.community.description}</Text></p>}<Link className="button light" href={content.community.buttonHref}><Text>{content.community.buttonLabel}</Text></Link></div></article></section>}
      {content.culture.visible && <section id="culture" className="culture-journey" aria-label={t('Cultural storytelling')}>
        <div className="section-shell journey-heading motion-section"><h2><Text>{content.culture.title}</Text></h2></div><section className="living-culture-banner section-shell motion-section"><OptimizedImage src={content.culture.bannerImage} alt={content.culture.bannerAlt} sizes="(max-width: 768px) 100vw, 1220px"/><nav aria-label={t('Culture links')}>{content.culture.links.map(({label,href},index)=><a key={index} href={href}><Text>{label}</Text></a>)}</nav></section>
        {content.culture.scenes.map((scene,index)=><CulturalScene key={index} side={scene.side} asset={scene.image} title={scene.title} description={scene.description}/>)}
        <section id="living-craft" className="craft-scene editorial-frame motion-section"><div><h2><Text>{content.culture.craftTitle}</Text></h2>{content.culture.craftDescription && <p><Text>{content.culture.craftDescription}</Text></p>}<Link className="button light" href={content.culture.craftLink.href}><Text>{content.culture.craftLink.label}</Text></Link></div><figure><OptimizedImage src={content.culture.craftImage} alt={content.culture.craftAlt}/><figcaption><Text>{content.culture.craftCaption}</Text></figcaption></figure></section>
      </section>}
      {content.tourism.visible && <section id="tourism" className="destination-showcase motion-section"><div className="section-shell destination-layout"><div className="destination-lead"><p className="eyebrow"><Text>{content.tourism.eyebrow}</Text></p><h2><Text>{content.tourism.title}</Text></h2></div><Link href={content.tourism.items[0].href} className="dominant-destination"><OptimizedImage src={content.tourism.items[0].image} alt={content.tourism.items[0].title} sizes="(max-width: 768px) 100vw, 70vw"/><div><span><Text>{content.tourism.items[0].title}</Text></span></div></Link><div className="destination-stack">{content.tourism.items.slice(1).map((place,index)=><Link key={index} href={place.href}><OptimizedImage src={place.image} alt={place.title} sizes="(max-width: 768px) 100vw, 34vw"/><div><h3><Text>{place.title}</Text></h3></div></Link>)}</div></div></section>}
      {content.visitor.visible && <section id="visitor-gateway" className="tourist-experience section-shell editorial-frame motion-section"><div><h2><Text>{content.visitor.title}</Text></h2><Link className="button primary" href={content.visitor.link.href}><Text>{content.visitor.link.label}</Text></Link></div><figure><OptimizedImage src={content.visitor.image} alt={content.visitor.imageAlt}/><figcaption><Text>{content.visitor.caption}</Text></figcaption></figure></section>}
      {content.online.visible && <section id="online" className="online-status section-shell motion-section">{content.online.items.map((item,index)=><article key={index}><span><Text>{item.status}</Text></span><h2><Text>{item.title}</Text></h2><p><Text>{item.description}</Text></p>{item.href ? <a className={index===0?'button primary':'button primary warm'} href={item.href}><Text>{item.buttonLabel}</Text></a> : <button className={index===0?'button primary':'button primary warm'} type="button" onClick={()=>setModal(item.title)}><Text>{item.buttonLabel}</Text></button>}</article>)}</section>}
      {content.downloads.visible && <section id="downloads" className="document-centre motion-section"><div className="section-shell document-layout"><div><h2><Text>{content.downloads.title}</Text></h2></div><PublicDocuments/></div></section>}
      {content.gallery.visible && <section id="gallery" className="gallery-editorial gallery-coverflow-section motion-section"><div className="section-shell gallery-journey-header"><div className="section-heading editorial"><p className="eyebrow"><Text>{content.gallery.eyebrow}</Text></p><h2><Text>{content.gallery.title}</Text></h2></div><div className="filter-row gallery-filter" aria-label={t('Gallery categories')}>{galleryCategories.map(item=><button key={item} type="button" className={galleryCategory===item?'active':''} onClick={()=>{setGalleryCategory(item);setLightbox(null);}}><Text>{item}</Text></button>)}</div></div><div className="section-shell gallery-coverflow-wrap"><CoverflowCarousel key={`${galleryCategory}-${language}`} slides={gallerySlides} rotate={44} depth={0.6} perspective={3} falloff={0.56} fade={0.1} gap={0.05} cardWidth="clamp(148px, 22vw, 260px)" showCaption={content.gallery.showCaptions} label="Dambulla gallery carousel" className="gallery-coverflow" cardClassName="gallery-coverflow-card" renderImage={slide=><OptimizedImage src={slide.src} alt={slide.alt} className="h-full w-full select-none object-cover" sizes="(max-width: 768px) 60vw, 260px"/>} onSlideClick={index=>setLightbox(index)}/></div></section>}
      {content.contact.visible && <section id="contact" className="final-cta section-shell motion-section"><div><h2><Text>{content.contact.title}</Text></h2></div><div className="cta-actions">{content.contact.links.map(({label,href},index)=><Link key={index} className={index===0?'button primary':'button light'} href={href}><Text>{label}</Text></Link>)}</div></section>}
      {content.footer.visible && <footer className="footer motion-section"><div className="section-shell footer-grid"><div className="footer-brand"><span className="seal">{content.footer.seal}</span><h2><Text>{content.footer.brand}</Text></h2></div>{content.footer.columns.map((column,index)=><nav key={index} aria-label={t(column.title)}><h3><Text>{column.title}</Text></h3>{column.links.map(({label,href},linkIndex)=><Link key={linkIndex} href={href}><Text>{label}</Text></Link>)}</nav>)}</div></footer>}
      {lightbox !== null && filteredGallery[lightbox] ? <div className="lightbox" role="presentation" onMouseDown={()=>setLightbox(null)}><section role="dialog" aria-modal="true" aria-label={t(filteredGallery[lightbox].title)} onMouseDown={event=>event.stopPropagation()}><button type="button" onClick={()=>setLightbox(null)} aria-label={t('Close gallery image')}>X</button><OptimizedImage src={filteredGallery[lightbox].image} alt={t(filteredGallery[lightbox].title)} sizes="100vw"/>{content.gallery.showCaptions && gallerySlides[lightbox]?.title ? <p>{gallerySlides[lightbox].title}</p> : null}</section></div> : null}
      <ComingSoonModal modal={modal} onClose={()=>setModal(null)}/>
    </main>
  );
}