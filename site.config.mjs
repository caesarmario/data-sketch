export const siteConfig = {
  name: 'Data Sketch',
  author: 'Mario Caesar',
  version: '1.0.0',
  buildVersion: 'v2026.10.02',
  baseUrl: 'https://datasketch.caesarmar.io',
  portfolioUrl: 'https://caesarmar.io',
  title: 'Data Sketch | Practical Data Engineering Lessons by Mario Caesar',
  description: 'Visual notes on data pipelines, SQL, warehouses, and data quality, drawn from Mario Caesar\'s work in data engineering.',
  locale: 'en',
  themeColor: '#0a0a0a',
  contentUpdated: '2026-10-02',
  ogImagePath: '/og-image.png',
  ogImageAlt: 'Data Sketch by Mario Caesar. One diagram. One practical lesson.',
  fontPreloads: [
    '/fonts/ibm-plex-sans-v23-latin-400-600.woff2',
    '/fonts/space-grotesk-v22-latin-700.woff2',
  ],
  // Set a dedicated Data Sketch token in Netlify. Never reuse the portfolio token.
  analyticsTokenEnv: 'CLOUDFLARE_WEB_ANALYTICS_TOKEN',
};
