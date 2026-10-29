import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { asciiBootScript, claimAsciiBoot } from '../ascii-boot.mjs';

function boot({ reduced = false, observe = true } = {}) {
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const timers = new Map(); const root = { dataset: {} }; let id = 0, disabled = 0;
  const window = Object.assign(new EventTarget(), {
    matchMedia: () => motion, requestAnimationFrame() {},
    ...(observe ? { IntersectionObserver() {} } : {}),
    setTimeout: (callback, ms) => { timers.set(++id, { callback, ms }); return id; },
    clearTimeout: key => timers.delete(key),
  });
  window.addEventListener('ascii:disabled', () => { disabled++; });
  const context = { window, document: { documentElement: root }, Event };
  vm.runInNewContext(asciiBootScript, context);
  return { root, timers, disabled: () => disabled,
    claim() { vm.runInNewContext('(' + claimAsciiBoot.toString() + ')()', context); },
    expire() { for (const timer of [...timers.values()]) timer.callback(); },
    reduce() { motion.matches = true; motion.dispatchEvent(Object.assign(new Event('change'), { matches: true })); },
  };
}

test('head opt-in happens synchronously, before server content can paint', () => {
  const h = boot(); assert.equal(h.root.dataset.asciiBoot, 'on');
  assert.equal([...h.timers.values()][0].ms, 5000);
});
test('failed application startup opens media and late ownership cannot re-enable the gate', () => {
  const h = boot(); h.expire(); assert.equal(h.root.dataset.asciiBoot, undefined);
  assert.equal(h.disabled(), 1); h.claim(); assert.equal(h.root.dataset.asciiBoot, undefined);
});
test('a committed app claims startup and keeps future SPA media eligible', () => {
  const h = boot(); h.claim(); assert.equal(h.timers.size, 0);
  assert.equal(h.root.dataset.asciiBoot, 'on'); h.reduce();
  assert.equal(h.root.dataset.asciiBoot, undefined); assert.equal(h.disabled(), 1);
});
test('reduced-motion and unsupported clients never opt into hiding content', () => {
  for (const config of [{ reduced: true }, { observe: false }]) {
    const h = boot(config); assert.equal(h.root.dataset.asciiBoot, undefined); assert.equal(h.timers.size, 0);
  }
});

test('every prerendered media route installs the gate before its SSR body and ships actual glyphs', () => {
  const dist = fileURLToPath(new URL('../dist/', import.meta.url));
  let routes = 0;
  for (const file of fs.readdirSync(dist, { recursive: true }).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(dist, file), 'utf8');
    const media = (html.match(/data-ascii-image=""/g) ?? []).length;
    if (!media) continue;
    routes++;
    assert.ok(html.indexOf('<script data-ascii-boot>') < html.indexOf('<body'), file);
    assert.ok(html.indexOf('<script data-ascii-boot>') > 0, file);
    assert.equal((html.match(/data-image-state="pending"/g) ?? []).length, media, file);
    assert.equal((html.match(/data-ascii-skeleton/g) ?? []).length, media, file);
  }
  assert.ok(routes >= 2);
});
