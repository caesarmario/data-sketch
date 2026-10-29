import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/hooks/useAsciiImage.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
} }).outputText;
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 16; i++) await Promise.resolve(); };

// Real hook, controlled image/module arrival and viewport events. Browser QA
// separately verifies actual canvas frames, native cache, CSS and hydration.
function harness({ complete = false, valid = true, reduced = false, options = {}, observe = true } = {}) {
  const image = Object.assign(new EventTarget(), { complete, naturalWidth: complete && valid ? 1080 : 0, masked: false });
  const attrs = new Map();
  const rect = { width: 320, height: 400, top: 1800, bottom: 2200 };
  const root = { dataset: {}, clientHeight: 400, ownerDocument: {},
    setAttribute: (key, value) => attrs.set(key, value), removeAttribute: key => attrs.delete(key),
    getBoundingClientRect: () => rect,
  };
  const placeholder = { hidden: true, innerHTML: '', writes: 0,
    replaceChildren() { this.innerHTML = ''; this.writes++; },
  };
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const chunk = deferred(), timers = new Map(), observers = [], runs = [];
  const stats = { imports: 0, failures: 0, skeletons: 0, shimmering: 0, reveals: 0, destroyed: 0 };
  let timerId = 0, install, cleanup, refIndex = 0, refs = [];
  class Observer {
    constructor(callback, settings = {}) { this.callback = callback; this.settings = settings; this.active = false; observers.push(this); }
    observe() { this.active = true; }
    disconnect() { this.active = false; }
  }
  const library = {
    asciiSkeletonHTML: () => { stats.skeletons++; return '<span data-ascii-skeleton></span>'; },
    animateSkeletons: () => { stats.shimmering++; return () => { stats.shimmering--; }; },
    createAsciiReveal: () => {
      const done = deferred();
      const run = { done, disposed: false,
        reveal: () => { stats.reveals++; image.masked = true; return done.promise; },
        destroy: () => {
          if (run.disposed) return;
          run.disposed = true; stats.destroyed++; image.masked = false; done.resolve();
        },
      };
      runs.push(run); return run;
    },
  };
  const module = { exports: {} };
  const browserWindow = { innerHeight: 844, location: { pathname: '/' }, matchMedia: () => motion,
    ...(observe ? { IntersectionObserver: Observer } : {}),
    setTimeout: (callback, ms) => { timers.set(++timerId, { callback, ms }); return timerId; },
    clearTimeout: id => timers.delete(id),
  };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, IntersectionObserver: Observer, window: browserWindow,
    require: name => {
      if (name === 'react') return {
        useRef: initial => { const i = refIndex++; return refs[i] ??= { current: i < 3 ? [root, image, placeholder][i] : initial }; },
        useEffect: effect => { install = effect; },
      };
      assert.equal(name, 'ascii-reveal'); stats.imports++; return chunk.promise;
    },
  });
  let src = '/preview.jpg', currentOptions = options;
  const render = () => {
    refIndex = 0;
    module.exports.useAsciiImage(src, () => { stats.failures++; }, currentOptions);
  };
  const signal = (near, inside) => {
    for (const observer of [...observers]) {
      const preload = parseFloat(observer.settings.rootMargin || '0') > 0;
      if (observer.active && preload === near) observer.callback([{ isIntersecting: inside, intersectionRatio: inside ? 1 : 0 }]);
    }
  };
  render();
  return { root, image, placeholder, attrs, stats, runs, timers,
    mount() { cleanup = install(); },
    unmount() { cleanup?.(); },
    remount() { cleanup?.(); refs = []; render(); cleanup = install(); },
    updateOptions(opts) { cleanup?.(); currentOptions = opts; render(); cleanup = install(); },
    changeSource(next) { cleanup?.(); src = next; render(); cleanup = install(); },
    approach() { signal(true, true); },
    enter() { rect.top = 100; rect.bottom = 500; signal(false, true); },
    exit() { rect.top = 1800; rect.bottom = 2200; signal(false, false); },
    async moduleReady() { chunk.resolve(library); await flush(); },
    async moduleFailed() { chunk.reject(new Error('Chunk unavailable')); await flush(); },
    load() { image.complete = true; image.naturalWidth = 1080; image.dispatchEvent(new Event('load')); },
    fail() { image.complete = true; image.naturalWidth = 0; image.dispatchEvent(new Event('error')); },
    motion(value) { motion.matches = value; motion.dispatchEvent(new Event('change')); },
    expire(ms) { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.callback(); } },
  };
}

