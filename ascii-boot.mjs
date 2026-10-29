/** Opt in before the server-rendered body can paint. No storage or network work. */
export const asciiBootScript = `(() => {
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!motion || motion.matches || !('IntersectionObserver' in window) || !window.requestAnimationFrame) return;
  const disable = () => {
    delete document.documentElement.dataset.asciiBoot;
    window.clearTimeout(window.__asciiBootTimer);
    window.dispatchEvent(new Event('ascii:disabled'));
  };
  document.documentElement.dataset.asciiBoot = 'on';
  window.__asciiBootTimer = window.setTimeout(disable, 5000);
  motion.addEventListener('change', event => { if (event.matches) disable(); });
})();`;

/** Called after React has committed, including on routes with no content images. */
export function claimAsciiBoot() {
  globalThis.window?.clearTimeout(globalThis.window.__asciiBootTimer);
}

export function asciiEnabled() {
  return globalThis.document?.documentElement.dataset.asciiBoot === 'on';
}
