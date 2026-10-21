import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { newsletterConfig } from '../../newsletter.config.mjs';
import { siteConfig } from '../../site.config.mjs';
import { findPublishedSketch } from '../data/sketches';
import NewsletterForm from './NewsletterForm';

export default function NewsletterPage() {
  return (
    <main id="main-content" className="newsletter-page" tabIndex={-1}>
      <a className="back-to-gallery" href="/"><ArrowLeft size={17} aria-hidden="true" />Back to gallery</a>
      <div className="newsletter-layout"><header className="newsletter-intro">
        <p className="eyebrow">The Data Sketch newsletter</p>
        <h1>Data Sketch,<br /><span>in your inbox.</span></h1>
        <p className="hero-intro">{newsletterConfig.intro}</p>
      </header>
      <NewsletterForm /></div>
      <div className="newsletter-details">
      <section className="newsletter-samples" aria-labelledby="samples-heading">
        <h2 id="samples-heading">A look inside the sketchbook</h2>
        <p>Read a lesson before you subscribe.</p>
        <ul>
          {newsletterConfig.sampleEpisodeIds.map(id => {
            const sketch = findPublishedSketch(id);
            if (!sketch) throw new Error(`Newsletter sample episode ${id} is missing`);
            return <li key={id}><a href={sketch.lessonPath}><span><span className="eyebrow">Episode {String(id).padStart(2, '0')}</span><span className="newsletter-sample-title">{sketch.title}</span></span><ArrowUpRight size={20} aria-hidden="true" /></a></li>;
          })}
        </ul>
      </section>
      <section className="newsletter-author" aria-labelledby="author-heading">
        <h2 id="author-heading">Written by Mario Caesar</h2>
        <p>I’m a data engineer. I draw the checks and workflows behind SQL and data pipelines, then explain the reasoning in a short lesson.</p>
        <a className="back-to-gallery" href={siteConfig.portfolioUrl}>More about Mario<ArrowUpRight size={16} aria-hidden="true" /></a>
      </section>
      </div>
    </main>
  );
}