async function finish(h) { h.runs.at(-1).done.resolve(); await flush(); }

test('SSR and initial priority media stay native without importing animation', async () => {
  const server = harness();
  assert.equal(server.stats.imports, 0); assert.equal(server.attrs.size, 0);
  assert.equal(server.placeholder.hidden, true);
  for (const config of [{ options: { priority: true } }, { observe: false }]) {
    const h = harness(config); h.mount(); h.approach(); h.enter(); await flush();
    assert.equal(h.stats.imports, 0); assert.equal(h.image.masked, false);
    assert.equal(h.timers.size, 0); h.unmount();
  }
});

test('cached previews prepare early and reveal once at actual viewport entry', async () => {
  const h = harness({ complete: true }); h.mount();
  assert.equal(h.stats.imports, 0);
  h.approach(); await h.moduleReady();
  assert.equal(h.stats.imports, 1); assert.equal(h.stats.reveals, 0);
  assert.equal(h.stats.skeletons, 0); assert.equal(h.image.masked, false);
  h.enter(); assert.equal(h.stats.reveals, 1);
  await finish(h); assert.equal(h.root.dataset.imageState, 'ready');
  assert.equal(h.image.masked, false); h.unmount();
});

test('a pending visible image shows a real skeleton, then decodes without replacing the image', async () => {
  const h = harness(); h.mount(); h.approach(); await h.moduleReady();
  assert.equal(h.placeholder.hidden, true); assert.equal(h.timers.size, 0);
  h.enter(); assert.equal(h.attrs.get('aria-busy'), 'true');
  assert.equal(h.placeholder.hidden, false); assert.equal(h.stats.shimmering, 1);
  h.load(); assert.equal(h.placeholder.hidden, true);
  assert.equal(h.attrs.has('aria-busy'), false); assert.equal(h.stats.reveals, 1);
  await finish(h); assert.equal(h.stats.shimmering, 0); h.unmount();
});

test('image-before-module arrival remains visible and still receives its queued reveal', async () => {
  const h = harness(); h.mount(); h.approach(); h.enter(); h.load();
  assert.equal(h.image.masked, false); assert.equal(h.stats.reveals, 0);
  await h.moduleReady(); assert.equal(h.stats.skeletons, 0);
  assert.equal(h.stats.reveals, 1); await finish(h); h.unmount();
});

test('an image loaded offscreen waits for visible entry instead of spending its reveal early', async () => {
  const h = harness(); h.mount(); h.approach(); await h.moduleReady(); h.load();
  assert.equal(h.stats.reveals, 0); h.enter(); assert.equal(h.stats.reveals, 1);
  await finish(h); h.unmount();
});

test('leaving before the module arrives queues the first reveal for the next visible entry', async () => {
  const h = harness({ complete: true }); h.mount(); h.approach(); h.enter(); h.exit();
  await h.moduleReady(); assert.equal(h.stats.reveals, 0);
  h.enter(); assert.equal(h.stats.reveals, 1); await finish(h); h.unmount();
});

test('scroll, effect replay, filter remount and size changes cannot replay the same preview', async () => {
  const h = harness({ complete: true }); h.mount(); h.approach(); await h.moduleReady(); h.enter();
  await finish(h); h.exit(); h.enter(); h.remount(); h.approach(); h.enter();
  h.updateOptions({ sizes: '80vw' }); h.approach(); h.enter(); await flush();
  assert.equal(h.stats.reveals, 1); assert.equal(h.image.masked, false); h.unmount();
});

