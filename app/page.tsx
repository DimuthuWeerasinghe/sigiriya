'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

const navItems = [
  ['Home', 'home'],
  ['Our Council', 'council'],
  ['Public Services', 'services'],
  ['Online Services', 'online'],
  ['Notices', 'notices'],
  ['Projects', 'projects'],
  ['Explore Dambulla', 'explore'],
  ['Contact', 'contact'],
];

const services = [
  ['Rates and Taxes', 'Council levy and assessment service support.', 'RT'],
  ['Trade Licences', 'Applications, renewals, and guidance for local businesses.', 'TL'],
  ['Building Applications', 'Planning, development, and permit application pathways.', 'BA'],
  ['Waste Management', 'Collection information, requests, and civic cleanliness.', 'WM'],
  ['Complaints and Requests', 'Public submissions, service issues, and follow-up.', 'CR'],
  ['Download Forms', 'Application forms and official document templates.', 'DF'],
];

const notices = [
  ['Public Notice', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Reference'],
  ['Council Update', 'Sed do eiusmod tempor incididunt ut labore et dolore.', 'Reference'],
  ['Service Notice', 'Ut enim ad minim veniam, quis nostrud exercitation.', 'Reference'],
];

const tenders = [
  ['Tender Notice', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Status'],
  ['Procurement Notice', 'Integer posuere erat a ante venenatis dapibus.', 'Status'],
  ['Expression of Interest', 'Donec ullamcorper nulla non metus auctor fringilla.', 'Status'],
];

const events = [
  ['Council Session', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Date TBC'],
  ['Public Programme', 'Aenean lacinia bibendum nulla sed consectetur.', 'Date TBC'],
  ['Community Clinic', 'Cras mattis consectetur purus sit amet fermentum.', 'Date TBC'],
];

const downloads = [
  'Assessment and rates application',
  'Trade licence application',
  'Building application checklist',
  'Solid waste request form',
  'Complaint and request form',
  'General certificate request',
];

function Placeholder({
  label,
  wide = false,
}: {
  label: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'placeholder placeholder-wide' : 'placeholder'} role="img" aria-label={label}>
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}

function ComingSoonModal({
  modal,
  onClose,
}: {
  modal: string | null;
  onClose: () => void;
}) {
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
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close modal">
          X
        </button>
        <p className="eyebrow">Coming Soon</p>
        <h2 id="coming-soon-title">{modal}</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. This prototype indicates a future online
          service area and does not collect information or process requests.
        </p>
        <button className="button primary" type="button" onClick={onClose}>
          Understood
        </button>
      </section>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [modal, setModal] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const openModal = (name: string) => setModal(name);

  return (
    <main id="home">
      <a className="skip-link" href="#services">
        Skip to public services
      </a>

      <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
        <div className="utility-bar" aria-label="Accessibility and language controls">
          <div className="language-group" role="group" aria-label="Language selection">
            {['සිංහල', 'தமிழ்', 'English'].map((language) => (
              <button
                key={language}
                type="button"
                className={activeLanguage === language ? 'utility-button active' : 'utility-button'}
                onClick={() => setActiveLanguage(language)}
              >
                {language}
              </button>
            ))}
          </div>
          <div className="utility-actions">
            <button type="button">Accessibility</button>
            <button type="button" aria-label="Decrease text size">A-</button>
            <button type="button" aria-label="Increase text size">A+</button>
            <button type="button">High contrast</button>
            <a href="#search">Search</a>
            <a href="#contact">Contact</a>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <a className="brand" href="#home" aria-label="Dambulla Pradeshiya Sabha home">
            <Placeholder label="Official Logo" />
            <span>
              <strong>Dambulla Pradeshiya Sabha</strong>
              <small>Official Prototype</small>
            </span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
            Menu
          </button>
          <div className="nav-links">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div id="mobile-menu" className={menuOpen ? 'mobile-menu open' : 'mobile-menu'}>
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <img src="/assets/dambulla-hero.png" alt="Dambulla rock landscape at golden hour" />
        <div className="hero-shade" />
        <div className="hero-content reveal">
          <p className="eyebrow">Official digital gateway</p>
          <h1 id="hero-title">Dambulla Pradeshiya Sabha</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis
            dapibus posuere velit aliquet.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#services">Access Public Services</a>
            <a className="button light" href="#notices">View Notices</a>
            <a className="button ghost" href="#explore">Explore Dambulla</a>
          </div>
        </div>
        <div className="mist" aria-hidden="true" />
      </section>

      <section className="quick-actions section-shell" aria-label="Quick public service actions">
        {['Pay Rates Soon', 'Download Forms', 'Submit Request', 'View Notices'].map((item) => (
          <a key={item} href={item.includes('Soon') ? '#online' : '#services'}>
            <span>{item.slice(0, 2).toUpperCase()}</span>
            {item}
          </a>
        ))}
      </section>

      <section id="search" className="service-search section-shell reveal" aria-labelledby="search-title">
        <div>
          <p className="eyebrow">Public service support</p>
          <h2 id="search-title">Find the right council service</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor.
          </p>
        </div>
        <form onSubmit={(event) => event.preventDefault()} role="search">
          <label htmlFor="service-search">Search services, forms, notices, and support</label>
          <div>
            <input id="service-search" type="search" placeholder="Search by service or form" />
            <button className="button primary" type="submit">Search</button>
          </div>
        </form>
      </section>

      <section id="council" className="institution section-shell reveal" aria-labelledby="institution-title">
        <div className="section-heading">
          <p className="eyebrow">Institutional direction</p>
          <h2 id="institution-title">Vision, Mission, and 2030 Goals</h2>
        </div>
        {[
          ['Vision', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum.'],
          ['Mission', 'Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta.'],
          ['2030 Goals', 'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.'],
        ].map(([title, text]) => (
          <article key={title}>
            <span>{title === '2030 Goals' ? '30' : title.slice(0, 1)}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <ul>
              <li>Lorem ipsum public value</li>
              <li>Curabitur service quality</li>
              <li>Vestibulum sustainable growth</li>
            </ul>
          </article>
        ))}
      </section>

      <section className="message-section section-shell reveal" aria-labelledby="chairman-title">
        <Placeholder label="Chairman's Photograph" />
        <div>
          <p className="eyebrow">Council leadership</p>
          <h2 id="chairman-title">Chairman&apos;s Message</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula.
          </p>
          <p>
            Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Vestibulum id ligula porta felis
            euismod semper.
          </p>
        </div>
      </section>

      <section className="message-section alternate section-shell reveal" aria-labelledby="secretary-title">
        <div>
          <p className="eyebrow">Administrative leadership</p>
          <h2 id="secretary-title">Secretary&apos;s Message</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta sem malesuada magna mollis
            euismod. Integer posuere erat a ante venenatis dapibus.
          </p>
          <p>
            Donec ullamcorper nulla non metus auctor fringilla. Sed posuere consectetur est at lobortis.
          </p>
        </div>
        <Placeholder label="Secretary's Photograph" />
      </section>

      <section id="services" className="services section-shell reveal" aria-labelledby="services-title">
        <div className="section-heading compact">
          <p className="eyebrow">Public services</p>
          <h2 id="services-title">Council services for residents and businesses</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis.</p>
        </div>
        <div className="service-grid">
          {services.map(([title, text, mark]) => (
            <a key={title} href="#contact">
              <span>{mark}</span>
              <strong>{title}</strong>
              <small>{text}</small>
            </a>
          ))}
        </div>
      </section>

      <section id="notices" className="official-info section-shell reveal" aria-labelledby="notices-title">
        <div className="section-heading">
          <p className="eyebrow">Official information</p>
          <h2 id="notices-title">Latest Notices</h2>
          <a href="#contact">View all</a>
        </div>
        <div className="info-list">
          {notices.map(([type, title, meta]) => (
            <article key={title}>
              <span>{type}</span>
              <h3>{title}</h3>
              <p>{meta}</p>
              <button type="button">Read notice</button>
            </article>
          ))}
        </div>
      </section>

      <section className="split-info section-shell reveal" aria-labelledby="tenders-title">
        <div>
          <div className="section-heading left">
            <p className="eyebrow">Procurement</p>
            <h2 id="tenders-title">Tender Notices</h2>
          </div>
          <div className="info-list tight">
            {tenders.map(([type, title, meta]) => (
              <article key={title}>
                <span>{type}</span>
                <h3>{title}</h3>
                <p>{meta}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <div className="section-heading left">
            <p className="eyebrow">Calendar</p>
            <h2>Upcoming Events</h2>
          </div>
          <div className="calendar-list">
            {events.map(([title, text, date]) => (
              <article key={title}>
                <time>{date}</time>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="projects section-shell reveal" aria-labelledby="projects-title">
        <div className="section-heading compact">
          <p className="eyebrow">Development</p>
          <h2 id="projects-title">Development Projects</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed.</p>
        </div>
        <div className="project-grid">
          {[1, 2, 3].map((item) => (
            <article key={item}>
              <Placeholder label="Project Image" wide />
              <span>Project Category</span>
              <h3>Lorem ipsum development project</h3>
              <p>Nulla vitae elit libero, a pharetra augue. Donec sed odio dui.</p>
            </article>
          ))}
        </div>
      </section>

      <section id="online" className="online-grid section-shell reveal" aria-label="Online services coming soon">
        <article className="online-card payments">
          <span className="status">Coming Soon</span>
          <h2>Online Payments</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Future council charges and selected fees
            will be represented here when available.
          </p>
          <button className="button primary" type="button" onClick={() => openModal('Online Payments')}>
            View status
          </button>
        </article>
        <article className="online-card booking">
          <span className="status">Coming Soon</span>
          <h2>Online Booking</h2>
          <p>
            Curabitur blandit tempus porttitor. Future access to selected facilities, appointments, and visitor
            services will be represented here.
          </p>
          <button className="button primary green" type="button" onClick={() => openModal('Online Booking')}>
            View status
          </button>
        </article>
      </section>

      <section className="downloads section-shell reveal" aria-labelledby="downloads-title">
        <div>
          <p className="eyebrow">Downloads</p>
          <h2 id="downloads-title">Application forms and documents</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue.</p>
        </div>
        <div className="download-list">
          {downloads.map((item) => (
            <button key={item} type="button">
              <span>PDF</span>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section id="explore" className="explore section-shell reveal" aria-labelledby="explore-title">
        <div className="explore-copy">
          <p className="eyebrow">Explore Dambulla</p>
          <h2 id="explore-title">A civic gateway shaped by heritage, landscape, and local life</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.
            Vestibulum id ligula porta felis euismod semper.
          </p>
        </div>
        <div className="explore-art" aria-hidden="true">
          <img src="/assets/sigiriya-cutout.png" alt="" />
        </div>
      </section>

      <section className="heritage-story section-shell reveal" aria-labelledby="heritage-title">
        <img className="heritage-left" src="/assets/heritage-offering-left.png" alt="Heritage artwork with offering tray" />
        <div>
          <p className="eyebrow">Heritage story</p>
          <h2 id="heritage-title">Sacred heritage and cultural continuity</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi leo risus, porta ac consectetur ac,
            vestibulum at eros. Praesent commodo cursus magna.
          </p>
          <a className="button light" href="#culture">Discover culture</a>
        </div>
        <img className="heritage-right" src="/assets/heritage-offering-right.png" alt="Heritage artwork placing flowers" />
      </section>

      <section id="culture" className="tourism section-shell reveal" aria-labelledby="tourism-title">
        <div className="section-heading compact">
          <p className="eyebrow">Destination discovery</p>
          <h2 id="tourism-title">Dambulla experiences</h2>
        </div>
        <div className="tourism-grid">
          {[
            ['Sacred Heritage', '/assets/rock-fortress-close.png'],
            ['Nature and Adventure', '/assets/nature-elephants.png'],
            ['Culture and Local Life', '/assets/culture-crafts.png'],
          ].map(([title, image]) => (
            <article key={title}>
              <img src={image} alt={`${title} in Dambulla`} loading="lazy" />
              <div>
                <h3>{title}</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </article>
          ))}
        </div>
        <div className="culture-strip">
          <img src="/assets/culture-dancers.png" alt="Traditional cultural dancers" loading="lazy" />
          <img src="/assets/local-cuisine.png" alt="Traditional local cuisine on banana leaf" loading="lazy" />
          <img src="/assets/heritage-water-garden.png" alt="Dambulla heritage water garden" loading="lazy" />
          <img src="/assets/ancient-city.png" alt="Historic cultural landscape" loading="lazy" />
          <img src="/assets/heritage-figure.png" alt="Traditional heritage artwork" loading="lazy" />
          <img src="/assets/sigiriya-panorama-cutout.png" alt="Panoramic Dambulla landscape" loading="lazy" />
        </div>
      </section>

      <section id="contact" className="contact section-shell reveal" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">Council contact and public assistance</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Official
            contact details are intentionally reserved for final content.
          </p>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            Your message
            <textarea placeholder="Presentation-only message area" />
          </label>
          <button className="button primary" type="submit">Send enquiry</button>
        </form>
      </section>

      <footer className="footer reveal">
        <div className="section-shell footer-grid">
          <div>
            <Placeholder label="Official Logo" />
            <h2>Dambulla Pradeshiya Sabha</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ullamcorper nulla non metus.</p>
          </div>
          {['Council', 'Services', 'Information', 'Explore'].map((group) => (
            <nav key={group} aria-label={`${group} footer links`}>
              <h3>{group}</h3>
              <a href="#council">Lorem ipsum</a>
              <a href="#services">Public services</a>
              <a href="#notices">Official notices</a>
            </nav>
          ))}
        </div>
      </footer>

      <ComingSoonModal modal={modal} onClose={() => setModal(null)} />
    </main>
  );
}
