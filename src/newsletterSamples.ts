import { selectSampleIds } from '../newsletter-samples.mjs';
import { newsletterConfig } from '../newsletter.config.mjs';
import { sketches } from './data/sketches';

const publishedIds = sketches.filter(sketch => sketch.status === 'published').map(sketch => sketch.id);
const byDocument = new WeakMap<Document, readonly number[]>();

/** SSR uses fixed fallback cards; hydration reads the parser's matching choice. */
export function getNewsletterSampleIds(doc = typeof document === 'undefined' ? undefined : document): readonly number[] {
  if (!doc) return newsletterConfig.sampleEpisodeIds;
  const previous = byDocument.get(doc);
  if (previous) return previous;
  const section = doc.querySelector<HTMLElement>('[data-newsletter-sample-ids]');
  const seeded = section?.dataset.newsletterSampleIds?.split(',').map(Number);
  const valid = seeded?.length === 2 && new Set(seeded).size === 2 && seeded.every(id => publishedIds.includes(id));
  const ids = section
    ? valid ? seeded! : newsletterConfig.sampleEpisodeIds
    : selectSampleIds(publishedIds);
  byDocument.set(doc, ids);
  return ids;
}
