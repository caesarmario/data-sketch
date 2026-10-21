import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { calculateRouteLastmod } from '../scripts/content-dates.mjs';
import { loadTypeScriptModule } from '../scripts/load-typescript-module.mjs';
import { generateFiles, renderHead, renderNotFound, routeLastmod } from '../scripts/seo.mjs';
import { routeManifest } from '../site.routes.mjs';
import { siteConfig } from '../site.config.mjs';

const { sketches } = await loadTypeScriptModule(process.cwd(), 'src/data/sketches.ts');
const gallery = routeManifest.find(route => route.kind === 'gallery');
const lessons = routeManifest.filter(route => route.kind === 'lesson');
const pngDimensions = bytes => {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
};
const digest = value => createHash('sha256').update(value).digest('hex');
const schemaGraph = head => JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

test('editorial dates describe website updates without changing publication months', () => {
  for (const sketch of sketches.filter(entry => entry.status === 'published')) {
    assert.equal(sketch.modifiedAt, '2026-10-21');
    assert.match(sketch.dateTime, /^\d{4}-\d{2}$/);
    const route = lessons.find(entry => entry.episodeId === sketch.id);
    assert.equal(routeLastmod(route), sketch.modifiedAt);
    const article = schemaGraph(renderHead({ route, preview: false })).find(entry => entry['@type'] === 'Article');
    assert.equal(article.dateModified, sketch.modifiedAt);
    assert.equal(article.datePublished, undefined);
  }
});

test('updating one episode changes only its lesson and the gallery lastmod', () => {
  const before = routeManifest.map(route => calculateRouteLastmod(route, sketches, siteConfig.contentUpdated));
  const changed = sketches.map(sketch => sketch.id === 9 ? { ...sketch, modifiedAt: '2026-10-22' } : sketch);
  const after = routeManifest.map(route => calculateRouteLastmod(route, changed, siteConfig.contentUpdated));
  assert.deepEqual(routeManifest.filter((route, index) => before[index] !== after[index]).map(route => route.path), ['/', '/sketches/partitioning/']);
  for (const lesson of lessons) {
    assert.equal(calculateRouteLastmod(lesson, sketches, '2026-10-21'), routeLastmod(lesson));
  }
  const futureTeaser = [...sketches, { id: 12, status: 'upcoming', modifiedAt: '2099-01-01' }];
  assert.equal(calculateRouteLastmod(gallery, futureTeaser, siteConfig.contentUpdated), '2026-10-21');
});

test('editorial dates fail closed for missing, impossible or imprecise values', () => {
  const route = lessons[0];
  for (const date of [undefined, '', '2026-10', '2026-02-30', '2026-13-01', '2026-10-19T00:00:00Z']) {
    const changed = sketches.map(sketch => sketch.id === route.episodeId ? { ...sketch, modifiedAt: date } : sketch);
    assert.throws(() => calculateRouteLastmod(route, changed, siteConfig.contentUpdated));
  }
  assert.throws(() => calculateRouteLastmod({ kind: 'lesson', episodeId: 10 }, sketches, siteConfig.contentUpdated));
  assert.throws(() => calculateRouteLastmod({ kind: 'unknown' }, sketches, siteConfig.contentUpdated));
});

test('gallery configuration supplies the intro and all metadata descriptions', () => {
  assert.equal(gallery.title, siteConfig.title);
  assert.equal(gallery.description, siteConfig.description);
  const head = renderHead({ route: gallery, preview: false });
  for (const key of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    assert.ok(head.includes(`<meta ${key} content="${siteConfig.description}"`));
  }
  const collection = schemaGraph(head).find(entry => entry['@type'] === 'CollectionPage');
  assert.equal(collection.description, siteConfig.description);
  const files = generateFiles();
  assert.ok(files['index.md'].includes(`> ${siteConfig.description}`));
  assert.ok(files['llms.txt'].includes(`> ${siteConfig.description}`));
  assert.ok(fs.readFileSync('dist/index.html', 'utf8').includes(siteConfig.intro));
});

