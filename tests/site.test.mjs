import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import fs from 'node:fs';
import postcss from 'postcss';
import { createServer } from 'vite';
import { generateFiles, isPreview, renderHead } from '../scripts/seo.mjs';
import { siteConfig } from '../site.config.mjs';
import { routeAliases, routeManifest } from '../site.routes.mjs';

let server;
let data;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  data = await server.ssrLoadModule('/src/data/sketches.ts');
});
after(async () => { await server?.close(); });

test('six ordered episodes include four published lessons and no teaser assets', () => {
  assert.deepEqual(data.sketches.map(sketch => sketch.id), [1, 2, 3, 4, 5, 6]);
  const published = data.sketches.filter(sketch => sketch.status === 'published');
  assert.equal(published.length, 4);
  for (const sketch of data.sketches) {
    if (sketch.status === 'upcoming') {
      assert.equal(sketch.image, undefined);
      assert.equal(sketch.href, undefined);
      assert.equal(sketch.lessonPath, undefined);
    } else {
      assert.equal(new URL(sketch.href).hostname, 'www.linkedin.com');
      assert.ok(fs.existsSync(`public${sketch.image}`));
      assert.ok(routeManifest.some(route => route.kind === 'lesson' && route.path === sketch.lessonPath && route.episodeId === sketch.id));
      assert.match(sketch.dateTime, /^2026-(0[3-6])$/);
      assert.ok(sketch.walkthrough.length >= 3);
    }
  }
  assert.deepEqual(fs.readdirSync('public/images/data-sketch').sort(), ['01', '02', '03', '04'].map(number => `data-sketch-episode-${number}.jpg`));
});

test('sorting remains deterministic and does not mutate episode data', () => {
  assert.deepEqual(data.sortSketches(data.sketches, 'latest').map(sketch => sketch.id), [6, 5, 4, 3, 2, 1]);
  assert.deepEqual(data.sortSketches(data.sketches, 'oldest').map(sketch => sketch.id), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(data.sortSketches([], 'oldest'), []);
  assert.equal(data.sketches[0].id, 1);
});

test('typed route manifest exposes one gallery and exactly four published lessons', () => {
  assert.equal(routeManifest.length, 5);
  assert.deepEqual(routeManifest.map(route => route.path), [
    '/',
    '/sketches/backfill-playbook/',
    '/sketches/join-duplication-debugging/',
    '/sketches/full-refresh-vs-incremental-load/',
    '/sketches/bronze-silver-gold/',
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
  assert.equal((html.match(/class="card-link"/g) ?? []).length, 4);
  assert.equal((html.match(/class="read-lesson"/g) ?? []).length, 4);
  assert.equal((html.match(/class="sketch-card teaser"/g) ?? []).length, 2);
  assert.equal((html.match(/loading="eager"/g) ?? []).length, 1);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 3);
  assert.equal((html.match(/width="1080" height="1350"/g) ?? []).length, 4);
  const text = html.replaceAll('<!-- -->', '');
  assert.ok(text.includes('4 published'));
  assert.ok(text.includes('2 upcoming'));
  assert.equal((html.match(/disabled=""/g) ?? []).length, 3);
  for (const sketch of data.sketches.filter(entry => entry.status === 'published')) {
    assert.ok(html.includes(sketch.href));
    assert.ok(html.includes(sketch.lessonPath));
  }
  assert.ok(!html.includes('/sketches/episode-05'));
  assert.ok(!html.includes('/sketches/episode-06'));
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
    assert.ok(head.includes(`content="${route.title}"`));
    assert.ok(head.includes('content="index, follow"'));
    assert.equal((head.match(/application\/ld\+json/g) ?? []).length, 1);
    if (route.kind === 'lesson') {
      assert.ok(head.includes('"@type":"Article"'));
      assert.ok(head.includes('"@type":"BreadcrumbList"'));
      assert.ok(!head.includes('datePublished'));
    } else {
      assert.ok(head.includes('"@type":"CollectionPage"'));
    }
  }
  const files = generateFiles();
  assert.equal((files['sitemap.xml'].match(/<loc>/g) ?? []).length, 5);
  for (const route of routeManifest) assert.ok(files['sitemap.xml'].includes(`${siteConfig.baseUrl}${route.path}`));
  assert.ok(!files['sitemap.xml'].includes('episode-05'));
  assert.ok(!files['sitemap.xml'].includes('humans.txt'));
  assert.ok(!files['sitemap.xml'].includes('llms.txt'));
  assert.ok(files['humans.txt'].includes('Author: Mario Caesar'));
  assert.equal((files['llms.txt'].match(/^-/gm) ?? []).length, 6);
  assert.ok(files['_headers'].includes('/humans.txt'));
  assert.ok(files['_headers'].includes('/llms.txt'));
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
  assert.equal(siteConfig.version, '1.0.0');
  assert.equal(siteConfig.buildVersion, 'v2026.10.02');
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

test('production build contains all five hydrated pages and public support files', () => {
  for (const route of routeManifest) {
    const html = fs.readFileSync(`dist/${route.output}`, 'utf8');
    assert.ok(html.includes('<main'));
    assert.ok(html.includes(`<link rel="canonical" href="${siteConfig.baseUrl}${route.path}"`));
    assert.ok(!html.includes('<!--app-html-->'));
    assert.equal((html.match(/application\/ld\+json/g) ?? []).length, 1);
  }
  for (const file of ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'og-image.png', 'humans.txt', 'llms.txt']) {
    assert.ok(fs.existsSync(`dist/${file}`));
  }
});
