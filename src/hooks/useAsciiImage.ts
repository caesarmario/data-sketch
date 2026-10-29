import { useEffect, useRef } from 'react';
import type { AsciiRevealController } from 'ascii-reveal';

type AsciiLibrary = typeof import('ascii-reveal');
const revealedByDocument = new WeakMap<Document, Set<string>>();
let libraryPromise: Promise<AsciiLibrary> | undefined;
const loadLibrary = () => libraryPromise ??= import('ascii-reveal');

/** Real loading feedback plus one viewport reveal, including cached previews. */
export function useAsciiImage(
  src: string | undefined,
  onUnavailable: () => void,
  { srcSet, sizes, priority = false }: { srcSet?: string; sizes?: string; priority?: boolean } = {},
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  // Sorting may change fetch priority later; it must not change animation eligibility.
  const initialPriority = useRef(priority);

  useEffect(() => {
    const root = containerRef.current;
    const image = imageRef.current;
    const placeholder = placeholderRef.current;
    if (!src || !root || !image || !placeholder) return;

    const doc = root.ownerDocument;
    const seen = revealedByDocument.get(doc) ?? new Set<string>();
    revealedByDocument.set(doc, seen);
    const key = JSON.stringify([window.location.pathname, src, srcSet ?? '']);
    if (initialPriority.current || !('IntersectionObserver' in window)) {
      seen.add(key);
      const failed = () => onUnavailable();
      image.addEventListener('error', failed);
      if (image.complete && image.naturalWidth === 0) failed();
      return () => image.removeEventListener('error', failed);
    }

    let active = true, ready = false, unavailable = false;
    let near = false, visible = false, prepared = false, moduleFailed = false;
    let skeletonShown = false;
    let deadline = 0, animationDeadline = 0;
    let library: AsciiLibrary | undefined;
    let controller: AsciiRevealController | undefined;
    let stopSkeleton: (() => void) | undefined;
    let preloadObserver: IntersectionObserver | undefined;
    let viewportObserver: IntersectionObserver | undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const clearPlaceholder = () => {
      stopSkeleton?.(); stopSkeleton = undefined;
      placeholder.hidden = true;
      placeholder.replaceChildren();
      skeletonShown = false;
    };
    const stopReveal = () => {
      window.clearTimeout(animationDeadline);
      controller?.destroy(); controller = undefined;
      if (active && ready && !unavailable) root.dataset.imageState = 'ready';
      if (seen.has(key)) viewportObserver?.disconnect();
    };
    const native = () => {
      seen.add(key);
      root.dataset.imageState = 'ready';
      viewportObserver?.disconnect();
      preloadObserver?.disconnect();
    };
    const revealIfReady = () => {
      if (!active || unavailable || !ready || !visible || controller) return;
      if (seen.has(key) || motion.matches || moduleFailed) { native(); return; }
      // Loading the effect never hides an image. Keep the reveal queued until ready.
      if (!library) return;
      seen.add(key);
      try {
        const run = library.createAsciiReveal(root, {
          selector: 'img', media: 'img', preset: 'decode', duration: 'fast',
          origin: 'top-left', mascot: null, lazy: false, fallback: true,
        });
        controller = run;
        root.dataset.imageState = 'revealing';
        animationDeadline = window.setTimeout(stopReveal, 1500);
        void run.reveal({ within: image }).catch(() => {}).finally(() => {
          if (controller === run) stopReveal();
        });
      } catch {
        stopReveal(); native();
      }
    };
    const showSkeleton = () => {
      if (!active || ready || unavailable || !visible || !library || moduleFailed) return;
      if (!skeletonShown) {
        placeholder.innerHTML = library.asciiSkeletonHTML({
          variant: 'dither', rows: Math.max(1, Math.min(64, Math.ceil(root.clientHeight / 14))),
          animate: true,
        });
        skeletonShown = true;
      }
      placeholder.hidden = false;
      if (!motion.matches && !stopSkeleton) stopSkeleton = library.animateSkeletons(placeholder);
    };
    const failed = () => {
      if (!active || unavailable) return;
      unavailable = true;
      window.clearTimeout(deadline);
      stopReveal(); clearPlaceholder();
      viewportObserver?.disconnect(); preloadObserver?.disconnect();
      root.removeAttribute('aria-busy');
      root.dataset.imageState = 'unavailable';
      onUnavailable();
    };
    const loaded = () => {
      if (!active || unavailable || ready) return;
      if (image.naturalWidth === 0) { failed(); return; }
      ready = true;
      window.clearTimeout(deadline);
      clearPlaceholder(); root.removeAttribute('aria-busy');
      root.dataset.imageState = 'ready';
      revealIfReady();
    };
    const prepare = () => {
      if (!active || unavailable || prepared || (ready && (seen.has(key) || motion.matches))) return;
      prepared = true;
      void loadLibrary().then(module => {
        if (!active || unavailable) return;
        library = module;
        showSkeleton(); revealIfReady();
      }).catch(() => {
        if (!active) return;
        moduleFailed = true;
        clearPlaceholder(); revealIfReady();
      });
    };
    const motionChanged = () => {
      if (motion.matches) {
        stopSkeleton?.(); stopSkeleton = undefined;
        stopReveal();
      } else {
        if (near) prepare();
        showSkeleton();
      }
      revealIfReady();
    };

    image.addEventListener('load', loaded);
    image.addEventListener('error', failed);
    motion.addEventListener('change', motionChanged);
    if (image.complete) loaded();
    if (!unavailable && (!ready || !seen.has(key))) {
      // Preparation and playback have different boundaries: never spend a reveal offscreen.
      preloadObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        near = true; preloadObserver?.disconnect(); prepare();
      }, { rootMargin: '600px' });
      viewportObserver = new IntersectionObserver(([entry]) => {
        if (!entry || !active) return;
        visible = entry.isIntersecting && entry.intersectionRatio >= .15;
        if (!visible) { if (controller) stopReveal(); return; }
        near = true; prepare();
        if (!ready && !unavailable) {
          root.dataset.imageState = 'loading'; root.setAttribute('aria-busy', 'true');
          if (!deadline) deadline = window.setTimeout(failed, 15000);
          showSkeleton();
        }
        revealIfReady();
      }, { threshold: .15 });
      preloadObserver.observe(root);
      viewportObserver.observe(root);
    }

    return () => {
      active = false;
      window.clearTimeout(deadline);
      preloadObserver?.disconnect(); viewportObserver?.disconnect();
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', failed);
      motion.removeEventListener('change', motionChanged);
      stopReveal(); clearPlaceholder();
      root.removeAttribute('aria-busy');
      delete root.dataset.imageState;
    };
  }, [src, srcSet, sizes, onUnavailable]);

  return { containerRef, imageRef, placeholderRef };
}
