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
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

// Exercise the real hook with controlled network/visibility/timer boundaries.
// Browser QA separately covers actual canvas drawing, CSS and hydration.
function harness({ complete = false, valid = true, reduced = false, options = {} } = {}) {
  const image = Object.assign(new EventTarget(), { complete, naturalWidth: complete && valid ? 1080 : 0, masked: false });
  const attrs = new Map();
  const root = { dataset: {}, clientHeight: 400,
    setAttribute: (key, value) => attrs.set(key, value), removeAttribute: key => attrs.delete(key),
    getBoundingClientRect: () => ({ width: 320, height: 400, top: 100, bottom: 500 }),
  };
  const placeholder = { hidden: true, innerHTML: '', writes: 0,
    replaceChildren() { this.innerHTML = ''; this.writes++; },
  };
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const chunk = deferred();
  const timers = new Map();
  const stats = { imports: 0, failures: 0, skeletons: 0, shimmering: 0, reveals: 0, destroyed: 0 };
  const runs = [];
  let timerId = 0, intersect, install, cleanup, refIndex = 0;
  const refs = [root, image, placeholder].map(current => ({ current }));
  class Observer {
    constructor(callback) { intersect = () => callback([{ isIntersecting: true }]); }
    observe() {}
    disconnect() {}
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
      runs.push(run);
      return run;
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, IntersectionObserver: Observer,
    window: { IntersectionObserver: Observer, innerHeight: 844, matchMedia: () => motion,
      setTimeout: (callback, ms) => { timers.set(++timerId, { callback, ms }); return timerId; },
      clearTimeout: id => timers.delete(id),
    },
    require: name => {
      if (name === 'react') return {
        useRef: () => refs[refIndex++], useEffect: effect => { install = effect; },
      };
      assert.equal(name, 'ascii-reveal'); stats.imports++; return chunk.promise;
    },
  });
  const render = (src = '/preview.jpg', opts = options) => {
    refIndex = 0;
    module.exports.useAsciiImage(src, () => { stats.failures++; }, opts);
  };
  render();
  return { root, image, placeholder, attrs, stats, runs, timers,
    mount() { cleanup = install(); },
    unmount() { cleanup?.(); },
    changeSource(src) { cleanup?.(); render(src); cleanup = install(); },
    visible() { intersect?.(); },
    async moduleReady() { chunk.resolve(library); await flush(); },
    async moduleFailed() { chunk.reject(new Error('Chunk unavailable')); await flush(); },
    load() { image.complete = true; image.naturalWidth = 1080; image.dispatchEvent(new Event('load')); },
    fail() { image.complete = true; image.naturalWidth = 0; image.dispatchEvent(new Event('error')); },
    motion(value) { motion.matches = value; motion.dispatchEvent(new Event('change')); },
    expire(ms) { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.callback(); } },
  };
}

test('server render, cached images and priority media never import or wait for animation', async () => {
  const server = harness();
  assert.equal(server.stats.imports, 0);
  assert.equal(server.placeholder.hidden, true);
  assert.equal(server.attrs.size, 0);
  for (const config of [{ complete: true }, { options: { priority: true } }]) {
    const h = harness(config); h.mount(); h.visible(); await flush();
    assert.equal(h.stats.imports, 0);
    assert.equal(h.timers.size, 0);
    assert.equal(h.image.masked, false);
    assert.equal(h.attrs.size, 0);
    h.unmount();
  }
});

test('offscreen images do no work; pending visible images become readable and clean up after one reveal', async () => {
  const h = harness(); h.mount();
  assert.equal(h.timers.size, 0);
  assert.equal(h.stats.imports, 0);
  h.visible(); await h.moduleReady();
  assert.equal(h.attrs.get('aria-busy'), 'true');
  assert.equal(h.placeholder.hidden, false);
  assert.equal(h.stats.shimmering, 1);
  assert.equal(h.image.masked, false);
  h.load();
  assert.equal(h.attrs.has('aria-busy'), false);
  assert.equal(h.placeholder.hidden, true);
  assert.equal(h.stats.reveals, 1);
  h.runs[0].done.resolve(); await flush();
  assert.equal(h.root.dataset.imageState, 'ready');
  assert.equal(h.stats.shimmering, 0);
  assert.equal(h.image.masked, false);
  h.load();
  assert.equal(h.stats.reveals, 1);
  h.unmount();
});

