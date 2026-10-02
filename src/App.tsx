import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Clock3, Globe, ListOrdered } from 'lucide-react';
import { siteConfig } from '../site.config.mjs';
import { routeManifest } from '../site.routes.mjs';
import { findPublishedSketch, sketches, sortSketches, type PublishedSketch, type SortOrder } from './data/sketches';
import BackToTop from './components/BackToTop';
import SketchCard from './components/SketchCard';
import Spotlight from './components/Spotlight';
import UtilityLinks from './components/UtilityLinks';
import { LinkedInIcon, GitHubIcon, MediumIcon, EmailIcon, XIcon } from './components/SocialIcons';

const socials = [
  { label: 'LinkedIn', href: `${siteConfig.portfolioUrl}/linkedin`, Icon: LinkedInIcon },
  { label: 'GitHub', href: `${siteConfig.portfolioUrl}/github`, Icon: GitHubIcon },
  { label: 'Medium', href: `${siteConfig.portfolioUrl}/medium`, Icon: MediumIcon },
  { label: 'Email', href: 'mailto:hello@caesarmar.io', Icon: EmailIcon },
  { label: 'X', href: `${siteConfig.portfolioUrl}/x`, Icon: XIcon },
];

type SiteRoute = (typeof routeManifest)[number];

function Header() {
  return (
    <header className="masthead">
      <a href="/" aria-label="Data Sketch home" className="brand">
        <img src="/brand/data-sketch-wordmark.png" alt="Data Sketch" width={2145} height={186} />
      </a>
      <a href={siteConfig.portfolioUrl} className="portfolio-link"><Globe size={16} aria-hidden="true" />Visit my website</a>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-invitation">
        <h2>More sketches coming soon...</h2>
        <a className="follow-link" href={`${siteConfig.portfolioUrl}/linkedin`} target="_blank" rel="noopener noreferrer">Follow on LinkedIn <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
      </div>
      <div className="footer-bottom">
        <p className="footer-credit">Made by <a className="footer-author" href={siteConfig.portfolioUrl}>Mario Caesar</a></p>
        <nav aria-label="Mario Caesar social profiles" className="socials">
          {socials.map(({ label, href, Icon }) => <a key={label} href={href} aria-label={label === 'Email' ? label : `${label} (opens in a new tab)`} target={label === 'Email' ? undefined : '_blank'} rel={label === 'Email' ? undefined : 'noopener noreferrer'}><Icon className="size-5" /></a>)}
        </nav>
      </div>
    </footer>
  );
}

function GalleryPage() {
  const [order, setOrder] = useState<SortOrder>('oldest');
  const [interactive, setInteractive] = useState(false);
  const published = sketches.filter(sketch => sketch.status === 'published').length;
  const visible = sortSketches(sketches, order);
  useEffect(() => setInteractive(true), []);

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow">Visual notes by Mario Caesar</p>
          <h1 id="hero-heading" data-lcp-candidate="data-sketch-intro">One diagram.<br /><span>One practical lesson.</span></h1>
          <p className="hero-intro">Visual notes on pipelines, SQL, warehouses, and data quality from my work in data engineering.</p>
        </div>
        <div className="hero-aside">
          <p className="episode-count"><span>{published} published</span><span aria-hidden="true"> · </span><span>{sketches.length - published} upcoming</span></p>
        </div>
      </section>
      <section id="gallery" aria-labelledby="gallery-heading" tabIndex={-1}>
        <div className="gallery-toolbar">
          <h2 id="gallery-heading" className="eyebrow">The sketchbook <span className="text-muted">/ {String(sketches.length).padStart(2, '0')}</span></h2>
          <div className="sort-controls" role="group" aria-label="Episode sort order">
            <button type="button" disabled={!interactive} aria-pressed={order === 'oldest'} onClick={() => setOrder('oldest')}><ListOrdered size={14} aria-hidden="true" />Episode order</button>
            <button type="button" disabled={!interactive} aria-pressed={order === 'latest'} onClick={() => setOrder('latest')}><Clock3 size={14} aria-hidden="true" />Latest first</button>
          </div>
        </div>
        <p className="sr-only" role="status">{order === 'oldest' ? 'Episode order, oldest first' : 'Latest episodes first'}</p>
        <ol className="gallery-grid">
          {visible.map((sketch, index) => <li key={sketch.id}><SketchCard sketch={sketch} priority={index === 0 && sketch.status === 'published'} /></li>)}
        </ol>
      </section>
    </main>
  );
}

type LessonSketch = PublishedSketch & { id: number; title: string; lesson: string; category: string };

function LessonPage({ sketch }: { sketch: LessonSketch }) {
  const number = String(sketch.id).padStart(2, '0');
  return (
    <main id="main-content" className="lesson-page" tabIndex={-1}>
      <a className="back-to-gallery" href="/"><ArrowLeft size={17} aria-hidden="true" />Back to gallery</a>
      <article aria-labelledby="lesson-heading">
        <header className="lesson-header">
          <p className="eyebrow">Episode {number} / {sketch.category}</p>
          <h1 id="lesson-heading">{sketch.title}</h1>
          <p className="lesson-summary">{sketch.lesson}</p>
          <p className="lesson-byline">By <a href={siteConfig.portfolioUrl}>Mario Caesar</a><span aria-hidden="true"> · </span><time dateTime={sketch.dateTime}>{sketch.month}</time></p>
        </header>
        <figure className="lesson-figure">
          <img src={sketch.image} alt={sketch.imageAlt} width={1080} height={1350} decoding="async" {...{ fetchpriority: 'high' }} />
        </figure>
        <section className="lesson-walkthrough" aria-labelledby="walkthrough-heading">
          <h2 id="walkthrough-heading">Reading the sketch</h2>
          <ol>
            {sketch.walkthrough.map(({ heading, body }) => <li key={heading}><h3>{heading}</h3><p>{body}</p></li>)}
          </ol>
        </section>
        <aside className="lesson-takeaway" aria-labelledby="takeaway-heading">
          <h2 id="takeaway-heading">Takeaway</h2>
          <p>{sketch.takeaway}</p>
        </aside>
        <a className="original-post-link" href={sketch.href} target="_blank" rel="noopener noreferrer">View the original LinkedIn post <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
      </article>
    </main>
  );
}

export default function App({ route }: { route: SiteRoute }) {
  let content;
  if (route.kind === 'gallery') content = <GalleryPage />;
  else {
    const sketch = findPublishedSketch(route.episodeId);
    if (!sketch) throw new Error(`Published episode ${route.episodeId} is missing`);
    content = <LessonPage sketch={sketch} />;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Spotlight />
      <div className="site-shell">
        <Header />
        {content}
        <Footer />
      </div>
      <UtilityLinks />
      <BackToTop />
    </>
  );
}
