import assert from 'node:assert/strict';
import { routeAliases, routeManifest } from '../site.routes.mjs';
import { loadTypeScriptModule } from './load-typescript-module.mjs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { sketches } = await loadTypeScriptModule(root, 'src/data/sketches.ts');
const published = sketches.filter(sketch => sketch.status === 'published');
const upcoming = sketches.filter(sketch => sketch.status === 'upcoming');
const unknownRoutes = [
  '/missing', '/data-sketch', '/404.html',
  ...upcoming.flatMap(sketch => {
    const number = String(sketch.id).padStart(2, '0');
    return [`/sketches/episode-${number}/`, `/sketches/episode-${number}/index.md`, `/images/data-sketch/data-sketch-episode-${number}.jpg`];
  }),
];

for (const base of [process.env.DATA_SKETCH_DEV_URL ?? 'http://127.0.0.1:8081', process.env.DATA_SKETCH_PREVIEW_URL ?? 'http://127.0.0.1:4181']) {
  for (const route of [...routeManifest.map(entry => entry.path), ...routeManifest.map(entry => entry.markdownPath), ...published.map(sketch => sketch.image), '/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png', '/favicon-96x96.png', '/apple-touch-icon.png', '/brand/data-sketch-wordmark.png', '/og-image.png', '/sitemap.xml', '/robots.txt', '/humans.txt', '/llms.txt', '/fonts/ibm-plex-sans-v23-latin-400-600.woff2', '/fonts/space-grotesk-v22-latin-700.woff2']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, `${base}${route}`);
    const page = routeManifest.find(entry => entry.path === route);
    if (page) {
      const html = await response.text();
      assert.ok(html.includes(`<title>${page.title}</title>`), `${base}${route} has route-specific metadata`);
      continue;
    }
    if (route.endsWith('.jpg')) assert.ok(response.headers.get('content-type')?.startsWith('image/jpeg'));
    if (route.endsWith('.png')) assert.ok(response.headers.get('content-type')?.startsWith('image/png'));
    if (route.endsWith('.ico')) assert.match(response.headers.get('content-type') ?? '', /^image\/(?:x-icon|vnd\.microsoft\.icon)/);
    if (route === '/humans.txt') assert.ok(response.headers.get('content-type')?.startsWith('text/plain'));
    if (route === '/llms.txt' || route.endsWith('.md')) assert.ok(response.headers.get('content-type')?.startsWith('text/markdown'));
    if (route.endsWith('.md')) {
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
      assert.ok(response.headers.get('link')?.includes('rel="canonical"'));
    }
    await response.arrayBuffer();
  }
  for (const [alias, canonical] of routeAliases) {
    const response = await fetch(base + alias, { redirect: 'manual' });
    assert.equal(response.status, 301, `${base}${alias}`);
    assert.equal(response.headers.get('location'), canonical);
  }
  for (const route of unknownRoutes) {
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 404, `${base}${route}`);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    const html = await response.text();
    assert.ok(html.includes('Page not found'));
    assert.ok(html.includes('IBM Plex Sans'));
    assert.ok(html.includes('Space Grotesk'));
    assert.ok(html.includes('Back to gallery'));
    assert.ok(html.includes('noindex, nofollow'));
    assert.ok(!html.includes('<script'));
  }
  console.log(`${base}: ${routeManifest.length} pages and ${published.length} images 200, Markdown headers valid, aliases 301, unknown/teaser 404.`);
}

for (const base of [process.env.PORTFOLIO_DEV_URL, process.env.PORTFOLIO_PREVIEW_URL].filter(Boolean)) {
  for (const route of ['/data-sketch', '/data-sketch/', '/data-sketch.html', '/data-sketch/index.html']) {
    const response = await fetch(base + route + '?url=https://example.com', { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), 'https://datasketch.caesarmar.io/');
  }
  for (const n of ['01', '02', '03', '04']) {
    const route = `/images/data-sketch/data-sketch-episode-${n}.jpg`;
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), 'https://datasketch.caesarmar.io' + route);
  }
  for (const route of ['/', '/projects', '/certifications', '/mentoring-speaking', '/resume-access', '/review-status', '/linkedin', '/github', '/medium', '/x', '/kaggle']) {
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 200, `${base}${route}`);
    await response.text();
  }
  console.log(`${base}: eight fixed redirects; eleven other routes return 200 (not end-to-end UI proof).`);
}
