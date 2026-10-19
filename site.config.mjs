export const siteConfig = {
  name: 'Data Sketch',
  author: 'Mario Caesar',
  version: '1.0.2',
  buildVersion: 'v2026.10.19',
  baseUrl: 'https://datasketch.caesarmar.io',
  portfolioUrl: 'https://caesarmar.io',
  title: 'Data Sketch | Data Engineering Lessons by Mario Caesar',
  description: 'Practical data engineering diagrams by Mario Caesar, with short lessons on SQL joins, backfills, data quality checks, and warehouse workflows.',
  intro: 'I draw the checks and workflows behind SQL, data pipelines, and data warehouses, with short explanations for each sketch.',
  locale: 'en',
  themeColor: '#0a0a0a',
  contentUpdated: '2026-10-19',
  ogImagePath: '/og-image.png',
  ogImageAlt: 'Data Sketch: data engineering visual notes. One diagram. One practical lesson.',
  twitterHandle: '@caesarmario_',
  fontPreloads: [
    '/fonts/ibm-plex-sans-v23-latin-400-600.woff2',
    '/fonts/space-grotesk-v22-latin-700.woff2',
  ],
  // Set a dedicated Data Sketch token in Netlify. Never reuse the portfolio token.
  analyticsTokenEnv: 'CLOUDFLARE_WEB_ANALYTICS_TOKEN',
};
