import { useEffect, useRef } from 'react';
import type { AsciiRevealController } from 'ascii-reveal';

/** Enhance genuinely pending images; SSR and cache hits keep the native image. */
export function useAsciiImage(
  src: string | undefined,
  onUnavailable: () => void,
  { srcSet, sizes, priority = false }: { srcSet?: string; sizes?: string; priority?: boolean } = {},
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    const image = imageRef.current;
    const placeholder = placeholderRef.current;
    if (!src || !root || !image || !placeholder) return;
    // A priority/LCP image keeps its native rendering and never waits for an effect.
    if (priority) {
      const failed = () => onUnavailable();
      image.addEventListener('error', failed);
      if (image.complete && image.naturalWidth === 0) failed();
      return () => image.removeEventListener('error', failed);
    }

    let active = true;
    let pending = false;
    let settled = false;
    let deadline = 0;
    let animationDeadline = 0;
    let library: typeof import('ascii-reveal') | undefined;
    let controller: AsciiRevealController | undefined;
    let stopSkeleton: (() => void) | undefined;
    let observer: IntersectionObserver | undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const clearPlaceholder = () => {
      stopSkeleton?.();
      stopSkeleton = undefined;
      placeholder.hidden = true;
      placeholder.replaceChildren();
    };
    const stopReveal = () => {
      window.clearTimeout(animationDeadline);
      controller?.destroy();
      controller = undefined;
      if (active && root.dataset.imageState === 'revealing') root.dataset.imageState = 'ready';
    };
    const inView = () => {
      const rect = root.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight + 120;
    };
    const finish = (failed = false) => {
      if (!active || settled) return;
      settled = true;
      window.clearTimeout(deadline);
      observer?.disconnect();
      clearPlaceholder();
      root.removeAttribute('aria-busy');
      root.dataset.imageState = failed ? 'unavailable' : 'ready';
      if (failed) {
        stopReveal();
        onUnavailable();
        return;
      }
      // Never wait for the animation chunk or replay an already painted/cached image.
      if (!pending || !library || motion.matches || !inView()) return;
      try {
        const run = library.createAsciiReveal(root, {
          selector: 'img', media: 'img', preset: 'decode', duration: 'fast',
          origin: 'top-left', mascot: null, lazy: false, fallback: true,
        });
        controller = run;
        root.dataset.imageState = 'revealing';
        // A visual effect must never leave a successfully loaded image hidden.
        animationDeadline = window.setTimeout(stopReveal, 1500);
        void run.reveal({ within: image }).catch(() => {}).finally(() => {
          if (controller === run) stopReveal();
        });
      } catch {
        stopReveal();
        root.dataset.imageState = 'ready';
      }
    };
    const loaded = () => finish(image.naturalWidth === 0);
    const failed = () => finish(true);
    const activate = () => {
      observer?.disconnect();
      if (!active || settled) return;
      if (image.complete) { loaded(); return; }
      pending = true;
      root.dataset.imageState = 'loading';
      root.setAttribute('aria-busy', 'true');
      deadline = window.setTimeout(failed, 15000);
      // Deferred until a pending preview approaches the viewport; never blocks rendering.
      void import('ascii-reveal').then(module => {
        if (!active || settled) return;
        library = module;
        placeholder.innerHTML = module.asciiSkeletonHTML({
          variant: 'dither', rows: Math.max(1, Math.min(64, Math.ceil(root.clientHeight / 14))),
          // Keep the marker so a later preference change can start the shimmer.
          animate: true,
        });
        placeholder.hidden = false;
        if (!motion.matches) stopSkeleton = module.animateSkeletons(placeholder);
      }).catch(() => { if (active) clearPlaceholder(); });
    };
    const motionChanged = () => {
      if (motion.matches) {
        stopSkeleton?.();
        stopSkeleton = undefined;
        stopReveal();
      } else if (library && pending && !settled && !placeholder.hidden) {
        stopSkeleton = library.animateSkeletons(placeholder);
      }
    };

    image.addEventListener('load', loaded);
    image.addEventListener('error', failed);
    motion.addEventListener('change', motionChanged);
    if (image.complete) loaded();
    else if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) activate();
      }, { rootMargin: '120px' });
      observer.observe(root);
    } else activate();

    return () => {
      active = false;
      window.clearTimeout(deadline);
      observer?.disconnect();
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', failed);
      motion.removeEventListener('change', motionChanged);
      stopReveal();
      clearPlaceholder();
      root.removeAttribute('aria-busy');
      delete root.dataset.imageState;
    };
  }, [src, srcSet, sizes, priority, onUnavailable]);

  return { containerRef, imageRef, placeholderRef };
}
