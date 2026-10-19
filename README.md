# Data Sketch

Visual data engineering lessons by Mario Caesar. Standalone home for the gallery previously hosted at caesarmar.io/data-sketch.

Production: https://datasketch.caesarmar.io/. Changes in the current development branch remain local until release approval.

## Episode 05-09 content update

Version `1.0.2`, build `v2026.10.19`: nine published episodes and two asset-free
teasers (10-11). The five new lessons cover safe publishing, reconciliation,
late-arriving data, freshness, and partitioning. Episode 01-04 content, source
links, and original image bytes are preserved.

New diagram derivatives are 1080 x 1350 JPEGs, with no crop or artwork edits.
The supplied LinkedIn shortlinks are kept exactly as provided; their redirects
include highlighted-post parameters that must not be discarded by guessing a
cleaner destination. Lesson dates retain the month precision of the diagrams.
See [content mapping and local verification](docs/episodes-05-09-update.md) for
asset sizes, test results, and remaining browser/release gates.

## Local development

Use Node.js 22 or newer and npm. Run `npm ci`, then `npm run dev` (port 8081).

Run `npm run typecheck`, `npm run lint`, `npm run seo:generate`, `npm run build`, `npm test`, and `npm run seo:check` before release. Tests require a current build. `npm run preview` serves the build on port 4181.

With dev and preview running, `npm run test:http` checks both Data Sketch servers.
Leave `PORTFOLIO_DEV_URL` and `PORTFOLIO_PREVIEW_URL` unset for this content batch;
the optional legacy migration checks are outside its scope.

## Architecture

- React + TypeScript + Vite + Tailwind, with locally served IBM Plex Sans and Space Grotesk.
- `src/data/sketches.ts` owns episode content. Published entries require an image, local lesson path and LinkedIn URL; upcoming entries cannot reference an unreleased asset or live link.
- `site.routes.mjs` is the typed public-route manifest used by rendering, metadata, sitemap and delivery rules. The site prerenders the gallery and nine published lesson pages.
- One responsive DOM grid, accessible sort controls, noninteractive upcoming episodes, and CSS-only motion.
- `src/entry-server.tsx` renders each manifest route during the build; `src/main.tsx` hydrates the matching page. No server runtime is deployed.
- `site.config.mjs` owns site identity and SEO values. `scripts/seo.mjs` adapts the portfolio's metadata, escaping, and generated routing/header patterns.
- `public/` contains only Data Sketch assets, fonts, favicon, OG artwork and generated SEO files. There is no Supabase, resume, PDF viewer, affiliate banner, or authentication dependency.

## Publishing an episode

1. Add only the released image under `public/images/data-sketch/` with a descriptive lowercase filename. Keep unreleased images outside the repo's public directory.
2. Change the corresponding data entry to `status: 'published'` and provide its final metadata, alt text, image and LinkedIn URL. Preserve the episode ID.
3. Add the published lesson copy and route metadata without inventing details that are absent from the diagram or source caption. Set the episode's `modifiedAt` to the website editorial update date, separately from its publication month. Update `contentUpdated` for gallery changes, regenerate SEO and run all checks.
4. Verify the diagram is readable, fully visible and keyboard-accessible at mobile, tablet and desktop sizes. Default episode ordering is ascending; latest-first includes upcoming IDs, matching the previous gallery.

The topic filter intentionally remains off. Do not introduce a CMS, lightbox or GSAP without a separate brief.

## Editorial dates and SEO

Lesson sitemap `lastmod` and Article `dateModified` read the episode's `modifiedAt`.
Gallery uses the latest published editorial date or `siteConfig.contentUpdated`.
Editing one episode must not refresh every other lesson's date. Meaningful changes
to a lesson's text, metadata, diagram or shared rendered content require updating
the affected dates; formatting and builds do not. No daily datePublished is inferred.

Gallery metadata and the visible intro read `site.config.mjs`. Image sitemap
entries contain the image location without deprecated image caption tags; alt
text and ImageObject captions remain available. The 404 page is a static,
font-complete document and does not need the React bundle or client JavaScript.

## Hosting and analytics

Use the existing Data Sketch Netlify site connected to this repository. Build: `npm run build`. Publish: `dist`. Production branch: `main` after release approval. Never reuse the portfolio Netlify site or create a duplicate site for a content update.

Deploy previews and branch deploys emit `noindex, nofollow` in HTML and response headers, omit analytics and contain an empty sitemap. Crawling remains allowed so crawlers can read noindex. Unknown routes return actual 404; HTML aliases redirect to their clean canonical paths. `humans.txt` and `llms.txt` are public text files but stay outside the sitemap.

Configure `CLOUDFLARE_WEB_ANALYTICS_TOKEN` only with the separate Data Sketch token. Unset means no beacon. Production-context builds alone may emit the configured beacon; preview deploys never do. This public beacon ID is not a credential. No cookies/storage or targeting are implemented by this app.

DNS, custom domain, HTTPS, Search Console submission and actual analytics verification are manual release gates. See [migration runbook](docs/migration.md).

## Brand assets

The supplied 2145 x 186 PNG header wordmark is preserved unchanged. Current brand
sources are `design/brand/favicon-source.png` and `design/brand/og-image-source.png`.
The favicon trims only outer whitespace/transparency, composites on white, and
keeps the artwork's proportions. Outputs are a real 16/32/48 ICO, 16/32/96 PNGs,
and a 180 px Apple icon. The gallery OG is the approved 1200 x 630 PNG; lesson
OG cards remain their individual diagrams.

Run `node scripts/generate-brand-assets.mjs` with Sharp available in the offline
tooling environment (or through NODE_PATH) to regenerate the committed outputs.
Sharp is not added to the site runtime or build. See [brand source notes](design/brand/README.md).
`design/og-image.svg` and `public/favicon.svg` are retained as legacy assets only:
do not export the old SVG over the current PNG or advertise the old icon in HTML.

See [SEO, brand and 404 audit](docs/seo-brand-404-audit-2026-10-19.md) for this
batch's evidence, Lighthouse results, and remaining production checks.

## Verification boundary

Local browser QA on 2026-10-02 covered the 320, 375, 768, 1024 and 1440 px layouts, responsive gallery columns, pointer sorting, a direct lesson load, hydration console output, and the back-to-top focus return. A full keyboard-only pass, browser-emulated reduced motion, failed-image recovery, and the deployed production build remain release gates. Static and HTTP tests do not replace those checks.
