function editorialDate(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Missing or invalid editorial date for ${label}`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid calendar date for ${label}: ${value}`);
  }
  return value;
}

// Publication months and filesystem/Git timestamps do not describe editorial changes.
export function calculateRouteLastmod(route, sketches, galleryUpdated) {
  const published = sketches.filter(sketch => sketch.status === 'published');
  if (route.kind === 'lesson') {
    const sketch = published.find(entry => entry.id === route.episodeId);
    if (!sketch) throw new Error(`Published episode ${route.episodeId} is missing`);
    return editorialDate(sketch.modifiedAt, `episode ${sketch.id}`);
  }
  if (route.kind !== 'gallery') throw new Error(`Unknown route kind: ${route.kind}`);
  return [
    editorialDate(galleryUpdated, 'gallery'),
    ...published.map(sketch => editorialDate(sketch.modifiedAt, `episode ${sketch.id}`)),
  ].reduce((latest, date) => date > latest ? date : latest);
}
