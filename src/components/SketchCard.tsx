import { useCallback, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Sketch } from '../data/sketches';
import { useAsciiImage } from '../hooks/useAsciiImage';

export default function SketchCard({ sketch, priority }: { sketch: Sketch; priority: boolean }) {
  const src = sketch.status === 'published' ? sketch.image : undefined;
  const [failedSrc, setFailedSrc] = useState<string>();
  const unavailable = useCallback(() => setFailedSrc(src), [src]);
  // Download priority does not change whether a published preview can reveal.
  const { containerRef, imageRef, placeholderRef } = useAsciiImage(src, unavailable);
  const failed = src !== undefined && failedSrc === src;
  const number = String(sketch.id).padStart(2, '0');

  if (sketch.status === 'upcoming') {
    return (
      <article className="sketch-card teaser" aria-labelledby={`episode-${sketch.id}`}>
        <div className="sketch-image teaser-image" aria-hidden="true">
          <span className="teaser-number">{number}</span>
          <span className="teaser-question">???</span>
          <span className="teaser-line" />
        </div>
        <div className="card-copy">
          <p className="card-meta">Episode {number}<span aria-hidden="true">/</span>{sketch.date}</p>
          <h2 id={`episode-${sketch.id}`}>{sketch.teaserTitle}</h2>
          <p className="card-lesson">{sketch.teaserDescription}</p>
          <span className="card-action text-muted">Planned episode</span>
        </div>
      </article>
    );
  }

  return (
    <article className="sketch-card sketch-card-live">
      <a className="card-link" href={sketch.href} target="_blank" rel="noopener noreferrer" aria-labelledby={`episode-${sketch.id}`}>
        <div ref={containerRef} className="sketch-image ascii-image" data-ascii-image="">
          {failed ? <div className="image-fallback" role="img" aria-label={sketch.imageAlt}>
            <span>Diagram preview unavailable</span><span className="text-accent">Open the original LinkedIn post <ArrowUpRight size={16} /></span>
          </div> : <img
            ref={imageRef} src={sketch.image} alt={sketch.imageAlt} width={1080} height={1350}
            loading={priority ? 'eager' : 'lazy'} {...{ fetchpriority: priority ? 'high' : 'auto' }}
            decoding="async"
          />}
          <div ref={placeholderRef} className="ascii-image-placeholder" hidden aria-hidden="true" />
        </div>
        <div className="card-copy">
          <p className="card-meta">Episode {number}<span aria-hidden="true">/</span>{sketch.date}</p>
          <h2 id={`episode-${sketch.id}`}>{sketch.title}</h2>
          <p className="card-lesson">{sketch.lesson}</p>
          <span className="card-action">View the original post <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> on LinkedIn (opens in a new tab)</span></span>
        </div>
      </a>
      <div className="card-secondary-action">
        <a className="read-lesson" href={sketch.lessonPath}>Read lesson <span aria-hidden="true">→</span></a>
      </div>
    </article>
  );
}
