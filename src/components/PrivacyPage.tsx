import { ArrowLeft } from 'lucide-react';
import { newsletterConfig } from '../../newsletter.config.mjs';

export default function PrivacyPage() {
  return (
    <main id="main-content" className="newsletter-page privacy-page" tabIndex={-1}>
      <a className="back-to-gallery" href={newsletterConfig.path}><ArrowLeft size={17} aria-hidden="true" />Back to newsletter</a>
      <header className="newsletter-intro">
        <p className="eyebrow">Data Sketch</p>
        <h1>Newsletter privacy</h1>
        <p className="hero-intro">This page explains how Mario Caesar uses information for Data Sketch subscriptions.</p>
        <p className="privacy-updated">Updated <time dateTime={newsletterConfig.privacyModifiedAt}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${newsletterConfig.privacyModifiedAt}T00:00:00Z`))}</time></p>
      </header>
      {newsletterConfig.privacySections.map(section => <section className="privacy-section" key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
      <p className="privacy-links"><a href="https://www.beehiiv.com/privacy">beehiiv privacy policy</a><a href="https://www.cloudflare.com/privacypolicy/">Cloudflare privacy policy</a><a href={`mailto:${newsletterConfig.contact}`}>Contact Mario about your information</a></p>
    </main>
  );
}
