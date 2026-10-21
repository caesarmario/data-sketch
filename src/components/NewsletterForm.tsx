import { useEffect, useRef, useState } from 'react';
import { newsletterConfig } from '../../newsletter.config.mjs';

export default function NewsletterForm() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let script: HTMLScriptElement | undefined;
    let frame: HTMLIFrameElement | undefined;
    const loaded = () => setStatus('ready');
    const failed = () => setStatus('unavailable');
    const observer = new MutationObserver(() => {
      const next = container.querySelector('iframe');
      if (!next || next === frame) return;
      frame = next;
      frame.title = 'Subscribe to the Data Sketch newsletter';
      frame.addEventListener('load', loaded);
    });
    observer.observe(container, { childList: true, subtree: true });
    // Cancel the first Strict Mode setup before loading a third-party script.
    const start = window.setTimeout(() => {
      script = document.createElement('script');
      script.async = true;
      script.src = newsletterConfig.loaderUrl;
      script.dataset.beehiivForm = newsletterConfig.formId;
      script.addEventListener('error', failed);
      container.appendChild(script);
    }, 0);
    const deadline = window.setTimeout(() => {
      setStatus(current => current === 'ready' ? current : 'unavailable');
    }, 15000);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(deadline);
      observer.disconnect();
      frame?.removeEventListener('load', loaded);
      script?.removeEventListener('error', failed);
      script?.remove();
      container.replaceChildren();
    };
  }, []);

  return (
    <section className="newsletter-signup" aria-label="Newsletter signup">
      <div className="newsletter-form-host" ref={host} />
      {status !== 'ready' && <p className="newsletter-form-status" role="status">{status === 'loading' ? 'Loading the signup form…' : 'The signup form has not loaded. You can open it using the link below.'}</p>}
      <p className="newsletter-form-help"><a href={newsletterConfig.formUrl}>Open the signup form</a><span aria-hidden="true"> · </span><a href={newsletterConfig.privacyPath}>Privacy</a></p>
      <noscript><p>JavaScript is off. Use the signup link above to subscribe on beehiiv.</p></noscript>
    </section>
  );
}
