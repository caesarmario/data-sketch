import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const decode = true;
const source = fs.readFileSync(new URL('../src/hooks/useAsciiImage.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
} }).outputText;
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

// Actual hook, controlled readiness and presentation frames. Browser tests also
// inspect the initial SSR paint and real green canvas pixels with warm cache.
function harness({ complete = false, valid = true, enabled = true, reduced = false, observe = true, animate = true } = {}) {
  let decoded = deferred();
  const image = Object.assign(new EventTarget(), {
    complete, naturalWidth: complete && valid ? 1080 : 0, masked: false,
    decode: () => decoded.promise,
  });
  const attrs = new Map(), observers = [], timers = new Map(), frames = new Map(), runs = [];
  const root = { dataset: { imageState: 'pending' }, ownerDocument: {},
    setAttribute: (key, value) => attrs.set(key, value), removeAttribute: key => attrs.delete(key),
    closest: () => ({ id: scope }),
  };
  const placeholder = { hidden: true, innerHTML: '<span data-ascii-skeleton>SSR glyphs</span>',
    ...(animate ? { animate(keyframes, options) {
      const done = deferred();
      const run = { done, keyframes, options, finished: done.promise,
        cancel() { done.reject(new Error('Cancelled')); },
      };
      runs.push(run); return run;
    } } : {}),
  };
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  class Observer {
    constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
    observe() { this.active = true; }
    disconnect() { this.active = false; }
  }
  let nextId = 0, install, cleanup, refIndex = 0, refs = [], scope = 'gallery';
  const module = { exports: {} };
  const browserWindow = Object.assign(new EventTarget(), {
    location: { pathname: '/' }, matchMedia: () => motion,
    ...(observe ? { IntersectionObserver: Observer } : {}),
    setTimeout: (callback, ms) => { timers.set(++nextId, { callback, ms }); return nextId; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  vm.runInNewContext(compiled, {
    module, exports: module.exports, IntersectionObserver: Observer, window: browserWindow,
    require: name => {
      if (name === 'react') return {
        useRef: initial => { const i = refIndex++; return refs[i] ??= { current: [root, image, placeholder][i] ?? initial }; },
        useEffect: effect => { install = effect; },
      };
      if (name === '../../ascii-boot.mjs') return { asciiEnabled: () => enabled };
      assert.equal(name, 'ascii-reveal/core');
      return {
        presets: { decode: { mode: 'ramp', color: 'mono' } },
        createAsciiReveal: (_root, config) => {
          const done = deferred();
          const run = { done, config,
            reveal() { image.masked = true; return done.promise; },
            destroy() { image.masked = false; done.resolve(); },
          };
          runs.push(run); return run;
        },
      };
    },
  });
  let src = '/preview.jpg', options = {};
  const render = () => { refIndex = 0; module.exports.useAsciiImage(src, () => { failures++; }, options); };
  let failures = 0;
  const signal = inside => {
    for (const observer of [...observers]) if (observer.active) observer.callback([{ isIntersecting: inside, intersectionRatio: inside ? 1 : 0 }]);
  };
  render();
  return { root, image, placeholder, attrs, runs, timers, frames, failures: () => failures,
    mount() { cleanup = install(); }, unmount() { cleanup?.(); },
    remount() { cleanup?.(); refs = []; render(); cleanup = install(); },
    resize() { cleanup?.(); options = { sizes: '80vw' }; render(); cleanup = install(); },
    refresh() { cleanup?.(); root.ownerDocument = {}; refs = []; decoded = deferred(); render(); cleanup = install(); },
    changeSource() { cleanup?.(); src = '/replacement.jpg'; decoded = deferred(); render(); cleanup = install(); },
    changeScope() { cleanup?.(); scope = 'mentoring'; refs = []; decoded = deferred(); render(); cleanup = install(); },
    enter() { signal(true); }, exit() { signal(false); },
    load() { image.complete = true; image.naturalWidth = 1080; image.dispatchEvent(new Event('load')); },
    fail() { image.complete = true; image.naturalWidth = 0; image.dispatchEvent(new Event('error')); },
    async decodeReady() { decoded.resolve(); await flush(); },
    async decodeFailed() { decoded.reject(new Error('Decode unavailable')); await flush(); },
    paint() { const pending = [...frames]; frames.clear(); for (const [, callback] of pending) callback(); },
    async finish() { runs.at(-1).done.resolve(); await flush(); },
    motion(value) { motion.matches = value; motion.dispatchEvent(new Event('change')); },
    disable() { enabled = false; browserWindow.dispatchEvent(new Event('ascii:disabled')); },
    async expire(ms) { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.callback(); } await flush(); },
  };
}
const play = h => { h.enter(); h.paint(); h.paint(); };

test('SSR starts pending with deterministic glyph markup, independent of image cache', () => {
  const h = harness({ complete: true });
  assert.equal(h.root.dataset.imageState, 'pending');
  assert.ok(h.placeholder.innerHTML.includes('SSR glyphs'));
  assert.equal(h.runs.length, 0);
});

test('cached media waits for entry and a painted scaffold before its first reveal', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady();
  assert.equal(h.root.dataset.imageState, 'pending'); assert.equal(h.runs.length, 0);
  h.enter(); h.paint(); assert.equal(h.runs.length, 0);
  assert.equal(h.root.dataset.imageState, 'pending');
  h.paint(); assert.equal(h.runs.length, 1); assert.equal(h.root.dataset.imageState, 'revealing');
  if (decode) {
    assert.equal(h.runs[0].config.preset.mode, 'ramp');
    assert.equal(h.runs[0].config.preset.color, 'accent');
    assert.equal(h.runs[0].config.speed, 1.8); assert.equal(h.runs[0].config.origin, 'top-left');
    assert.equal(h.runs[0].config.duration, 'cinematic'); assert.equal(h.runs[0].config.mascot, null);
  } else {
    assert.equal(h.runs[0].options.duration, 180);
    assert.equal(h.runs[0].keyframes[0].opacity, 1); assert.equal(h.runs[0].keyframes[1].opacity, 0);
  }
  await h.finish(); assert.equal(h.root.dataset.imageState, 'ready'); h.unmount();
});

test('a new document refresh replays the effect even when the same file remains cached', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); play(h); await h.finish();
  h.refresh(); await h.decodeReady(); play(h);
  assert.equal(h.runs.length, 2); await h.finish(); h.unmount();
});

