import { ArrowUpRight } from 'lucide-react';
import { newsletterConfig } from '../../newsletter.config.mjs';
import { siteConfig } from '../../site.config.mjs';
import { findPublishedSketch } from '../data/sketches';
import NewsletterForm from './NewsletterForm';

export default function NewsletterPage() {
  return (
    <main id="main-content" className="newsletter-page newsletter-landing" tabIndex={-1}>
      <header className="newsletter-intro">
        <h1>{newsletterConfig.heading}</h1>
        <p className="hero-intro">{newsletterConfig.intro}</p>
        <p className="newsletter-frequency">{newsletterConfig.frequency}</p>
      </header>
      <NewsletterForm />
      <section className="newsletter-samples" aria-labelledby="samples-heading">
        <h2 id="samples-heading">{newsletterConfig.samplesHeading}</h2>
        <ul>
          {newsletterConfig.sampleEpisodeIds.map(id => {
            const sketch = findPublishedSketch(id);
            if (!sketch) throw new Error(`Newsletter sample episode ${id} is missing`);
            return (
              <li key={id}>
                <a className="newsletter-sample" href={sketch.lessonPath}>
                  <img src={sketch.image} alt={sketch.imageAlt} width={1080} height={1350} loading="lazy" decoding="async" />
                  <h3>{sketch.title}</h3>
                  <span className="newsletter-sample-action">Read lesson<ArrowUpRight size={16} aria-hidden="true" /></span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
      <a className="newsletter-about" href={siteConfig.portfolioUrl}>{newsletterConfig.authorLink}<ArrowUpRight size={16} aria-hidden="true" /></a>
    </main>
  );
}
