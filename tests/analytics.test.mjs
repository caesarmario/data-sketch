import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import fs from 'node:fs';
import { initializeAnalytics, renderAnalytics } from '../analytics.mjs';
import { siteConfig } from '../site.config.mjs';
import { renderHead, renderNotFound } from '../scripts/seo.mjs';
import { routeManifest } from '../site.routes.mjs';

const policy = siteConfig.analytics;
function harness(hostname = policy.hostname) {
  const scripts = [];
  const view = { location: { hostname, origin: `https://${hostname}`, href: `https://${hostname}/newsletter?email=private@example.test#token` } };
  const doc = {
    querySelector: query => scripts.find(script => query === `script[src="${script.src}"]`),
    createElement: () => ({ attributes: {}, setAttribute(key, value) { this.attributes[key] = value; } }),
    head: { appendChild: script => scripts.push(script) },
  };
  return { view, doc, scripts };
}

test('production loads each dedicated tracker once, using deferred classic scripts', () => {
  const h = harness(); initializeAnalytics(policy, h.view, h.doc); initializeAnalytics(policy, h.view, h.doc);
  assert.equal(h.scripts.length, 2);
  const [umami, cloudflare] = h.scripts;
  assert.equal(umami.src, 'https://cloud.umami.is/script.js');
  assert.equal(umami.attributes['data-website-id'], 'daf49df6-d97c-46a5-adc4-596b58be9260');
  assert.equal(umami.attributes['data-domains'], policy.hostname);
  assert.equal(umami.attributes['data-exclude-search'], 'true');
  assert.equal(umami.attributes['data-exclude-hash'], 'true');
  assert.equal(umami.attributes['data-before-send'], 'dataSketchBeforeSend');
  assert.equal(cloudflare.src, 'https://static.cloudflareinsights.com/beacon.min.js');
  assert.equal(JSON.parse(cloudflare.attributes['data-cf-beacon']).token, 'bcab4397f11c4bb69df934e6a7c39b9c');
  for (const script of h.scripts) { assert.equal(script.defer, true); assert.equal(script.type, undefined); }
});

test('localhost, previews and the portfolio never start these trackers', () => {
  for (const host of ['localhost','127.0.0.1','caesarmar.io','preview--data-sketch.netlify.app']) {
    const h = harness(host); initializeAnalytics(policy, h.view, h.doc);
    assert.equal(h.scripts.length, 0); assert.equal(h.view.dataSketchBeforeSend, undefined);
  }
});

test('an existing injected tracker is not appended a second time', () => {
  const h = harness(); h.scripts.push({ src: 'https://static.cloudflareinsights.com/beacon.min.js' });
  initializeAnalytics(policy, h.view, h.doc); assert.equal(h.scripts.length, 2);
});

test('the current one-argument Umami callback strips query/hash and form properties', () => {
  const h = harness(); initializeAnalytics(policy, h.view, h.doc);
  const input = { website: policy.umamiWebsiteId, eventId: 'page-id', timestamp: 123,
    url: h.view.location.href, referrer: 'https://example.test/article?token=secret#mail',
    title: 'Data Sketch Newsletter', data: { email: 'private@example.test' }, properties: { token: 'secret' },
  };
  const clean = h.view.dataSketchBeforeSend(input);
  assert.equal(clean.url, '/newsletter'); assert.equal(clean.referrer, 'https://example.test/article');
  assert.equal(clean.eventId, 'page-id'); assert.equal(clean.timestamp, 123);
  assert.equal(clean.data, undefined); assert.equal(clean.properties, undefined);
  assert.equal(JSON.stringify(clean).includes('private@'), false);
  assert.ok(input.data, 'Do not mutate the tracker payload in place');
});

test('the older two-argument callback also returns a sanitized page payload', () => {
  const h = harness(); initializeAnalytics(policy, h.view, h.doc);
  assert.deepEqual(h.view.dataSketchBeforeSend('event', { url: '/?email=private#secret' }), { url: '/', referrer: '' });
});

test('invalid or cross-host payload URLs cannot become pageviews', () => {
  const h = harness(); initializeAnalytics(policy, h.view, h.doc);
  for (const url of ['javascript:alert(1)','https://other.test/newsletter','mailto:private@example.test']) {
    assert.equal(h.view.dataSketchBeforeSend({ url }), null);
  }
  assert.equal(h.view.dataSketchBeforeSend(null), null);
});

test('the serialized production loader runs without build-time closure variables', () => {
  const h = harness();
  const html = renderAnalytics(policy), source = html.match(/<script[^>]*>([\s\S]*)<\/script>/)[1];
  vm.runInNewContext(source, { window: h.view, document: h.doc, URL });
  assert.equal(h.scripts.length, 2);
  assert.equal(h.view.dataSketchBeforeSend({ url: '/newsletter?email=private' }).url, '/newsletter');
});

test('every public production route includes one loader; preview and 404 output omit it', () => {
  for (const route of routeManifest) {
    const production = renderHead({ route, preview: false });
    assert.equal((production.match(/data-datasketch-analytics/g) ?? []).length, 1);
    for (const url of ['cloud.umami.is/script.js','static.cloudflareinsights.com/beacon.min.js']) {
      assert.equal((production.split(url).length - 1), 1);
      assert.equal(renderHead({ route, preview: true }).includes(url), false);
      assert.equal(renderNotFound().includes(url), false);
    }
    const built = fs.readFileSync(`dist/${route.output}`, 'utf8');
    assert.equal((built.match(/data-datasketch-analytics/g) ?? []).length, 1);
  }
});

test('invalid analytics IDs fail before producing deployable HTML', () => {
  assert.throws(() => renderAnalytics({ ...policy, umamiWebsiteId: 'bad' }));
  assert.throws(() => renderAnalytics({ ...policy, cloudflareToken: 'bad' }));
});