test('an image arriving before the animation chunk never disappears when the late chunk arrives', async () => {
  const h = harness(); h.mount(); h.visible(); h.load();
  assert.equal(h.root.dataset.imageState, 'ready');
  await h.moduleReady();
  assert.equal(h.stats.skeletons, 0);
  assert.equal(h.stats.reveals, 0);
  assert.equal(h.image.masked, false);
  h.unmount();
});

test('late chunk success and failure cannot mutate a cleaned-up Strict Mode setup', async () => {
  for (const reject of [false, true]) {
    const h = harness(); h.mount(); h.visible(); await flush(); h.unmount();
    const writes = h.placeholder.writes;
    if (reject) await h.moduleFailed(); else await h.moduleReady();
    assert.equal(h.placeholder.writes, writes);
    assert.equal(h.stats.skeletons, 0);
    assert.equal(h.timers.size, 0);
    assert.equal(h.attrs.size, 0);
  }
});

test('failed images and real loading deadlines stop busy indicators and expose a fallback once', async () => {
  for (const expire of [false, true]) {
    const h = harness(); h.mount(); h.visible(); await h.moduleReady();
    if (expire) h.expire(15000); else h.fail();
    assert.equal(h.root.dataset.imageState, 'unavailable');
    assert.equal(h.placeholder.hidden, true);
    assert.equal(h.attrs.has('aria-busy'), false);
    assert.equal(h.stats.shimmering, 0);
    h.load(); h.fail();
    assert.equal(h.stats.failures, 1);
    assert.equal(h.stats.reveals, 0);
    h.unmount();
  }
  const early = harness({ complete: true, valid: false }); early.mount();
  assert.equal(early.stats.failures, 1);
  assert.equal(early.stats.imports, 0);
  early.unmount();
});

test('reduced motion stops shimmer and immediately restores media even during a reveal', async () => {
  const h = harness(); h.mount(); h.visible(); await h.moduleReady();
  h.motion(true);
  assert.equal(h.stats.shimmering, 0);
  h.motion(false);
  assert.equal(h.stats.shimmering, 1);
  h.load(); assert.equal(h.image.masked, true);
  h.motion(true); await flush();
  assert.equal(h.image.masked, false);
  assert.equal(h.root.dataset.imageState, 'ready');
  h.unmount();
});

test('source replacement and unmount restore media without stale callbacks from the old request', async () => {
  const h = harness(); h.mount(); h.visible(); await h.moduleReady();
  h.load(); assert.equal(h.image.masked, true);
  h.image.complete = false;
  h.changeSource('/replacement.jpg');
  assert.equal(h.image.masked, false);
  h.visible(); await flush(); h.load();
  assert.equal(h.stats.reveals, 2);
  h.unmount(); await flush();
  assert.equal(h.image.masked, false);
  assert.equal(h.stats.shimmering, 0);
  assert.equal(h.timers.size, 0);
});

test('a blocked animation chunk or stalled decode cannot keep a successful image hidden', async () => {
  const blocked = harness(); blocked.mount(); blocked.visible(); await blocked.moduleFailed();
  blocked.load();
  assert.equal(blocked.root.dataset.imageState, 'ready');
  assert.equal(blocked.stats.failures, 0);
  assert.equal(blocked.image.masked, false);
  blocked.unmount();
  const stalled = harness(); stalled.mount(); stalled.visible(); await stalled.moduleReady();
  stalled.load(); assert.equal(stalled.image.masked, true);
  stalled.expire(1500); await flush();
  assert.equal(stalled.image.masked, false);
  assert.equal(stalled.root.dataset.imageState, 'ready');
  stalled.unmount();
});
