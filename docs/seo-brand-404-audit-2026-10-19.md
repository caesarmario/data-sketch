# Data Sketch SEO, brand and 404 audit

Version 1.0.2 / v2026.10.19, branch codex/data-sketch-episodes-05-09.
This report describes local changes. No commit, push, merge, deploy, DNS change,
Netlify setting change, or portfolio repository edit was performed.

## Audit and changes

The installed seo-technical, seo-page, seo-content, seo-schema, seo-sitemap and
seo-images skills are version 2.4.1. The managed doctor reported a ready browser
and Python 3.11 runtime. The planning audit used the HTML parser and live sitemap
discovery; relevant findings were verified in the source and built HTML.

| Finding | Severity | Action |
| --- | --- | --- |
| Live favicon.ico and 16 px icon returned 404 | Medium | Generated a real multi-frame ICO and the new PNG family from the supplied source. |
| Shared episode-file mtime refreshed all lesson dates | Medium | Replaced filesystem/Git-derived dates with explicit per-episode modifiedAt. |
| Image sitemap contained deprecated image:caption tags | Low | Removed the sitemap tag; retained alt text and ImageObject caption. |
| Existing 404 used generic sans-serif | Low | Adapted the approved minimal production design with local IBM Plex Sans and Space Grotesk. |
| Live HTML included /.netlify/scripts/hud | Low | Hosting-setting backlog only; did not alter Netlify settings. |

Live snapshot: gallery HTTP 200, one H1, initial HTML content and JSON-LD, valid
robots-discovered sitemap, and real unknown-path HTTP 404. Production still had
four published episodes / five sitemap pages. Local output has nine published
episodes / ten pages. New lesson 404s on production are deployment pending,
not evidence that the local route implementation is broken.

The prior live unknown-path response lacked an X-Robots-Tag header. Local dev
and preview now return both noindex metadata and that header; generated Netlify
headers cover /404.html. Verify the actual CDN fallback response after an approved
deployment rather than treating local middleware as proof of production headers.

## Copy and editorial dates

Approved meta description:

> Practical data engineering diagrams by Mario Caesar, with short lessons on SQL joins, backfills, data quality checks, and warehouse workflows.

Approved visible intro:

> I draw the checks and workflows behind SQL, data pipelines, and data warehouses, with short explanations for each sketch.

These read from site.config.mjs. Gallery HTML metadata, social metadata,
CollectionPage, Markdown and llms.txt use the same description. Copy was reviewed
with anti-slop-writing, humanizer and stop-slop. Titles, the hero heading, lesson
content, publication months, original source URLs and diagram bytes were preserved.

Episode 01-04 modifiedAt is 2026-10-07, supported by the significant schema
update in commit a996974. Episode 05-09 modifiedAt is 2026-10-19, the current
website content batch. These are website editorial dates, not inferred LinkedIn
publication dates. A pure helper validates calendar dates and ignores filesystem
mtime, formatting commits, builds, and asset-free future teasers.

Changing one lesson's editorial date changes that lesson and the gallery only.
A shared rendered-content change must explicitly update all affected episode
dates. This replaces the earlier dependency-timestamp workflow; CI no longer
needs Git timestamps to reproduce these SEO outputs.

## Brand and 404

Original PNG source hashes and dimensions are in design/brand/manifest.json.
Favicon outputs are ICO frames 16/32/48, PNGs 16/32/96, and Apple 180. Old SVG
icon links are removed from all generated HTML, including 404. Legacy files are
not deleted or used as the new source. The OG PNG preserves every decoded source
pixel at 1200 x 630; lesson shares still use the matching episode diagrams.

The 404 document is static, has no scripts, uses both local font files, has one
H1, no canonical-to-homepage, a visible keyboard focus outline, and a 44 px
Back to gallery target. It stays outside the sitemap. No portfolio React
component, analytics, resume flow, or other application dependency was copied.

## Local acceptance

- Typecheck, lint, production build, 22 tests and HTTP smoke checks passed.
- Tests parse ICO frame directories and PNG dimensions, verify source/output
  hashes, unique page metadata, gallery/lesson OG selection, editorial-date
  isolation, impossible-date rejection, 404 fonts/copy, and image sitemap tags.
- Dev and restarted preview passed page/Markdown/image/icon/font requests,
  clean HTML aliases, actual unknown/teaser 404s, and noindex header assertions.
  The preview process initially cached the old config module; restarting it
  resolved the old 404 response without an application-code workaround.
- A fresh real deploy-preview build verified all ten noindex pages, no analytics,
  an empty sitemap, new icons, and the static font-complete 404. The final dist
  was then rebuilt in production mode with ten indexable pages.
- Browser 404 checks covered requested 320, 375, 768, 1024 and 1440 px. No
  overflow, both fonts loaded, zero scripts, correct icon links, and keyboard
  focus on Back to gallery. The two narrow viewport requests rounded to 321/376
  CSS px in the browser provider; no claim of exact 320/375 emulation is made.

## Mobile Lighthouse

Three runs per page, Lighthouse 13.5.0, HeadlessChrome 155, fresh profiles,
412 x 823 / DPR 1.75, simulated 150 ms RTT / 1638.4 Kbps, CPU slowdown 4x.
All six runs completed without runtime errors or run warnings. Reports are
local ignored artifacts/lighthouse-gallery-1.json through 3 and
artifacts/lighthouse-reconciliation-1.json through 3.

| Median | Gallery | Reconciliation lesson |
| --- | ---: | ---: |
| Performance | 95 | 96 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 2935 ms | 2711 ms |
| CLS | 0 | 0 |
| TBT | 0 ms | 0 ms |

LCP in these lab runs is still above the 2.5 s good target. Keep it as a focused
performance follow-up; do not claim field Core Web Vitals pass from these scores.
No prior same-content lab baseline was available, so no ranking or performance
improvement percentage is claimed.

The local bundle is 179573 bytes / 56741 gzip versus the preceding episode build
at 180781 / 56798. CSS remains 20350 / 5000 gzip. No runtime dependency was added.

## Remaining release checks

- Disable the injected Netlify badge only after a separate hosting-setting request.
- After an authorized deploy, verify production favicon MIME/cache, root/lesson
  OG images, CDN unknown-path 404/noindex behavior, and indexing-enabled metadata.
- Submit the updated sitemap in Search Console after release. Actual indexation
  and field performance require GSC/analytics access; HTTP 200 and sitemap validity
  do not establish that Google has indexed the new lessons.
- Earlier browser reduced-motion emulation and full outbound-link traversal
  limits still apply to the unchanged gallery interactions. The new 404 has no
  motion, no JavaScript, and no outbound action requiring those capabilities.

Main-website placement remains a recommendation: one secondary Data Sketch link
under View All Projects, before Certifications & Credentials. It was not added.

## Primary references

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/appearance/snippet