test('real image loading and decoding keep the initial cover until the reveal is ready', async () => {
  const h = harness(); h.mount(); h.enter();
  assert.equal(h.attrs.get('aria-busy'), 'true');
  h.load(); h.paint(); h.paint(); assert.equal(h.runs.length, 0);
  assert.equal(h.root.dataset.imageState, 'pending');
  await h.decodeReady(); h.paint(); h.paint(); assert.equal(h.runs.length, 1);
  assert.equal(h.attrs.has('aria-busy'), false); await h.finish(); h.unmount();
});

test('offscreen completion stays covered and cannot spend a reveal early', async () => {
  const h = harness(); h.mount(); h.load(); await h.decodeReady(); h.paint(); h.paint();
  assert.equal(h.runs.length, 0); assert.equal(h.root.dataset.imageState, 'pending');
  play(h); assert.equal(h.runs.length, 1); await h.finish(); h.unmount();
});

test('leaving before playback cancels the queued frames and permits a first reveal on reentry', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); h.enter(); h.paint(); h.exit();
  h.paint(); assert.equal(h.runs.length, 0); play(h); assert.equal(h.runs.length, 1);
  await h.finish(); h.unmount();
});

test('scroll, sort, remount and sizes do not replay a consumed preview in the same document', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); play(h); await h.finish();
  h.exit(); play(h); h.remount(); play(h); h.resize(); play(h);
  assert.equal(h.runs.length, 1); assert.equal(h.root.dataset.imageState, 'ready'); h.unmount();
});

test('identical artwork in another page section receives its own first reveal', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); play(h); await h.finish();
  h.changeScope(); await h.decodeReady(); play(h);
  assert.equal(h.runs.length, 2); await h.finish(); h.unmount();
});

test('a new source is eligible and leaving an active effect restores native media', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); play(h); await h.finish();
  h.changeSource(); await h.decodeReady(); play(h); h.exit(); await flush();
  assert.equal(h.runs.length, 2); assert.equal(h.root.dataset.imageState, 'ready');
  assert.equal(h.image.masked, false); play(h); assert.equal(h.runs.length, 2); h.unmount();
});

test('Strict Mode cleanup retains SSR glyphs and cancels every queued frame', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); h.enter(); h.paint();
  h.remount(); await h.decodeReady(); play(h);
  assert.equal(h.runs.length, 1); assert.ok(h.placeholder.innerHTML.includes('SSR glyphs'));
  h.unmount(); await flush(); assert.equal(h.frames.size, 0); assert.equal(h.timers.size, 0);
});

test('late decode results after unmount cannot schedule animation or mutate owned state', async () => {
  const h = harness(); h.mount(); h.enter(); h.load(); h.unmount(); await h.decodeReady();
  assert.equal(h.frames.size, 0); assert.equal(h.runs.length, 0);
  assert.equal(h.root.dataset.asciiOwned, undefined); assert.equal(h.attrs.size, 0);
});

test('failed images and the 15s load deadline expose the accessible fallback exactly once', async () => {
  for (const timeout of [false, true]) {
    const h = harness(); h.mount(); h.enter();
    if (timeout) await h.expire(15000); else h.fail();
    h.load(); h.fail(); await h.decodeReady(); play(h);
    assert.equal(h.failures(), 1); assert.equal(h.root.dataset.imageState, 'unavailable');
    assert.equal(h.attrs.has('aria-busy'), false); assert.equal(h.runs.length, 0); h.unmount();
  }
});

test('a successful image survives decode rejection or its 1s safety deadline', async () => {
  for (const timeout of [false, true]) {
    const h = harness(); h.mount(); h.enter(); h.load();
    if (timeout) await h.expire(1000); else await h.decodeFailed();
    h.paint(); h.paint(); assert.equal(h.runs.length, 1); await h.finish();
    assert.equal(h.failures(), 0); h.unmount();
  }
});

test('reduced motion, unsupported observers and expired bootstrap stay native without a late reveal', async () => {
  for (const config of [{ reduced: true }, { observe: false }, { enabled: false }]) {
    const h = harness({ complete: true, ...config }); h.mount(); play(h); await h.decodeReady();
    assert.equal(h.root.dataset.imageState, 'ready'); assert.equal(h.runs.length, 0); h.unmount();
  }
});

test('boot disable or a live reduced-motion change cancels active media and prevents replay', async () => {
  for (const disable of [false, true]) {
    const h = harness({ complete: true }); h.mount(); await h.decodeReady(); play(h);
    if (disable) h.disable(); else h.motion(true);
    await flush(); h.motion(false); play(h);
    assert.equal(h.root.dataset.imageState, 'ready'); assert.equal(h.runs.length, 1);
    assert.equal(h.image.masked, false); h.unmount();
  }
});

test('the reveal watchdog releases a stalled overlay without failing a valid image', async () => {
  const h = harness({ complete: true }); h.mount(); await h.decodeReady(); play(h);
  await h.expire(decode ? 1500 : 400);
  assert.equal(h.root.dataset.imageState, 'ready'); assert.equal(h.image.masked, false);
  assert.equal(h.failures(), 0); h.unmount();
});
