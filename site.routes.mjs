// @ts-check
import { siteConfig } from './site.config.mjs';
import { newsletterConfig } from './newsletter.config.mjs';

/**
 * @typedef {object} GalleryRoute
 * @property {'gallery'} kind
 * @property {'/'} path
 * @property {'index.html'} output
 * @property {string} title
 * @property {string} description
 * @property {string} markdownPath
 * @property {string} markdownOutput
 *
 * @typedef {object} LessonRoute
 * @property {'lesson'} kind
 * @property {string} path
 * @property {string} output
 * @property {string} slug
 * @property {number} episodeId
 * @property {string} title
 * @property {string} description
 * @property {string} markdownPath
 * @property {string} markdownOutput
 *
 * @typedef {object} InformationRoute
 * @property {'newsletter' | 'privacy'} kind
 * @property {string} path
 * @property {string} output
 * @property {string} title
 * @property {string} description
 * @property {string} markdownPath
 * @property {string} markdownOutput
 * @property {string} modifiedAt
 *
 * @typedef {GalleryRoute | LessonRoute | InformationRoute} SiteRoute
 */

/** @type {readonly SiteRoute[]} */
export const routeManifest = Object.freeze([
  {
    kind: 'gallery',
    path: '/',
    output: 'index.html',
    markdownPath: '/index.md',
    markdownOutput: 'index.md',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  {
    kind: 'newsletter',
    path: newsletterConfig.path,
    output: 'newsletter.html',
    title: newsletterConfig.title,
    description: newsletterConfig.description,
    markdownPath: '/newsletter/index.md',
    markdownOutput: 'newsletter/index.md',
    modifiedAt: newsletterConfig.modifiedAt,
  },
  {
    kind: 'privacy',
    path: newsletterConfig.privacyPath,
    output: 'privacy.html',
    title: 'Newsletter Privacy | Data Sketch',
    description: 'How Mario Caesar and beehiiv handle Data Sketch newsletter subscriptions, cookies, and your privacy choices.',
    markdownPath: '/privacy/index.md',
    markdownOutput: 'privacy/index.md',
    modifiedAt: newsletterConfig.privacyModifiedAt,
  },
  {
    kind: 'lesson',
    path: '/sketches/backfill-playbook/',
    output: 'sketches/backfill-playbook/index.html',
    markdownPath: '/sketches/backfill-playbook/index.md',
    markdownOutput: 'sketches/backfill-playbook/index.md',
    slug: 'backfill-playbook',
    episodeId: 1,
    title: 'Backfill Playbook: From Request to Release | Data Sketch',
    description: 'A five-stage backfill workflow covering scope, strategy, partitioned runs, validation gates, and atomic publishing.',
  },
  {
    kind: 'lesson',
    path: '/sketches/join-duplication-debugging/',
    output: 'sketches/join-duplication-debugging/index.html',
    markdownPath: '/sketches/join-duplication-debugging/index.md',
    markdownOutput: 'sketches/join-duplication-debugging/index.md',
    slug: 'join-duplication-debugging',
    episodeId: 2,
    title: 'Join Duplication Debugging Workflow | Data Sketch',
    description: 'Steps for tracing inflated metrics through row counts, join keys, table grain, join type, and null behavior.',
  },
  {
    kind: 'lesson',
    path: '/sketches/full-refresh-vs-incremental-load/',
    output: 'sketches/full-refresh-vs-incremental-load/index.html',
    markdownPath: '/sketches/full-refresh-vs-incremental-load/index.md',
    markdownOutput: 'sketches/full-refresh-vs-incremental-load/index.md',
    slug: 'full-refresh-vs-incremental-load',
    episodeId: 3,
    title: 'Full Refresh vs Incremental Load | Data Sketch',
    description: 'A comparison of full refresh and incremental loading across data volume, refresh cost, watermarks, late updates, and upserts.',
  },
  {
    kind: 'lesson',
    path: '/sketches/bronze-silver-gold/',
    output: 'sketches/bronze-silver-gold/index.html',
    markdownPath: '/sketches/bronze-silver-gold/index.md',
    markdownOutput: 'sketches/bronze-silver-gold/index.md',
    slug: 'bronze-silver-gold',
    episodeId: 4,
    title: 'Bronze, Silver, and Gold Data Layers | Data Sketch',
    description: 'An overview of how Bronze, Silver, and Gold layers move data from raw ingestion through cleaning and standardization to business-ready datasets.',
  },
  {
    kind: 'lesson',
    path: '/sketches/safe-publish-pattern/',
    output: 'sketches/safe-publish-pattern/index.html',
    markdownPath: '/sketches/safe-publish-pattern/index.md',
    markdownOutput: 'sketches/safe-publish-pattern/index.md',
    slug: 'safe-publish-pattern',
    episodeId: 5,
    title: 'Safe Publish Pattern Flow | Data Sketch',
    description: 'A staging-first publish flow covering validation checks, a failure gate, atomic publishing where supported, and monitoring after release.',
  },
  {
    kind: 'lesson',
    path: '/sketches/reconciliation-workflow/',
    output: 'sketches/reconciliation-workflow/index.html',
    markdownPath: '/sketches/reconciliation-workflow/index.md',
    markdownOutput: 'sketches/reconciliation-workflow/index.md',
    slug: 'reconciliation-workflow',
    episodeId: 6,
    title: 'A Simple Reconciliation Workflow | Data Sketch',
    description: 'Trace source and target count differences through date ranges, filters, grain, keys, pipeline stages, and late updates.',
  },
  {
    kind: 'lesson',
    path: '/sketches/late-arriving-data/',
    output: 'sketches/late-arriving-data/index.html',
    markdownPath: '/sketches/late-arriving-data/index.md',
    markdownOutput: 'sketches/late-arriving-data/index.md',
    slug: 'late-arriving-data',
    episodeId: 7,
    title: 'Late-Arriving Data | Data Sketch',
    description: 'Five causes of late-arriving data: historical edits, backdated transactions, batch uploads, API or network lag, and delayed source systems.',
  },
  {
    kind: 'lesson',
    path: '/sketches/data-freshness/',
    output: 'sketches/data-freshness/index.html',
    markdownPath: '/sketches/data-freshness/index.md',
    markdownOutput: 'sketches/data-freshness/index.md',
    slug: 'data-freshness',
    episodeId: 8,
    title: 'Data Freshness | Data Sketch',
    description: 'Check timestamps, expected partitions, row volume, source delays, and the freshness SLA before treating a successful pipeline run as ready.',
  },
  {
    kind: 'lesson',
    path: '/sketches/partitioning/',
    output: 'sketches/partitioning/index.html',
    markdownPath: '/sketches/partitioning/index.md',
    markdownOutput: 'sketches/partitioning/index.md',
    slug: 'partitioning',
    episodeId: 9,
    title: 'Partitioning: Why Scanning Less Data Matters | Data Sketch',
    description: 'How partitioning can reduce scanning work when a query skips irrelevant partitions, and why runtime and cost benefits depend on the workload.',
  },
]);

/** @type {ReadonlyMap<string, string>} */
export const routeAliases = new Map([
  ['/index.html', '/'],
  ...routeManifest
    .filter(route => route.kind === 'newsletter' || route.kind === 'privacy')
    .flatMap(route => /** @type {[string, string][]} */ ([
      [`${route.path}/`, route.path],
      [`${route.path}.html`, route.path],
      [`${route.path}/index.html`, route.path],
    ])),
  ...routeManifest
    .filter(route => route.kind === 'lesson')
    .flatMap(route => /** @type {[string, string][]} */ ([
      [route.path.slice(0, -1), route.path],
      [`${route.path}index.html`, route.path],
    ])),
]);

/** @param {string} pathname */
export function findRoute(pathname) {
  return routeManifest.find(route => route.path === pathname);
}

/** @param {string} pathname */
export function findAlias(pathname) {
  return routeAliases.get(pathname);
}
