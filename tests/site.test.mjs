import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { createServer } from 'vite';
import { generateFiles, isPreview, renderHead } from '../scripts/seo.mjs';
import { siteConfig } from '../site.config.mjs';
import { routeAliases, routeManifest } from '../site.routes.mjs';

let server;
let data;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  data = await server.ssrLoadModule('/src/data/sketches.ts');
});
after(async () => { await server?.close(); });

test('eleven ordered episodes include nine published lessons and two asset-free teasers', () => {
  assert.deepEqual(data.sketches.map(sketch => sketch.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const published = data.sketches.filter(sketch => sketch.status === 'published');
  assert.equal(published.length, 9);
  assert.deepEqual(data.sketches.filter(sketch => sketch.status === 'upcoming').map(sketch => sketch.id), [10, 11]);
  for (const sketch of data.sketches) {
    if (sketch.status === 'upcoming') {
      assert.equal(sketch.image, undefined);
      assert.equal(sketch.href, undefined);
      assert.equal(sketch.lessonPath, undefined);
    } else {
      const source = new URL(sketch.href);
      assert.equal(source.protocol, 'https:');
      assert.ok(['www.linkedin.com', 'lnkd.in'].includes(source.hostname));
      assert.ok(fs.existsSync(`public${sketch.image}`));
      assert.ok(routeManifest.some(route => route.kind === 'lesson' && route.path === sketch.lessonPath && route.episodeId === sketch.id));
      assert.match(sketch.dateTime, /^2026-(0[3-9]|10)$/);
      assert.ok(sketch.walkthrough.length >= 3);
    }
  }
  assert.deepEqual(fs.readdirSync('public/images/data-sketch').sort(), ['01', '02', '03', '04', '05', '06', '07', '08', '09'].map(number => `data-sketch-episode-${number}.jpg`));
});

test('episodes 01-04 keep their original content, URLs and image bytes', () => {
  const digest = value => createHash('sha256').update(value).digest('hex');
  const originalContent = data.sketches.slice(0, 4).map(sketch => Object.fromEntries(Object.entries(sketch).filter(([key]) => key !== 'modifiedAt')));
  assert.equal(digest(JSON.stringify(originalContent)), '7aca03a7bf33e9b9362e0fde15c975333ce4bcbf8565bebb5d7ad32f422ee237');
  const imageHashes = [
    '6596a6f7087a52c54cb42742de4f4a4364aa33f8f2890cd29a59583c93bcffc4',
    'a0014dd170381847fb519ec1f7c715ce1430dc6f850db2a70e6598befd039a84',
    'daeafcc40d15eab70507597148ec8acac2c76c616307cb538c477604b4ca56fc',
    'e056173ec39f6738853e2cd6cb6bbf24dd23395564fef37e3e6bad25b550d464',
  ];
  data.sketches.slice(0, 4).forEach((sketch, index) => {
    assert.equal(digest(fs.readFileSync(`public${sketch.image}`)), imageHashes[index]);
  });
});

test('new episodes match the supplied image numbers, month precision and exact LinkedIn shortlinks', () => {
  const expected = [
    [5, 'Safe Publish Pattern Flow', '2026-07', 'July 2026', '/sketches/safe-publish-pattern/', 'https://lnkd.in/p/g7Qw3Uvf'],
    [6, 'A Simple Reconciliation Workflow', '2026-08', 'August 2026', '/sketches/reconciliation-workflow/', 'https://lnkd.in/p/gEqAwxzN'],
    [7, 'Late-Arriving Data', '2026-08', 'August 2026', '/sketches/late-arriving-data/', 'https://lnkd.in/p/ghHjf7Eb'],
    [8, 'Data Freshness', '2026-09', 'September 2026', '/sketches/data-freshness/', 'https://lnkd.in/p/gdfHCzTz'],
    [9, 'Partitioning: Why Scanning Less Data Matters', '2026-10', 'October 2026', '/sketches/partitioning/', 'https://lnkd.in/p/gbbYGrdV'],
  ];
  for (const [id, title, dateTime, month, lessonPath, href] of expected) {
    const sketch = data.findPublishedSketch(id);
    assert.ok(sketch);
    assert.deepEqual([sketch.id, sketch.title, sketch.dateTime, sketch.month, sketch.lessonPath, sketch.href], [id, title, dateTime, month, lessonPath, href]);
    assert.equal(sketch.image, `/images/data-sketch/data-sketch-episode-${String(id).padStart(2, '0')}.jpg`);
  }
  assert.equal(data.findPublishedSketch(10), undefined);
  assert.equal(data.findPublishedSketch(11), undefined);
  assert.equal(data.findPublishedSketch(999), undefined);
});

test('released JPEG derivatives remain 1080 by 1350 and below 200 KB', () => {
  for (const sketch of data.sketches.filter(entry => entry.status === 'published' && entry.id >= 5)) {
    const bytes = fs.readFileSync(`public${sketch.image}`);
    assert.ok(bytes.length < 200_000, `${sketch.image} exceeds its image budget`);
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    let dimensions;
    for (let offset = 2; offset + 9 < bytes.length;) {
      assert.equal(bytes[offset], 0xff);
      const marker = bytes[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        dimensions = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
        break;
      }
      if (marker === 0xda || marker === 0xd9) break;
      offset += 2 + bytes.readUInt16BE(offset + 2);
    }
    assert.deepEqual(dimensions, [1080, 1350], sketch.image);
  }
});

test('sorting orders published episodes and keeps upcoming episodes last without mutating data', () => {
  const originalIds = data.sketches.map(sketch => sketch.id);
  assert.deepEqual(data.sortSketches(data.sketches, 'latest').map(sketch => sketch.id), [9, 8, 7, 6, 5, 4, 3, 2, 1, 10, 11]);
  assert.deepEqual(data.sortSketches(data.sketches, 'oldest').map(sketch => sketch.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(data.sortSketches([], 'oldest'), []);
  assert.deepEqual(data.sketches.map(sketch => sketch.id), originalIds);
});

test('typed route manifest exposes the gallery, nine lessons, newsletter and privacy', () => {
  assert.equal(routeManifest.length, 12);
  assert.deepEqual(routeManifest.map(route => route.path), [
    '/',
    '/newsletter',
    '/privacy',
    '/sketches/backfill-playbook/',
    '/sketches/join-duplication-debugging/',
    '/sketches/full-refresh-vs-incremental-load/',
    '/sketches/bronze-silver-gold/',
    '/sketches/safe-publish-pattern/',
    '/sketches/reconciliation-workflow/',
    '/sketches/late-arriving-data/',
    '/sketches/data-freshness/',
    '/sketches/partitioning/',
  ]);
  assert.equal(routeAliases.get('/index.html'), '/');
  for (const route of routeManifest.filter(entry => entry.kind === 'lesson')) {
    assert.equal(routeAliases.get(route.path.slice(0, -1)), route.path);
    assert.equal(routeAliases.get(`${route.path}index.html`), route.path);
  }
});

test('gallery prerender keeps LinkedIn cards, sibling lesson links and asset-free teasers', async () => {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const html = render('/');
  assert.equal((html.match(/class="gallery-grid"/g) ?? []).length, 1);
  assert.equal((html.match(/class="card-link"/g) ?? []).length, 9);
  assert.equal((html.match(/class="read-lesson"/g) ?? []).length, 9);
  assert.equal((html.match(/class="sketch-card teaser"/g) ?? []).length, 2);
  assert.equal((html.match(/loading="eager"/g) ?? []).length, 1);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 8);
  assert.equal((html.match(/width="1080" height="1350"/g) ?? []).length, 9);
  const text = html.replaceAll('<!-- -->', '');
  assert.ok(text.includes('9 published'));
  assert.ok(text.includes('2 upcoming'));
  assert.equal((html.match(/disabled=""/g) ?? []).length, 3);
  for (const sketch of data.sketches.filter(entry => entry.status === 'published')) {
    assert.ok(html.includes(sketch.href));
    assert.ok(html.includes(sketch.lessonPath));
  }
  assert.ok(!html.includes('/sketches/episode-10'));
  assert.ok(!html.includes('/sketches/episode-11'));
});

test('each lesson prerenders source-bound copy, byline, month, image and LinkedIn source', async () => {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  for (const route of routeManifest.filter(entry => entry.kind === 'lesson')) {
    const sketch = data.findPublishedSketch(route.episodeId);
    const html = render(route.path);
    assert.ok(html.includes('Back to gallery'));
    assert.ok(html.includes(sketch.title));
    assert.ok(html.includes(`dateTime="${sketch.dateTime}"`));
    assert.ok(html.includes(sketch.month));
    assert.ok(html.includes(sketch.image));
    assert.ok(html.includes(sketch.href));
    assert.ok(html.includes('Reading the sketch'));
    assert.ok(html.includes('Takeaway'));
    assert.equal((html.match(/class="lesson-page"/g) ?? []).length, 1);
  }
});

test('metadata, schema, sitemap and text endpoints are route-aware and source-safe', () => {
  for (const route of routeManifest) {
    const head = renderHead({ route, preview: false });
    assert.ok(head.includes(`<link rel="canonical" href="${siteConfig.baseUrl}${route.path}"`));
    assert.ok(head.includes('rel="describedby"'));
    assert.ok(head.includes(`rel="alternate" type="text/markdown" href="${siteConfig.baseUrl}${route.markdownPath}"`));
    assert.ok(head.includes(`content="${route.title}"`));
    assert.ok(head.includes('content="index, follow"'));
    assert.equal((head.match(/application\/ld\+json/g) ?? []).length, 1);
    assert.ok(head.includes('"@type":"WebSite"'));
    assert.ok(head.includes('"@type":"Person"'));
    assert.ok(head.includes('content="@caesarmario_"'));
    if (route.kind === 'lesson') {
      assert.ok(head.includes('"@type":"Article"'));
      assert.ok(head.includes('"@type":"BreadcrumbList"'));
      assert.ok(head.includes('"@type":"ImageObject"'));
      assert.ok(head.includes('"articleSection"'));
      assert.ok(head.includes('"keywords"'));
      assert.ok(head.includes('"dateModified"'));
      assert.ok(!head.includes('datePublished'));
    } else if (route.kind === 'gallery') {
      assert.ok(head.includes('"@type":"CollectionPage"'));
    } else {
      assert.ok(head.includes('"@type":"WebPage"'));
      assert.ok(!head.includes('"@type":"Article"'));
    }
  }
  const files = generateFiles();
  assert.equal((files['sitemap.xml'].match(/<loc>/g) ?? []).length, 12);
  assert.ok(files['sitemap.xml'].includes('xmlns:image='));
  assert.equal((files['sitemap.xml'].match(/<image:image>/g) ?? []).length, 20);
  assert.ok(!files['sitemap.xml'].includes('image:caption'));
  for (const route of routeManifest) assert.ok(files['sitemap.xml'].includes(`${siteConfig.baseUrl}${route.path}`));
  assert.ok(!files['sitemap.xml'].includes('episode-10'));
  assert.ok(!files['sitemap.xml'].includes('episode-11'));
  assert.equal(new Set(routeManifest.map(route => route.title)).size, 12);
  assert.equal(new Set(routeManifest.map(route => route.description)).size, 12);
  assert.ok(!files['sitemap.xml'].includes('humans.txt'));
  assert.ok(!files['sitemap.xml'].includes('llms.txt'));
  assert.ok(files['humans.txt'].includes('Author: Mario Caesar'));
  assert.match(files['llms.txt'], /^# Data Sketch\n\n> /);
  assert.ok(files['llms.txt'].includes('/index.md'));
  assert.ok(files['_headers'].includes('/humans.txt'));
  assert.ok(files['_headers'].includes('/llms.txt'));
  assert.ok(files['_headers'].includes('Content-Type: text/markdown; charset=utf-8'));
  assert.ok(files['_headers'].includes('X-Robots-Tag: noindex, follow'));
  for (const route of routeManifest) {
    assert.ok(files[route.markdownOutput]);
    assert.ok(files[route.markdownOutput].includes(`Canonical page: ${siteConfig.baseUrl}${route.path}`));
  }
  assert.ok(files['_redirects'].includes('/* /404.html 404'));
  assert.ok(!files['_redirects'].includes(' 200'));
  for (const route of routeManifest.filter(entry => entry.kind === 'lesson')) {
    assert.ok(!files['_redirects'].includes(`${route.path.slice(0, -1)} ${route.path} 301!`));
    assert.ok(files['_redirects'].includes(`${route.path}index.html ${route.path} 301!`));
  }
  assert.ok(files['404.html'].includes('noindex, nofollow'));
});

test('shared utilities expose the configured build and accessible controls', async () => {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const html = render('/');
  assert.equal(siteConfig.version, '1.0.2');
  assert.equal(siteConfig.buildVersion, 'v2026.10.28');
  assert.ok(html.includes('aria-label="Site information"'));
  assert.ok(html.includes('href="/humans.txt"'));
  assert.ok(html.includes('href="/llms.txt"'));
  assert.ok(html.includes('aria-label="Back to top"'));
  assert.ok(html.includes('aria-hidden="true" disabled="" tabindex="-1"'));
  assert.ok(html.includes('Skip to content'));
});

test('CSS keeps subdued green spotlight, 44px back-to-top and reduced-motion fallback', () => {
  const source = fs.readFileSync('src/styles.css', 'utf8');
  const css = postcss.parse(source);
  const declarations = selector => {
    const values = {};
    css.walkRules(selector, rule => rule.walkDecls(declaration => { values[declaration.prop] = declaration.value; }));
    return values;
  };
  assert.equal(declarations('.brand').width, 'clamp(100px, 16vw, 170px)');
  assert.equal(declarations('.brand')['min-height'], '44px');
  assert.equal(declarations('.sketch-image img')['object-fit'], 'contain');
  assert.equal(declarations('.back-to-top').width, '44px');
  assert.equal(declarations('.back-to-top').height, '44px');
  assert.ok(declarations('.spotlight').background.includes('hsl(var(--accent) / .045)'));
  assert.ok(declarations('.utility-links').position === 'fixed');
  assert.equal(declarations('.sketch-card-live::after')['pointer-events'], 'none');
  assert.equal(declarations('.sketch-image img').transform, undefined);
  let reducedMotion = false;
  css.walkAtRules('media', rule => {
    if (rule.params === '(prefers-reduced-motion: reduce)') {
      rule.walkDecls('scroll-behavior', declaration => { if (declaration.value === 'auto') reducedMotion = true; });
    }
  });
  assert.ok(reducedMotion);
});

test('preview output is noindex, has no analytics and publishes an empty sitemap', () => {
  assert.equal(isPreview({ CONTEXT: 'deploy-preview' }), true);
  assert.equal(isPreview({ CONTEXT: 'branch-deploy' }), true);
  assert.equal(isPreview({ CONTEXT: 'production' }), false);
  assert.equal(isPreview({ CONTEXT: 'production', SITE_INDEXING: 'noindex' }), true);
  const token = '0123456789abcdef0123456789abcdef';
  for (const route of routeManifest) {
    assert.ok(!renderHead({ route, preview: true, analyticsToken: token }).includes('beacon.min.js'));
    assert.ok(renderHead({ route, preview: false, analyticsToken: token }).includes('beacon.min.js'));
  }
  assert.throws(() => renderHead({ analyticsToken: 'invalid' }));
  assert.ok(generateFiles({ preview: true })['_headers'].includes('X-Robots-Tag: noindex, nofollow'));
  assert.ok(!generateFiles({ preview: true })['sitemap.xml'].includes('<loc>'));
});

test('production build contains every hydrated page and public support file', () => {
  for (const route of routeManifest) {
    const html = fs.readFileSync(`dist/${route.output}`, 'utf8');
    assert.ok(html.includes('<main'));
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(html.includes(`<link rel="canonical" href="${siteConfig.baseUrl}${route.path}"`));
    assert.ok(!html.includes('<!--app-html-->'));
    assert.equal((html.match(/application\/ld\+json/g) ?? []).length, 1);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.ok(Array.isArray(schema['@graph']));
    if (route.kind === 'lesson') {
      const sketch = data.findPublishedSketch(route.episodeId);
      const article = schema['@graph'].find(entry => entry['@type'] === 'Article');
      assert.equal(article.url, `${siteConfig.baseUrl}${route.path}`);
      assert.deepEqual(article.keywords, sketch.tags);
      assert.ok(html.includes(sketch.lesson));
      assert.ok(html.includes(sketch.href));
      assert.ok(!('datePublished' in article));
    }
  }
  for (const file of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-96x96.png', 'apple-touch-icon.png', 'og-image.png', 'humans.txt', 'llms.txt']) {
    assert.ok(fs.existsSync(`dist/${file}`));
  }
  for (const route of routeManifest) assert.ok(fs.existsSync(`dist/${route.markdownOutput}`));
  for (const sketch of data.sketches.filter(entry => entry.status === 'published')) {
    assert.deepEqual(fs.readFileSync(`dist${sketch.image}`), fs.readFileSync(`public${sketch.image}`));
  }
});
