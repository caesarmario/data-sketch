// @ts-check

/**
 * @typedef {object} GalleryRoute
 * @property {'gallery'} kind
 * @property {'/'} path
 * @property {'index.html'} output
 * @property {string} title
 * @property {string} description
 * @property {string} markdownPath
 * @property {string} markdownOutput
 * @property {readonly string[]} lastmodFiles
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
 * @property {readonly string[]} lastmodFiles
 *
 * @typedef {GalleryRoute | LessonRoute} SiteRoute
 */

/** @type {readonly SiteRoute[]} */
export const routeManifest = Object.freeze([
  {
    kind: 'gallery',
    path: '/',
    output: 'index.html',
    markdownPath: '/index.md',
    markdownOutput: 'index.md',
    title: 'Data Sketch | Data Engineering Lessons by Mario Caesar',
    description: 'Visual notes on data pipelines, SQL, warehouses, and data quality, drawn from Mario Caesar\'s work in data engineering.',
    lastmodFiles: [
      'src/App.tsx',
      'src/data/sketches.ts',
      'public/og-image.png',
      'public/images/data-sketch/data-sketch-episode-01.jpg',
      'public/images/data-sketch/data-sketch-episode-02.jpg',
      'public/images/data-sketch/data-sketch-episode-03.jpg',
      'public/images/data-sketch/data-sketch-episode-04.jpg',
    ],
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
    lastmodFiles: ['src/data/sketches.ts', 'src/App.tsx', 'public/images/data-sketch/data-sketch-episode-01.jpg'],
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
    lastmodFiles: ['src/data/sketches.ts', 'src/App.tsx', 'public/images/data-sketch/data-sketch-episode-02.jpg'],
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
    lastmodFiles: ['src/data/sketches.ts', 'src/App.tsx', 'public/images/data-sketch/data-sketch-episode-03.jpg'],
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
    lastmodFiles: ['src/data/sketches.ts', 'src/App.tsx', 'public/images/data-sketch/data-sketch-episode-04.jpg'],
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
