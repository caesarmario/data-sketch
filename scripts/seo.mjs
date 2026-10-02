import { siteConfig } from '../site.config.mjs';
import { routeAliases, routeManifest } from '../site.routes.mjs';

const rootRoute = routeManifest.find(route => route.kind === 'gallery');
if (!rootRoute) throw new Error('Gallery route is missing from the route manifest');

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function isPreview(env = process.env) {
  return env.SITE_INDEXING === 'noindex' || (Boolean(env.CONTEXT) && env.CONTEXT !== 'production');
}

export function absoluteUrl(pathname) {
  return `${siteConfig.baseUrl}${pathname === '/' ? '/' : pathname}`;
}

function routeImage(route) {
  if (route.kind === 'gallery') return {
    url: `${siteConfig.baseUrl}${siteConfig.ogImagePath}`,
    alt: siteConfig.ogImageAlt,
    width: '1200',
    height: '630',
    type: 'image/png',
  };
  return {
    url: `${siteConfig.baseUrl}/images/data-sketch/data-sketch-episode-${String(route.episodeId).padStart(2, '0')}.jpg`,
    alt: `Data Sketch Episode ${route.episodeId}: ${route.title.replace(' | Data Sketch', '')}`,
    width: '1080',
    height: '1350',
    type: 'image/jpeg',
  };
}

function routeSchema(route) {
  const canonical = absoluteUrl(route.path);
  if (route.kind === 'gallery') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: route.title,
      description: route.description,
      url: canonical,
      author: { '@type': 'Person', name: siteConfig.author, url: `${siteConfig.portfolioUrl}/` },
      isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: `${siteConfig.baseUrl}/` },
      hasPart: routeManifest.filter(entry => entry.kind === 'lesson').map(entry => ({
        '@type': 'Article',
        headline: entry.title.replace(' | Data Sketch', ''),
        url: absoluteUrl(entry.path),
      })),
    };
  }

  const headline = route.title.replace(' | Data Sketch', '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline,
        description: route.description,
        url: canonical,
        mainEntityOfPage: canonical,
        image: routeImage(route).url,
        author: { '@type': 'Person', name: siteConfig.author, url: `${siteConfig.portfolioUrl}/` },
        isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: `${siteConfig.baseUrl}/` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Data Sketch', item: `${siteConfig.baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: headline, item: canonical },
        ],
      },
    ],
  };
}

/** @param {{ route?: import('../site.routes.mjs').SiteRoute, preview?: boolean, analyticsToken?: string }} [options] */
export function renderHead({ route = rootRoute, preview = true, analyticsToken = '' } = {}) {
  if (analyticsToken && !/^[a-f\d]{32}$/i.test(analyticsToken)) throw new Error('Invalid dedicated Cloudflare Web Analytics token');
  const canonical = absoluteUrl(route.path);
  const image = routeImage(route);
  const metadata = [
    ['name', 'description', route.description], ['name', 'author', siteConfig.author],
    ['name', 'robots', preview ? 'noindex, nofollow' : 'index, follow'],
    ['name', 'theme-color', siteConfig.themeColor], ['property', 'og:type', route.kind === 'lesson' ? 'article' : 'website'],
    ['property', 'og:title', route.title], ['property', 'og:description', route.description],
    ['property', 'og:url', canonical], ['property', 'og:site_name', siteConfig.name],
    ['property', 'og:image', image.url], ['property', 'og:image:width', image.width],
    ['property', 'og:image:height', image.height], ['property', 'og:image:alt', image.alt],
    ['property', 'og:image:type', image.type], ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', route.title], ['name', 'twitter:description', route.description],
    ['name', 'twitter:image', image.url], ['name', 'twitter:image:alt', image.alt],
  ];
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    ...metadata.map(([key, name, value]) => `<meta ${key}="${name}" content="${escapeHtml(value)}" />`),
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
    '<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />',
    ...siteConfig.fontPreloads.map(href => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`),
    `<script type="application/ld+json">${JSON.stringify(routeSchema(route)).replaceAll('<', '\\u003c')}</script>`,
    !preview && analyticsToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="${escapeHtml(JSON.stringify({ token: analyticsToken }))}"></script>` : '',
  ].filter(Boolean).join('\n');
  return `<!--seo-head:start-->\n${tags}\n<!--seo-head:end-->`;
}

export function replaceHead(html, head) {
  const marker = /<!--seo-head:start-->[\s\S]*?<!--seo-head:end-->/;
  if (!marker.test(html)) throw new Error('SEO head markers are missing');
  return html.replace(marker, head);
}

export function renderNotFound() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Page not found | Data Sketch</title><link rel="icon" href="/favicon.svg"><style>body{background:#0a0a0a;color:#fff;font:18px/1.7 sans-serif;margin:0;min-height:100vh;display:grid;place-items:center}main{max-width:36rem;padding:2rem}h1{line-height:1.15}a{color:#00e677;text-underline-offset:4px}a:focus-visible{outline:2px solid #00e677;outline-offset:5px}</style></head><body><main><p>DATA SKETCH / 404</p><h1>This page is not in the sketchbook.</h1><p>Check the address or return to the published lessons.</p><a href="/">Back to the gallery</a></main></body></html>\n`;
}

function renderHumans() {
  return `/* TEAM */\nAuthor: Mario Caesar\nPortfolio: ${siteConfig.portfolioUrl}/\nContact: hello@caesarmar.io\n\n/* SITE */\nName: ${siteConfig.name}\nURL: ${siteConfig.baseUrl}/\nLanguage: English\nBuilt with: React, TypeScript, Vite\nLast update: ${siteConfig.contentUpdated}\n`;
}

function renderLlms() {
  const lessons = routeManifest
    .filter(route => route.kind === 'lesson')
    .map(route => `- [${route.title.replace(' | Data Sketch', '')}](${absoluteUrl(route.path)}): ${route.description}`)
    .join('\n');
  return `# Data Sketch\n\n> Visual notes by Mario Caesar about practical data engineering work.\n\n## Published lessons\n\n${lessons}\n\n## Author\n\n- [Mario Caesar](${siteConfig.portfolioUrl}/)\n- [Data Sketch gallery](${siteConfig.baseUrl}/)\n`;
}

export function generateFiles({ preview = false } = {}) {
  const headers = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000
${preview ? '  X-Robots-Tag: noindex, nofollow\n' : ''}
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=3600, must-revalidate

/og-image.png
  Cache-Control: public, max-age=3600, must-revalidate

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  X-Robots-Tag: noindex

/humans.txt
  Content-Type: text/plain; charset=utf-8

/llms.txt
  Content-Type: text/plain; charset=utf-8

/404.html
  X-Robots-Tag: noindex, nofollow
`;
  const sitemapEntries = preview ? '' : routeManifest
    .map(route => `<url><loc>${absoluteUrl(route.path)}</loc><lastmod>${siteConfig.contentUpdated}</lastmod></url>`)
    .join('');
  const redirects = [
    ...routeAliases.entries().map(([from, to]) => `${from} ${to} 301!`),
    '/404.html /404.html 404!',
    '/* /404.html 404',
  ].join('\n') + '\n';
  return {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>\n`,
    'robots.txt': `User-agent: *\nAllow: /\n${preview ? '' : `\nSitemap: ${siteConfig.baseUrl}/sitemap.xml\n`}`,
    'humans.txt': renderHumans(),
    'llms.txt': renderLlms(),
    '_headers': headers,
    '_redirects': redirects,
    '404.html': renderNotFound(),
  };
}
