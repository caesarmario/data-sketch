import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowUp } from 'lucide-react';

const threshold = () => Math.max(400, window.innerHeight * 0.75);

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        setProgress(maxScroll ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0);
        setVisible(maxScroll > threshold() && window.scrollY > threshold());
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const returnToTop = () => {
    const main = document.querySelector<HTMLElement>('main');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (reduceMotion) {
      main?.focus({ preventScroll: true });
      return;
    }

    const startedAt = performance.now();
    const restoreFocus = () => {
      if (window.scrollY <= 1) {
        main?.focus({ preventScroll: true });
        return;
      }
      if (performance.now() - startedAt > 2500) {
        window.scrollTo({ top: 0, behavior: 'auto' });
        main?.focus({ preventScroll: true });
        return;
      }
      requestAnimationFrame(restoreFocus);
    };
    requestAnimationFrame(restoreFocus);
  };

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      aria-label="Back to top"
      aria-hidden={!visible}
      disabled={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={returnToTop}
      style={{ '--scroll-progress': progress } as CSSProperties}
    >
      <svg className="back-to-top-progress" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="20" pathLength="100" />
      </svg>
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
