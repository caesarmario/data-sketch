/** One production-only loader. Both IDs are public site identifiers. */
export function initializeAnalytics(policy, view = globalThis.window, doc = globalThis.document) {
  if (view.location.hostname !== policy.hostname || view.__dataSketchAnalytics) return;
  view.__dataSketchAnalytics = true;
  const cleanUrl = (value, local = false) => {
    if (!value) return '';
    try {
      const url = new URL(value, view.location.origin);
      if (!/^https?:$/.test(url.protocol) || (local && url.hostname !== policy.hostname)) return '';
      return local ? url.pathname : `${url.origin}${url.pathname}`;
    } catch { return ''; }
  };
  // Current Umami calls this with one payload; older trackers used (type, payload).
  view.dataSketchBeforeSend = (first, second) => {
    const payload = second ?? first;
    if (!payload || typeof payload !== 'object') return null;
    const result = { ...payload,
      url: cleanUrl(payload.url || view.location.href, true),
      referrer: cleanUrl(payload.referrer),
    };
    if (!result.url) return null;
    delete result.data;
    delete result.properties;
    return result;
  };
  const append = (src, attributes) => {
    if (doc.querySelector(`script[src="${src}"]`)) return;
    const script = doc.createElement('script');
    script.defer = true; script.src = src;
    for (const [key, value] of Object.entries(attributes)) script.setAttribute(key, value);
    doc.head.appendChild(script);
  };
  append('https://cloud.umami.is/script.js', {
    'data-website-id': policy.umamiWebsiteId,
    'data-domains': policy.hostname,
    'data-exclude-search': 'true',
    'data-exclude-hash': 'true',
    'data-before-send': 'dataSketchBeforeSend',
  });
  append('https://static.cloudflareinsights.com/beacon.min.js', {
    'data-cf-beacon': JSON.stringify({ token: policy.cloudflareToken }),
  });
}

export function renderAnalytics(policy) {
  if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(policy.umamiWebsiteId)) throw new Error('Invalid Data Sketch Umami website ID');
  if (!/^[a-f\d]{32}$/i.test(policy.cloudflareToken)) throw new Error('Invalid dedicated Cloudflare Web Analytics token');
  return `<script data-datasketch-analytics>(${initializeAnalytics.toString()})(${JSON.stringify(policy).replaceAll('<', '\\u003c')});</script>`;
}
