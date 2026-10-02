import { useEffect, useRef } from 'react';

export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.setProperty('--pointer-x', `${event.clientX}px`);
          ref.current.style.setProperty('--pointer-y', `${event.clientY}px`);
        }
      });
    };
    const sync = () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
      if (query.matches) window.addEventListener('pointermove', move, { passive: true });
    };
    sync();
    query.addEventListener('change', sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); query.removeEventListener('change', sync); };
  }, []);
  return <div ref={ref} className="spotlight" aria-hidden="true" />;
}
