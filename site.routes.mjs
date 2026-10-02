// @ts-check

/**
 * @typedef {object} GalleryRoute
 * @property {'gallery'} kind
 * @property {'/'} path
 * @property {'index.html'} output
 * @property {string} title
 * @property {string} description
 *
 * @typedef {object} LessonRoute
 * @property {'lesson'} kind
 * @property {string} path
 * @property {string} output
 * @property {string} slug
 * @property {number} episodeId
 * @property {string} title
 * @property {string} description
 *
 * @typedef {GalleryRoute | LessonRoute} SiteRoute
 */

/** @type {readonly SiteRoute[]} */
export const routeManifest = Object.freeze([
  {
    kind: 'gallery',
    path: '/',
    output: 'index.html',
    title: 'Data Sketch | Data Engineering Lessons by Mario Caesar',
    description: 'Visual notes on data pipelines, SQL, warehouses, and data quality, drawn from Mario Caesar\'s work in data engineering.',
  },
  {
    kind: 'lesson',
    path: '/sketches/backfill-playbook/',
    output: 'sketches/backfill-playbook/index.html',
    slug: 'backfill-playbook',
    episodeId: 1,
    title: 'Backfill Playbook: From Request to Release | Data Sketch',
    description: 'A five-stage backfill workflow covering scope, strategy, partitioned runs, validation gates, and atomic publishing.',
  },
  {
    kind: 'lesson',
    path: '/sketches/join-duplication-debugging/',
    output: 'sketches/join-duplication-debugging/index.html',
    slug: 'join-duplication-debugging',
    episodeId: 2,
    title: 'Join Duplication Debugging Workflow | Data Sketch',
    description: 'Steps for tracing inflated metrics through row counts, join keys, table grain, join type, and null behavior.',
  },
  {
    kind: 'lesson',
    path: '/sketches/full-refresh-vs-incremental-load/',
    output: 'sketches/full-refresh-vs-incremental-load/index.html',
    slug: 'full-refresh-vs-incremental-load',
    episodeId: 3,
    title: 'Full Refresh vs Incremental Load | Data Sketch',
    description: 'A comparison of full refresh and incremental loading across data volume, refresh cost, watermarks, late updates, and upserts.',
  },
  {
    kind: 'lesson',
    path: '/sketches/bronze-silver-gold/',
    output: 'sketches/bronze-silver-gold/index.html',
    slug: 'bronze-silver-gold',
    episodeId: 4,
    title: 'Bronze, Silver, and Gold Data Layers | Data Sketch',
    description: 'An overview of how Bronze, Silver, and Gold layers move data from raw ingestion through cleaning and standardization to business-ready datasets.',
  },
]);

/** @type {ReadonlyMap<string, string>} */
export const routeAliases = new Map([
  ['/index.html', '/'],
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
