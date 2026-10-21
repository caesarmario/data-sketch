import { fileURLToPath } from 'node:url';
import { siteConfig } from '../site.config.mjs';
import { newsletterConfig } from '../newsletter.config.mjs';
import { routeAliases, routeManifest } from '../site.routes.mjs';
import { loadTypeScriptModule } from './load-typescript-module.mjs';
import { calculateRouteLastmod } from './content-dates.mjs';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const { sketches } = await loadTypeScriptModule(rootDir, 'src/data/sketches.ts');
const publishedSketches = sketches.filter(sketch => sketch.status === 'published');
const rootRoute = routeManifest.find(route => route.kind === 'gallery');
if (!rootRoute) throw new Error('Gallery route is missing from the route manifest');

const faviconLinks = [
  '<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16 32x32 48x48" />',
  '<link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />',
  '<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />',
  '<link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />',
];

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const escapeXml = escapeHtml;

export function isPreview(env = process.env) {
  return env.SITE_INDEXING === 'noindex' || (Boolean(env.CONTEXT) && env.CONTEXT !== 'production');
}

export function absoluteUrl(pathname) {
  return `${siteConfig.baseUrl}${pathname === '/' ? '/' : pathname}`;
}

export function routeLastmod(route) {
  return calculateRouteLastmod(route, sketches, siteConfig.contentUpdated);
}

function publishedSketchForRoute(route) {
  return route.kind === 'lesson' ? publishedSketches.find(sketch => sketch.id === route.episodeId) : undefined;
}

function sketchImage(sketch) {
  return {
    url: `${siteConfig.baseUrl}${sketch.image}`,
    alt: sketch.imageAlt,
    width: 1080,
    height: 1350,
    type: 'image/jpeg',
  };
}

function routeImage(route) {
  const sketch = publishedSketchForRoute(route);
  if (sketch) return sketchImage(sketch);
  return {
    url: `${siteConfig.baseUrl}${siteConfig.ogImagePath}`,
    alt: siteConfig.ogImageAlt,
    width: 1200,
    height: 630,
    type: 'image/png',
  };
}

function routeImages(route) {
  return route.kind === 'gallery' ? publishedSketches.map(sketchImage) : [routeImage(route)];
}

function imageSchema(image) {
  return {
    '@type': 'ImageObject', '@id': `${image.url}#image`, url: image.url,
    contentUrl: image.url, caption: image.alt, width: image.width, height: image.height,
    encodingFormat: image.type, inLanguage: siteConfig.locale,
  };
}

