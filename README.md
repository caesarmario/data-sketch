# Data Sketch

Visual data engineering lessons by Mario Caesar. Standalone home for the gallery previously hosted at caesarmar.io/data-sketch.

Production destination: https://datasketch.caesarmar.io/ (not deployed by this implementation).

## Local development

Use Node.js 22 or newer and npm. Run `npm ci`, then `npm run dev` (port 8081).

Run `npm run typecheck`, `npm run lint`, `npm run seo:generate`, `npm run build`, `npm test`, and `npm run seo:check` before release. Tests require a current build. `npm run preview` serves the build on port 4181.

With dev and preview running, `npm run test:http` checks both servers. Optionally set `PORTFOLIO_DEV_URL` and `PORTFOLIO_PREVIEW_URL` to include the portfolio cutover checks; requests never follow the migration redirects to production.

## Architecture

- React + TypeScript + Vite + Tailwind, with locally served IBM Plex Sans and Space Grotesk.
- `src/data/sketches.ts` owns episode content. Published entries require an image, local lesson path and LinkedIn URL; upcoming entries cannot reference an unreleased asset or live link.
- `site.routes.mjs` is the typed public-route manifest used by rendering, metadata, sitemap and delivery rules. The site prerenders the gallery and four published lesson pages.
- One responsive DOM grid, accessible sort controls, noninteractive upcoming episodes, and CSS-only motion.
- `src/entry-server.tsx` renders each manifest route during the build; `src/main.tsx` hydrates the matching page. No server runtime is deployed.
- `site.config.mjs` owns site identity and SEO values. `scripts/seo.mjs` adapts the portfolio's metadata, escaping, and generated routing/header patterns.
- `public/` contains only Data Sketch assets, fonts, favicon, OG artwork and generated SEO files. There is no Supabase, resume, PDF viewer, affiliate banner, or authentication dependency.

## Publishing an episode

1. Add only the released image under `public/images/data-sketch/` with a descriptive lowercase filename. Keep unreleased images outside the repo's public directory.
2. Change the corresponding data entry to `status: 'published'` and provide its final metadata, alt text, image and LinkedIn URL. Preserve the episode ID.
3. Add the published lesson copy and route metadata without inventing details that are absent from the diagram or source caption. Update `contentUpdated` to the release date, regenerate SEO and run all checks.
4. Verify the diagram is readable, fully visible and keyboard-accessible at mobile, tablet and desktop sizes. Default episode ordering is ascending; latest-first includes upcoming IDs, matching the previous gallery.

The topic filter intentionally remains off. Do not introduce a CMS, lightbox or GSAP without a separate brief.

## Hosting and analytics

Create a separate Netlify site connected to this repository. Build: `npm run build`. Publish: `dist`. Production branch: `main` after release approval. Never reuse the portfolio Netlify site.

Deploy previews and branch deploys emit `noindex, nofollow` in HTML and response headers, omit analytics and contain an empty sitemap. Crawling remains allowed so crawlers can read noindex. Unknown routes return actual 404; HTML aliases redirect to their clean canonical paths. `humans.txt` and `llms.txt` are public text files but stay outside the sitemap.

Configure `CLOUDFLARE_WEB_ANALYTICS_TOKEN` only with the separate Data Sketch token. Unset means no beacon. Production-context builds alone may emit the configured beacon; preview deploys never do. This public beacon ID is not a credential. No cookies/storage or targeting are implemented by this app.

DNS, custom domain, HTTPS, Search Console submission and actual analytics verification are manual release gates. See [migration runbook](docs/migration.md).

## Brand assets

The supplied 2145 x 186 PNG wordmark is preserved unchanged. The favicon uses a dedicated data-bars mark; the OG artwork source is `design/og-image.svg`, exported to the committed 1200 x 630 PNG. Favicons are committed SVG/PNG assets. To re-export original SVG artwork, use Sharp (or an equivalent SVG renderer) with the corresponding output sizes; no raster editing or external image service is required.

## Verification boundary

Local browser QA on 2026-10-02 covered the 320, 375, 768, 1024 and 1440 px layouts, responsive gallery columns, pointer sorting, a direct lesson load, hydration console output, and the back-to-top focus return. A full keyboard-only pass, browser-emulated reduced motion, failed-image recovery, and the deployed production build remain release gates. Static and HTTP tests do not replace those checks.