test('sorting priority changes do not reclassify an initially non-priority preview', async () => {
  const h = harness({ complete: true }); h.mount(); h.updateOptions({ priority: true });
  h.approach(); await h.moduleReady(); h.enter();
  assert.equal(h.stats.reveals, 1); await finish(h); h.unmount();
  const first = harness({ complete: true, options: { priority: true } }); first.mount();
  first.updateOptions({ priority: false }); first.approach(); await first.moduleReady(); first.enter();
  assert.equal(first.stats.reveals, 0); first.unmount();
});

test('a genuinely different source gets its own first reveal; unmount restores a playing image', async () => {
  const h = harness({ complete: true }); h.mount(); h.approach(); await h.moduleReady(); h.enter();
  await finish(h); h.changeSource('/replacement.jpg'); h.approach(); await flush(); h.enter();
  assert.equal(h.stats.reveals, 2); assert.equal(h.image.masked, true);
  h.unmount(); await flush(); assert.equal(h.image.masked, false); assert.equal(h.timers.size, 0);
});

test('late module success and failure cannot mutate a cleaned-up Strict Mode setup', async () => {
  for (const reject of [false, true]) {
    const h = harness(); h.mount(); h.approach(); h.enter(); await flush(); h.unmount();
    const writes = h.placeholder.writes;
    if (reject) await h.moduleFailed(); else await h.moduleReady();
    assert.equal(h.placeholder.writes, writes); assert.equal(h.stats.skeletons, 0);
    assert.equal(h.timers.size, 0); assert.equal(h.attrs.size, 0);
  }
});

test('failed images and the real loading deadline expose the fallback exactly once', async () => {
  for (const expire of [false, true]) {
    const h = harness(); h.mount(); h.approach(); await h.moduleReady(); h.enter();
    if (expire) h.expire(15000); else h.fail();
    assert.equal(h.root.dataset.imageState, 'unavailable'); assert.equal(h.placeholder.hidden, true);
    assert.equal(h.attrs.has('aria-busy'), false); assert.equal(h.stats.shimmering, 0);
    h.load(); h.fail(); assert.equal(h.stats.failures, 1); assert.equal(h.stats.reveals, 0); h.unmount();
  }
  const early = harness({ complete: true, valid: false }); early.mount();
  assert.equal(early.stats.failures, 1); assert.equal(early.stats.imports, 0); early.unmount();
});

test('reduced motion keeps cached content native and stops an active reveal without replay', async () => {
  const cached = harness({ complete: true, reduced: true }); cached.mount(); cached.approach(); cached.enter();
  await flush(); assert.equal(cached.stats.imports, 0); assert.equal(cached.stats.reveals, 0); cached.unmount();
  const h = harness(); h.mount(); h.approach(); await h.moduleReady(); h.enter(); h.motion(true);
  assert.equal(h.stats.shimmering, 0); h.motion(false); assert.equal(h.stats.shimmering, 1);
  h.load(); assert.equal(h.image.masked, true); h.motion(true); await flush();
  assert.equal(h.image.masked, false); h.motion(false); h.exit(); h.enter();
  assert.equal(h.stats.reveals, 1); h.unmount();
});

test('blocked modules and stalled decoding cannot leave a successful image hidden', async () => {
  const blocked = harness(); blocked.mount(); blocked.approach(); blocked.enter(); await blocked.moduleFailed();
  blocked.load(); assert.equal(blocked.root.dataset.imageState, 'ready');
  assert.equal(blocked.stats.failures, 0); assert.equal(blocked.image.masked, false); blocked.unmount();
  const stalled = harness({ complete: true }); stalled.mount(); stalled.approach(); await stalled.moduleReady(); stalled.enter();
  assert.equal(stalled.image.masked, true); stalled.expire(1500); await flush();
  assert.equal(stalled.image.masked, false); assert.equal(stalled.root.dataset.imageState, 'ready'); stalled.unmount();
});