test('image sitemap retains discovery without deprecated caption tags', () => {
  const xml = generateFiles()['sitemap.xml'];
  assert.equal((xml.match(/<loc>/g) ?? []).length, 12);
  assert.equal((xml.match(/<image:loc>/g) ?? []).length, 20);
  assert.ok(!xml.includes('<image:caption>'));
  for (const lesson of lessons) {
    assert.ok(xml.includes(`<loc>${siteConfig.baseUrl}${lesson.path}</loc><lastmod>${routeLastmod(lesson)}</lastmod>`));
    const graph = schemaGraph(renderHead({ route: lesson, preview: false }));
    assert.ok(graph.find(entry => entry['@type'] === 'ImageObject')?.caption);
  }
});

test('all pages and the static 404 advertise only the new icon family', () => {
  const heads = [...routeManifest.map(route => renderHead({ route, preview: false })), renderNotFound()];
  for (const head of heads) {
    for (const file of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-96x96.png', 'apple-touch-icon.png']) {
      assert.ok(head.includes(`href="/${file}"`));
    }
    assert.ok(!head.includes('href="/favicon.svg"'));
  }
});

test('brand sources, PNG dimensions and real ICO frame offsets match their manifest', () => {
  const manifest = JSON.parse(fs.readFileSync('design/brand/manifest.json', 'utf8'));
  for (const source of Object.values(manifest.sources)) {
    const bytes = fs.readFileSync(`design/brand/${source.file}`);
    assert.deepEqual(pngDimensions(bytes), [source.width, source.height]);
    assert.equal(digest(bytes), source.sha256);
  }
  assert.deepEqual(pngDimensions(fs.readFileSync('design/brand/favicon-master.png')), [512, 512]);
  for (const size of [16, 32, 96]) assert.deepEqual(pngDimensions(fs.readFileSync(`public/favicon-${size}x${size}.png`)), [size, size]);
  assert.deepEqual(pngDimensions(fs.readFileSync('public/apple-touch-icon.png')), [180, 180]);
  const og = fs.readFileSync('public/og-image.png');
  assert.deepEqual(pngDimensions(og), [1200, 630]);
  assert.equal(digest(og), manifest.og.sha256);
  const ico = fs.readFileSync('public/favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  let previousEnd = 6 + 16 * 3;
  [16, 32, 48].forEach((size, index) => {
    const entry = 6 + index * 16;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    assert.equal(ico.readUInt16LE(entry + 4), 1);
    assert.equal(ico.readUInt16LE(entry + 6), 32);
    assert.equal(offset, previousEnd);
    assert.deepEqual(pngDimensions(ico.subarray(offset, offset + length)), [size, size]);
    previousEnd = offset + length;
  });
  assert.equal(previousEnd, ico.length);
});

test('gallery uses the new OG card while every lesson retains its own diagram', () => {
  const galleryHead = renderHead({ route: gallery, preview: false });
  assert.ok(galleryHead.includes(`property="og:image" content="${siteConfig.baseUrl}/og-image.png"`));
  assert.ok(galleryHead.includes('property="og:image:width" content="1200"'));
  for (const route of lessons) {
    const sketch = sketches.find(entry => entry.id === route.episodeId);
    const head = renderHead({ route, preview: false });
    assert.ok(head.includes(`property="og:image" content="${siteConfig.baseUrl}${sketch.image}"`));
    assert.ok(head.includes('property="og:image:width" content="1080"'));
    assert.ok(head.includes('property="og:image:height" content="1350"'));
  }
});

test('minimal 404 is static, locally branded, font-complete and noindex', () => {
  const html = renderNotFound();
  assert.ok(html.includes('DATA SKETCH / 404'));
  assert.ok(html.includes('<h1 id="not-found-heading">Page not found</h1>'));
  assert.ok(html.includes('<a href="/">Back to gallery</a>'));
  assert.ok(html.includes('noindex, nofollow'));
  assert.equal((html.match(/@font-face/g) ?? []).length, 2);
  for (const file of siteConfig.fontPreloads) assert.ok(fs.existsSync(`public${file}`));
  assert.ok(html.includes('Space Grotesk'));
  assert.ok(html.includes('a:focus-visible'));
  assert.ok(html.includes('min-height: 44px'));
  assert.ok(!html.includes('<script'));
  assert.ok(!html.includes('rel="canonical"'));
  const normalize = value => value.replaceAll('\r\n', '\n');
  assert.equal(normalize(fs.readFileSync('dist/404.html', 'utf8')), normalize(html));
  assert.ok(generateFiles()['_headers'].includes('/404.html\n  X-Robots-Tag: noindex, nofollow'));
});
