import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { newsletterConfig } from '../newsletter.config.mjs';
import { routeManifest, routeAliases } from '../site.routes.mjs';
import { siteConfig } from '../site.config.mjs';
import { generateFiles, renderHead } from '../scripts/seo.mjs';

test('signup and privacy pages have canonical aliases, Markdown and WebPage metadata', () => {
  const files = generateFiles();
  for (const path of [newsletterConfig.path, newsletterConfig.privacyPath]) {
    const route = routeManifest.find(entry => entry.path === path);
    assert.ok(route);
    for (const alias of [`${path}/`, `${path}.html`, `${path}/index.html`]) {
      assert.equal(routeAliases.get(alias), path);
      assert.ok(files['_redirects'].includes(`${alias} ${path} 301!`));
    }
    const head = renderHead({ route, preview: false });
    assert.ok(head.includes(`rel="canonical" href="${siteConfig.baseUrl}${path}"`));
    const graph = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    assert.ok(graph.some(entry => entry['@type'] === 'WebPage' && entry.url === `${siteConfig.baseUrl}${path}`));
    assert.ok(!graph.some(entry => entry['@type'] === 'Article'));
    assert.ok(files[route.markdownOutput].includes(`Canonical page: ${siteConfig.baseUrl}${path}`));
    assert.ok(renderHead({ route, preview: true }).includes('noindex, nofollow'));
  }
});

test('newsletter prerender offers a working fallback, published samples and privacy without JavaScript', () => {
  const html = fs.readFileSync('dist/newsletter.html', 'utf8');
  assert.equal((html.match(/class="newsletter-form-host"/g) ?? []).length, 1);
  assert.ok(html.includes(`href="${newsletterConfig.formUrl}"`));
  assert.ok(html.includes(`href="${newsletterConfig.privacyPath}"`));
  assert.ok(html.includes('Two emails a month'));
  assert.ok(html.includes('/sketches/join-duplication-debugging/'));
  assert.ok(html.includes('/sketches/data-freshness/'));
  assert.ok(!html.includes('episode-10'));
  assert.ok(!html.includes('episode-11'));
  assert.ok(html.includes('<noscript>'));
  // Third-party DOM changes must happen after hydration, inside the form host.
  for (const route of routeManifest) {
    const page = fs.readFileSync(`dist/${route.output}`, 'utf8');
    assert.ok(!page.includes(`src="${newsletterConfig.loaderUrl}"`));
    assert.ok(page.includes(`href="${newsletterConfig.path}"`));
  }
  const privacy = fs.readFileSync('dist/privacy.html', 'utf8');
  for (const section of newsletterConfig.privacySections) assert.ok(privacy.includes(section.heading));
  assert.ok(privacy.includes('https://www.beehiiv.com/privacy'));
  assert.ok(privacy.includes(`mailto:${newsletterConfig.contact}`));
});
