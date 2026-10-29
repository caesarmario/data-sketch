import { useEffect, useRef } from 'react';
import { createAsciiReveal, presets, type AsciiRevealController } from 'ascii-reveal/core';
import { asciiEnabled } from '../../ascii-boot.mjs';

const revealedByDocument = new WeakMap<Document, Set<string>>();

/** A fresh document starts covered in SSR; cached media follows the same reveal. */
export function useAsciiImage(
  src: string | undefined,
  onUnavailable: () => void,
  { srcSet, sizes }: { srcSet?: string; sizes?: string } = {},
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    const image = imageRef.current;
    const placeholder = placeholderRef.current;
    if (!src || !root || !image || !placeholder) return;

    const seen = revealedByDocument.get(root.ownerDocument) ?? new Set<string>();
    revealedByDocument.set(root.ownerDocument, seen);
    // The same artwork in Highlights and Mentoring owns a separate entrance.
    const scope = root.closest('section[id]')?.id ?? 'content';
    const key = JSON.stringify([window.location.pathname, scope, src, srcSet ?? '']);
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let active = true, done = false, unavailable = false, loadedOnce = false;
    let imageReady = false, visible = false, queued = false;
    let firstFrame = 0, secondFrame = 0;
    let deadline = 0, decodeDeadline = 0, animationDeadline = 0;
    let observer: IntersectionObserver | undefined;
    let controller: AsciiRevealController | undefined;

    const cancelFrames = () => {
      window.cancelAnimationFrame?.(firstFrame); window.cancelAnimationFrame?.(secondFrame);
      firstFrame = 0; secondFrame = 0; queued = false;
    };
    const clearTimers = () => {
      window.clearTimeout(deadline); window.clearTimeout(decodeDeadline);
      window.clearTimeout(animationDeadline);
    };
    const stop = () => {
      const running = controller; controller = undefined; running?.destroy();
      placeholder.hidden = true;
    };
    const native = () => {
      if (!active || unavailable) return;
      done = true; seen.add(key);
      cancelFrames(); clearTimers(); stop(); observer?.disconnect();
      root.removeAttribute('aria-busy'); root.dataset.imageState = 'ready';
    };
    const failed = () => {
      if (!active || unavailable) return;
      unavailable = true; done = true;
      cancelFrames(); clearTimers(); stop(); observer?.disconnect();
      root.removeAttribute('aria-busy'); root.dataset.imageState = 'unavailable';
      onUnavailable();
    };
    const start = () => {
      queued = false;
      if (!active || done || unavailable || !visible || !imageReady) return;
      if (!asciiEnabled() || motion?.matches || seen.has(key)) { native(); return; }
      seen.add(key);
      placeholder.hidden = false;
      try {
        const run = createAsciiReveal(root, {
          selector: 'img', media: 'img', preset: { ...presets.decode, color: 'accent' },
          duration: 'cinematic', speed: 1.8, origin: 'top-left',
          mascot: null, lazy: false, fallback: true,
        });
        controller = run;
        // The engine primes its own opacity hold synchronously. Release our
        // cover only after that hold exists, in the same task before painting.
        const finished = run.reveal({ within: image });
        root.dataset.imageState = 'revealing'; placeholder.hidden = true;
        animationDeadline = window.setTimeout(native, 1500);
        const restore = () => { if (controller === run) native(); };
        void finished.then(restore, restore);
      } catch { native(); }
    };
    const revealIfReady = () => {
      if (!active || done || unavailable || queued || !visible || !imageReady) return;
      if (!asciiEnabled() || motion?.matches) { native(); return; }
      queued = true;
      // Two animation frames give the server-rendered green scaffold a painted
      // frame before transitioning, even when every image is already cached.
      firstFrame = window.requestAnimationFrame(() => {
        firstFrame = 0;
        secondFrame = window.requestAnimationFrame(() => { secondFrame = 0; start(); });
      });
    };
    const decoded = () => {
      if (!active || done || unavailable || imageReady) return;
      window.clearTimeout(decodeDeadline);
      imageReady = true; root.removeAttribute('aria-busy'); revealIfReady();
    };
    const loaded = () => {
      if (!active || done || unavailable || loadedOnce) return;
      if (image.naturalWidth === 0) { failed(); return; }
      loadedOnce = true; window.clearTimeout(deadline);
      if (!image.decode) { decoded(); return; }
      decodeDeadline = window.setTimeout(decoded, 1000);
      try { void image.decode().then(decoded, decoded); }
      catch { decoded(); }
    };
    const disabled = () => native();
    const motionChanged = () => { if (motion?.matches) native(); };

    image.addEventListener('load', loaded); image.addEventListener('error', failed);
    motion?.addEventListener('change', motionChanged);
    window.addEventListener('ascii:disabled', disabled);
    root.dataset.asciiOwned = 'true';
    if (image.complete && image.naturalWidth === 0) failed();
    else if (!asciiEnabled() || motion?.matches || !('IntersectionObserver' in window) || seen.has(key)) native();
    else {
      root.dataset.imageState = 'pending';
      if (image.complete) loaded();
      observer = new IntersectionObserver(([entry]) => {
        if (!entry || !active || done || unavailable) return;
        visible = entry.isIntersecting && entry.intersectionRatio >= .15;
        if (!visible) {
          cancelFrames();
          if (root.dataset.imageState === 'revealing') native();
          return;
        }
        if (image.complete && !loadedOnce) loaded();
        if (!loadedOnce) {
          root.setAttribute('aria-busy', 'true');
          if (!deadline) deadline = window.setTimeout(failed, 15000);
        }
        revealIfReady();
      }, { threshold: .15 });
      observer.observe(root);
    }

    return () => {
      active = false; cancelFrames(); clearTimers(); stop(); observer?.disconnect();
      image.removeEventListener('load', loaded); image.removeEventListener('error', failed);
      motion?.removeEventListener('change', motionChanged);
      window.removeEventListener('ascii:disabled', disabled);
      root.removeAttribute('aria-busy'); delete root.dataset.asciiOwned;
      // Preserve the scaffold during an unconsumed Strict Mode setup. Its HTML
      // belongs to React and must not be destroyed by effect cleanup.
      root.dataset.imageState = seen.has(key) ? 'ready' : 'pending';
    };
  }, [src, srcSet, sizes, onUnavailable]);

  return { containerRef, imageRef, placeholderRef };
}
