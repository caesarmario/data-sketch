import assert from 'node:assert/strict';
import { routeAliases, routeManifest } from '../site.routes.mjs';

for (const base of [process.env.DATA_SKETCH_DEV_URL ?? 'http://127.0.0.1:8081', process.env.DATA_SKETCH_PREVIEW_URL ?? 'http://127.0.0.1:4181']) {
  for (const route of [...routeManifest.map(entry => entry.path), ...['01', '02', '03', '04'].map(n => `/images/data-sketch/data-sketch-episode-${n}.jpg`), '/favicon.svg', '/favicon-32x32.png', '/brand/data-sketch-wordmark.png', '/og-image.png', '/sitemap.xml', '/robots.txt', '/humans.txt', '/llms.txt']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, `${base}${route}`);
    if (route.endsWith('.jpg')) assert.ok(response.headers.get('content-type')?.startsWith('image/jpeg'));
    if (route.endsWith('.txt')) assert.ok(response.headers.get('content-type')?.startsWith('text/plain'));
    await response.arrayBuffer();
  }
  for (const [alias, canonical] of routeAliases) {
    const response = await fetch(base + alias, { redirect: 'manual' });
    assert.equal(response.status, 301, `${base}${alias}`);
    assert.equal(response.headers.get('location'), canonical);
  }
  for (const route of ['/missing', '/data-sketch', '/sketches/episode-05/', '/404.html', '/images/data-sketch/data-sketch-episode-05.jpg']) {
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 404, `${base}${route}`);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    await response.text();
  }
  console.log(`${base}: five pages/assets 200, aliases 301, unknown/teaser 404.`);
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