function routeSchema(route) {
  const canonical = absoluteUrl(route.path);
  const lastmod = routeLastmod(route);
  const websiteId = `${siteConfig.baseUrl}/#website`;
  const personId = `${siteConfig.portfolioUrl}/#person`;
  const website = {
    '@type': 'WebSite', '@id': websiteId, name: siteConfig.name,
    url: `${siteConfig.baseUrl}/`, inLanguage: siteConfig.locale, author: { '@id': personId },
  };
  const person = {
    '@type': 'Person', '@id': personId, name: siteConfig.author,
    url: `${siteConfig.portfolioUrl}/`,
    sameAs: ['https://www.linkedin.com/in/caesarmario/', 'https://github.com/caesarmario'],
  };

  if (route.kind === 'gallery') {
    const articles = routeManifest.filter(entry => entry.kind === 'lesson').map(entry => ({
      '@type': 'Article', '@id': `${absoluteUrl(entry.path)}#article`,
      headline: entry.title.replace(' | Data Sketch', ''), url: absoluteUrl(entry.path),
    }));
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage', '@id': `${canonical}#collection`, name: route.title,
          description: route.description, url: canonical, dateModified: lastmod,
          inLanguage: siteConfig.locale, author: { '@id': personId },
          isPartOf: { '@id': websiteId }, hasPart: articles,
        },
        ...routeImages(route).map(imageSchema), website, person,
      ],
    };
  }

  if (route.kind === 'newsletter' || route.kind === 'privacy') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage', '@id': canonical, name: route.title,
          description: route.description, url: canonical, dateModified: lastmod,
          inLanguage: siteConfig.locale, author: { '@id': personId },
          isPartOf: { '@id': websiteId },
        },
        website, person,
      ],
    };
  }

  const sketch = publishedSketchForRoute(route);
  if (!sketch) throw new Error(`Published sketch is missing for route ${route.path}`);
  const headline = route.title.replace(' | Data Sketch', '');
  const image = routeImage(route);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', '@id': `${canonical}#article`, headline,
        description: route.description, url: canonical, mainEntityOfPage: { '@id': canonical },
        image: { '@id': `${image.url}#image` }, author: { '@id': personId },
        isPartOf: { '@id': websiteId }, inLanguage: siteConfig.locale,
        articleSection: sketch.category, keywords: sketch.tags, dateModified: lastmod,
      },
      imageSchema(image),
      {
        '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Data Sketch', item: `${siteConfig.baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: headline, item: canonical },
        ],
      },
      website, person,
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
    ['property', 'og:url', canonical], ['property', 'og:site_name', siteConfig.name], ['property', 'og:locale', 'en_US'],
    ['property', 'og:image', image.url], ['property', 'og:image:width', String(image.width)],
    ['property', 'og:image:height', String(image.height)], ['property', 'og:image:alt', image.alt],
    ['property', 'og:image:type', image.type], ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', route.title], ['name', 'twitter:description', route.description],
    ['name', 'twitter:image', image.url], ['name', 'twitter:image:alt', image.alt],
    ['name', 'twitter:creator', siteConfig.twitterHandle],
  ];
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    ...metadata.map(([key, name, value]) => `<meta ${key}="${name}" content="${escapeHtml(value)}" />`),
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<link rel="describedby" href="${siteConfig.baseUrl}/llms.txt" type="text/markdown" />`,
    `<link rel="alternate" type="text/markdown" href="${absoluteUrl(route.markdownPath)}" />`,
    ...faviconLinks,
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
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="${escapeHtml(siteConfig.themeColor)}" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Page not found | Data Sketch</title>
  ${faviconLinks.join('\n  ')}
  ${siteConfig.fontPreloads.map(href => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`).join('\n  ')}
  <style>
    @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 400 600; font-display: swap; src: url('/fonts/ibm-plex-sans-v23-latin-400-600.woff2') format('woff2'); }
    @font-face { font-family: 'Space Grotesk'; font-style: normal; font-weight: 700; font-display: swap; src: url('/fonts/space-grotesk-v22-latin-700.woff2') format('woff2'); }
    :root { color-scheme: dark; background: #0a0a0a; color: #fff; font-family: 'IBM Plex Sans', sans-serif; }
    * { box-sizing: border-box; }
    body { min-height: 100vh; margin: 0; background: radial-gradient(circle at 50% 40%, rgba(0,230,119,.08), transparent 30rem), #0a0a0a; -webkit-font-smoothing: antialiased; }
    main { display: grid; min-height: 100vh; place-items: center; padding: clamp(1.25rem, 5vw, 2rem); }
    section { max-width: 36rem; text-align: center; }
    .code { margin: 0 0 1rem; color: #00e677; font-size: .72rem; font-weight: 600; letter-spacing: .18em; }
    h1 { margin: 0; font-family: 'Space Grotesk', 'IBM Plex Sans', sans-serif; font-size: clamp(2.3rem, 8vw, 4.6rem); font-weight: 700; line-height: 1.05; letter-spacing: -.04em; }
    .message { margin: 1.5rem 0 0; color: rgba(255,255,255,.65); font-size: clamp(1rem, 2vw, 1.125rem); line-height: 1.7; }
    a { display: inline-flex; align-items: center; min-height: 44px; margin-top: 1rem; color: #fff; text-decoration-color: #00e677; text-decoration-thickness: 1px; text-underline-offset: .3rem; }
    a:hover, a:focus-visible { color: #00e677; text-decoration-thickness: 2px; }
    a:focus-visible { outline: 2px solid #00e677; outline-offset: 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <main id="main-content">
    <section aria-labelledby="not-found-heading">
      <p class="code">DATA SKETCH / 404</p>
      <h1 id="not-found-heading">Page not found</h1>
      <p class="message">The link may be outdated, or the sketch may have moved.</p>
      <a href="/">Back to gallery</a>
    </section>
  </main>
</body>
</html>\n`;
}

function renderHumans() {
  return `/* TEAM */\nAuthor: Mario Caesar\nPortfolio: ${siteConfig.portfolioUrl}/\nContact: hello@caesarmar.io\n\n/* SITE */\nName: ${siteConfig.name}\nURL: ${siteConfig.baseUrl}/\nLanguage: English\nBuilt with: React, TypeScript, Vite\nVersion: ${siteConfig.version}\nBuild: ${siteConfig.buildVersion}\nLast update: ${siteConfig.contentUpdated}\n`;
}

function renderLlms() {
  const lessons = routeManifest.filter(route => route.kind === 'lesson')
    .map(route => `- [${route.title.replace(' | Data Sketch', '')}](${absoluteUrl(route.markdownPath)}): ${route.description}`)
    .join('\n');
  return `# Data Sketch\n\n> ${siteConfig.description}\n\nCanonical site: ${siteConfig.baseUrl}/. Use the lesson sources below for factual summaries. Upcoming episodes are not published sources.\n\n## Primary pages\n\n- [Data Sketch gallery](${siteConfig.baseUrl}/index.md): Published lesson index and original source links.\n- [Newsletter](${siteConfig.baseUrl}/newsletter/index.md): Signup information and email frequency.\n- [Newsletter privacy](${siteConfig.baseUrl}/privacy/index.md): Subscription data and privacy choices.\n${lessons}\n\n## Author source\n\n- [Mario Caesar portfolio](${siteConfig.portfolioUrl}/index.md): Public professional background and attribution source.\n`;
}

function renderInformationMarkdown(route) {
  if (route.kind === 'newsletter') {
    const samples = newsletterConfig.sampleEpisodeIds.map(id => {
      const sketch = publishedSketches.find(entry => entry.id === id);
      if (!sketch) throw new Error(`Newsletter sample episode ${id} is missing`);
      return `- [${sketch.title}](${absoluteUrl(sketch.lessonPath)})`;
    }).join('\n');
    return `# ${newsletterConfig.heading}\n\n> ${newsletterConfig.description}\n\nCanonical page: ${absoluteUrl(route.path)}\n\n${newsletterConfig.intro}\n\n${newsletterConfig.frequency}\n\n[${newsletterConfig.formCopy.button}](${newsletterConfig.formUrl})\n\n${newsletterConfig.formCopy.consent}\n\n## ${newsletterConfig.samplesHeading}\n\n${samples}\n\n[${newsletterConfig.authorLink}](${siteConfig.portfolioUrl}/)\n\n[Newsletter privacy](${absoluteUrl(newsletterConfig.privacyPath)})\n`;
  }
  const sections = newsletterConfig.privacySections.map(section => `## ${section.heading}\n\n${section.body}`).join('\n\n');
  return `# Newsletter privacy\n\nCanonical page: ${absoluteUrl(route.path)}\n\nUpdated: ${newsletterConfig.privacyModifiedAt}\n\n${sections}\n\n## Contact and provider policies\n\n- [Contact Mario](mailto:${newsletterConfig.contact})\n- [beehiiv privacy policy](https://www.beehiiv.com/privacy)\n- [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/)\n`;
}

function renderGalleryMarkdown() {
  const lessons = publishedSketches.map(sketch => `## ${sketch.title}\n\n${sketch.month} | ${sketch.category}\n\n${sketch.lesson}\n\nTags: ${sketch.tags.join(', ')}\n\n[Read the lesson](${absoluteUrl(sketch.lessonPath.replace(/\/$/, '/index.md'))}) | [Original LinkedIn post](${sketch.href})`).join('\n\n');
  return `# Data Sketch\n\n> ${rootRoute.description}\n\nCanonical page: ${siteConfig.baseUrl}/\n\n${lessons}\n`;
}

function renderLessonMarkdown(route) {
  const sketch = publishedSketchForRoute(route);
  if (!sketch) throw new Error(`Published sketch is missing for route ${route.path}`);
  const steps = sketch.walkthrough.map(step => `### ${step.heading}\n\n${step.body}`).join('\n\n');
  return `# ${sketch.title}\n\n> ${sketch.lesson}\n\n${sketch.month} | ${sketch.category}\n\nTags: ${sketch.tags.join(', ')}\n\nCanonical page: ${absoluteUrl(route.path)}\n\n![${sketch.imageAlt}](${absoluteUrl(sketch.image)})\n\n## Reading the sketch\n\n${steps}\n\n## Takeaway\n\n${sketch.takeaway}\n\n## Sources\n\n- [Original LinkedIn post](${sketch.href})\n- [Mario Caesar](${siteConfig.portfolioUrl}/index.md)\n`;
}

function renderHeaders(preview) {
  const blocks = [`/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=31536000${preview ? '\n  X-Robots-Tag: noindex, nofollow' : ''}`];
  for (const route of routeManifest) {
    const canonical = absoluteUrl(route.path);
    blocks.push(`${route.path}\n  Link: <${canonical}>; rel="canonical", <${siteConfig.baseUrl}/llms.txt>; rel="describedby"; type="text/markdown", <${absoluteUrl(route.markdownPath)}>; rel="alternate"; type="text/markdown"`);
    blocks.push(`${route.markdownPath}\n  Content-Type: text/markdown; charset=utf-8\n  X-Robots-Tag: noindex, follow\n  Link: <${canonical}>; rel="canonical", <${siteConfig.baseUrl}/llms.txt>; rel="describedby"; type="text/markdown"`);
  }
  blocks.push('/assets/*\n  Cache-Control: public, max-age=31536000, immutable');
  blocks.push('/fonts/*\n  Cache-Control: public, max-age=31536000, immutable');
  blocks.push('/images/*\n  Cache-Control: public, max-age=3600, must-revalidate');
  blocks.push('/og-image.png\n  Cache-Control: public, max-age=3600, must-revalidate');
  for (const icon of ['/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png', '/favicon-96x96.png', '/apple-touch-icon.png']) {
    blocks.push(`${icon}\n  Cache-Control: public, max-age=0, must-revalidate`);
  }
  blocks.push('/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n  X-Robots-Tag: noindex');
  blocks.push('/humans.txt\n  Content-Type: text/plain; charset=utf-8');
  blocks.push('/llms.txt\n  Content-Type: text/markdown; charset=utf-8\n  Link: <https://datasketch.caesarmar.io/>; rel="canonical"');
  blocks.push('/404.html\n  X-Robots-Tag: noindex, nofollow');
  return `${blocks.join('\n\n')}\n`;
}

function renderSitemap(preview) {
  const entries = preview ? '' : routeManifest.map(route => {
    const images = routeImages(route).map(image => `<image:image><image:loc>${escapeXml(image.url)}</image:loc></image:image>`).join('');
    return `<url><loc>${escapeXml(absoluteUrl(route.path))}</loc><lastmod>${routeLastmod(route).slice(0, 10)}</lastmod>${images}</url>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}</urlset>\n`;
}

export function generateFiles({ preview = false } = {}) {
  const netlifyAliases = [...routeAliases.entries()].filter(([from]) => from.endsWith('.html') || from === '/newsletter/' || from === '/privacy/');
  const redirects = [...netlifyAliases.map(([from, to]) => `${from} ${to} 301!`), '/404.html /404.html 404!', '/* /404.html 404'].join('\n') + '\n';
  const files = {
    'sitemap.xml': renderSitemap(preview),
    'robots.txt': `User-agent: *\nAllow: /\n${preview ? '' : `\nSitemap: ${siteConfig.baseUrl}/sitemap.xml\n`}`,
    'humans.txt': renderHumans(),
    'llms.txt': renderLlms(),
    '_headers': renderHeaders(preview),
    '_redirects': redirects,
    '404.html': renderNotFound(),
    [rootRoute.markdownOutput]: renderGalleryMarkdown(),
  };
  for (const route of routeManifest.filter(entry => entry.kind === 'lesson')) files[route.markdownOutput] = renderLessonMarkdown(route);
  for (const route of routeManifest.filter(entry => entry.kind === 'newsletter' || entry.kind === 'privacy')) files[route.markdownOutput] = renderInformationMarkdown(route);
  return files;
}
