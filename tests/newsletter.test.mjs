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
      // Netlify normalizes slash variants before matching its redirect rules.
      assert.equal(files['_redirects'].includes(`${alias} ${path} 301!`), alias.endsWith('.html'));
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

test('Netlify slash normalization never turns a canonical page into a redirect to itself', () => {
  const normalize = pathname => pathname.replace(/\/+$/, '') || '/';
  const redirects = generateFiles()['_redirects'].trim().split('\n');
  for (const line of redirects) {
    const [from, to, status] = line.split(/\s+/);
    if (status !== '301!') continue;
    assert.notEqual(normalize(from), normalize(to), `Netlify would self-redirect: ${line}`);
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
    if (route.kind !== 'newsletter') assert.ok(page.includes(`href="${newsletterConfig.path}"`));
  }
  const privacy = fs.readFileSync('dist/privacy.html', 'utf8');
  for (const section of newsletterConfig.privacySections) assert.ok(privacy.includes(section.heading));
  assert.ok(privacy.includes('https://www.beehiiv.com/privacy'));
  assert.ok(privacy.includes(`mailto:${newsletterConfig.contact}`));
});

test('newsletter HTML and Markdown share the approved copy and show two full diagram previews', () => {
  const html = fs.readFileSync('dist/newsletter.html', 'utf8');
  const markdown = generateFiles()['newsletter/index.md'];
  for (const copy of [newsletterConfig.heading, newsletterConfig.intro, newsletterConfig.frequency, newsletterConfig.samplesHeading, newsletterConfig.authorLink]) {
    assert.ok(html.includes(copy), `HTML is missing ${copy}`);
    assert.ok(markdown.includes(copy), `Markdown is missing ${copy}`);
  }
  const samples = html.match(/<section class="newsletter-samples"[\s\S]*?<\/section>/)[0];
  assert.equal((samples.match(/<img /g) ?? []).length, 2);
  assert.equal((samples.match(/width="1080" height="1350"/g) ?? []).length, 2);
  assert.equal((samples.match(/Read lesson/g) ?? []).length, 2);
  const header = html.match(/<header class="masthead">[\s\S]*?<\/header>/)[0];
  assert.ok(header.includes('Browse sketches'));
  assert.ok(!header.includes('Subscribe'));
  assert.ok(!header.includes('Visit my website'));
  const footer = html.match(/<footer class="newsletter-footer">[\s\S]*?<\/footer>/)[0];
  assert.ok(footer.includes('Site information'));
  assert.ok(!footer.includes('Mario Caesar social profiles'));
});

test('newsletter edits keep the policy editorial date independent', () => {
  const files = generateFiles();
  const policyRoute = routeManifest.find(route => route.kind === 'privacy');
  const signupRoute = routeManifest.find(route => route.kind === 'newsletter');
  const policy = fs.readFileSync('dist/privacy.html', 'utf8');
  assert.equal(newsletterConfig.privacyModifiedAt, '2026-10-21');
  assert.equal(policyRoute.modifiedAt, newsletterConfig.privacyModifiedAt);
  assert.equal(signupRoute.modifiedAt, newsletterConfig.modifiedAt);
  assert.ok(policy.includes(`<time dateTime="${newsletterConfig.privacyModifiedAt}">21 October 2026</time>`) || policy.includes(`<time datetime="${newsletterConfig.privacyModifiedAt}">21 October 2026</time>`));
  assert.ok(files['privacy/index.md'].includes(`Updated: ${newsletterConfig.privacyModifiedAt}`));
  const graph = JSON.parse(renderHead({ route: policyRoute, preview: false }).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(graph.find(entry => entry['@type'] === 'WebPage').dateModified, newsletterConfig.privacyModifiedAt);
  assert.ok(files['sitemap.xml'].includes(`<loc>${siteConfig.baseUrl}/privacy</loc><lastmod>${newsletterConfig.privacyModifiedAt}</lastmod>`));
});
