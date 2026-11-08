/** A partial Fisher-Yates shuffle: unique published IDs, no storage or timers. */
export function selectSampleIds(ids, count = 2, random = Math.random) {
  const pool = [...new Set(ids)];
  const limit = Math.max(0, Math.min(Math.trunc(count), pool.length));
  for (let i = 0; i < limit; i++) {
    const next = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[next]] = [pool[next], pool[i]];
  }
  return pool.slice(0, limit);
}

// Only the sample list waits for the synchronous parser bootstrap. Native HTML
// is visible by default, and a failed/late script must retain that fallback.
export const newsletterSampleBootScript = `(() => {
  document.documentElement.dataset.newsletterSamples = 'pending';
  window.__newsletterSamplesTimer = window.setTimeout(() => {
    delete document.documentElement.dataset.newsletterSamples;
  }, 5000);
})();`;

/** Serialized after the SSR root, before the deferred React entry runs. */
export function bootstrapNewsletterSamples(catalog, selectIds, doc = globalThis.document) {
  if (doc.documentElement.dataset.newsletterSamples !== 'pending') return false;
  try {
    const section = doc.querySelector('[data-newsletter-sample-ids]');
    const list = section?.querySelector('ul');
    if (!list?.replaceChildren || list.children.length !== 2) return false;
    const ids = selectIds(catalog.map(sketch => sketch.id), 2);
    if (ids.length !== 2 || new Set(ids).size !== 2) return false;
    // Prepare detached clones first; errors cannot partially replace live cards.
    const cards = ids.map((id, index) => {
      const sketch = catalog.find(entry => entry.id === id);
      const card = list.children[index].cloneNode(true);
      const link = card.querySelector('.newsletter-sample');
      const image = card.querySelector('img');
      const title = card.querySelector('h3');
      if (!sketch || !link || !image || !title) throw new Error('Invalid sample card');
      card.setAttribute('data-newsletter-episode', String(id));
      link.setAttribute('href', sketch.lessonPath);
      image.setAttribute('src', sketch.image);
      image.setAttribute('alt', sketch.imageAlt);
      title.textContent = sketch.title;
      return card;
    });
    list.replaceChildren(...cards);
    section.setAttribute('data-newsletter-sample-ids', ids.join(','));
    return true;
  } catch {
    return false;
  } finally {
    delete doc.documentElement.dataset.newsletterSamples;
    doc.defaultView.clearTimeout(doc.defaultView.__newsletterSamplesTimer);
  }
}
