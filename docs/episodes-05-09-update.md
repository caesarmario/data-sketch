# Episode 05-09 content update

Local branch: `codex/data-sketch-episodes-05-09`.
Prepared version: `1.0.2` / `v2026.10.19`. Not pushed or deployed.
Only the Data Sketch repository was changed; no portfolio changes or checks ran.

## Source mapping

| Episode | Source file | Publication month | Original LinkedIn link | Lesson |
| --- | --- | --- | --- | --- |
| 05 | ep05.png | July 2026 | https://lnkd.in/p/g7Qw3Uvf | /sketches/safe-publish-pattern/ |
| 06 | ep06.png | August 2026 | https://lnkd.in/p/gEqAwxzN | /sketches/reconciliation-workflow/ |
| 07 | ep07.png | August 2026 | https://lnkd.in/p/ghHjf7Eb | /sketches/late-arriving-data/ |
| 08 | ep08.png | September 2026 | https://lnkd.in/p/gdfHCzTz | /sketches/data-freshness/ |
| 09 | ep09.png | October 2026 | https://lnkd.in/p/gbbYGrdV | /sketches/partitioning/ |

The user supplied all five PNGs and links. The title and episode label inside
each diagram agree with its filename. Small slide numbers in the upper-left
corner are not episode identifiers. Source PNGs remain outside the repository.
Episode 01-04 data and image bytes are protected by regression checks.

The shortlinks returned LinkedIn redirects with highlighted-post parameters.
They remain verbatim in the data, gallery, lessons, and generated Markdown.
A browser visit to the Episode 05 source displayed a LinkedIn sign-in dialog;
captions and their match to the diagrams are not claimed as independently verified.

## Editorial decisions

Copy was reviewed through anti-slop-writing, humanizer, then stop-slop. The
diagram supplies the facts; the lesson text explains the diagram without adding
personal incidents, production metrics, SQL examples, or daily publication dates.

- Safe publishing follows build, staging, validation, stop/publish, and monitoring.
  Atomic swapping or promotion is qualified by target-system support.
- Reconciliation checks the window, filters, grain, keys, pipeline stage, and late
  updates. A count difference alone does not prove missing records.
- Late-arriving data describes the five illustrated causes, not a new backfill
  implementation or a promise that one strategy handles every late update.
- Freshness distinguishes a successful run from delivery of the expected data.
  Passing checks leads to publication; failure leads to investigation and communication.
- Partitioning explains reduced scanning with explicit workload/platform limits.
  It does not promise that every partitioned query is faster or cheaper.

## Asset processing

JPEG derivatives retain the full 1080 x 1350 canvas, with no resize, crop, retouch,
or text edits. Sharp's bundled runtime encoded quality 92, 4:4:4 chroma, and
mozjpeg optimization. No new application dependency was added. Derivatives were
visually checked for preserved artwork and readable source text.

| Episode | JPEG bytes |
| --- | ---: |
| 05 | 119998 |
| 06 | 151746 |
| 07 | 109669 |
| 08 | 85894 |
| 09 | 116088 |

## Verified locally on 2026-10-19

- Baseline: 10 tests passed. Updated build: 13 tests passed, with no failures or skips.
- Typecheck, ESLint, production build, source SEO check, and diff whitespace check passed.
- Production output has 10 prerendered pages, one H1 and parsed JSON-LD graph per
  page, 10 sitemap URLs, and 18 diagram-image sitemap occurrences (gallery plus
  individual lessons). Each of the 10 Markdown pages has a canonical HTML target.
- Dev and preview HTTP smoke checks passed for all pages, Markdown MIME/noindex/
  canonical headers, nine images, aliases, support files, and unknown/teaser 404s.
  The optional portfolio environment variables were left unset.
- A real deploy-preview build emitted noindex HTML/headers, no beacon, and an
  empty sitemap. The final dist was rebuilt in production mode and rechecked.
- Gallery layout was inspected at requested 320, 375, 768, 1024, and 1440 px:
  one/two/three columns, no page or card overflow, and no teaser controls.
  Browser viewport rounding initially reported 321/376 for the two smallest
  requests; an additional calibrated check reached 320 CSS px without overflow.
- All five new lesson pages were opened in the mobile browser. Images loaded at
  1080 x 1350, month dates and exact source links matched, headings wrapped, and
  no hydration errors or warnings were reported before the failure simulation.
- Keyboard Space switched both sort orders; Enter on Episode 05's Read lesson
  opened the matching local lesson. Focus-visible green glow remained intact.
- A separate local-only proxy deliberately returned image 404s. Episode 05 showed
  its preview-unavailable fallback while keeping the source and lesson links usable.

## Bundle comparison

| Asset | Baseline bytes | Updated bytes | Baseline gzip | Updated gzip |
| --- | ---: | ---: | ---: | ---: |
| Main JavaScript | 170109 | 180781 | 54121 | 56798 |
| CSS | 20350 | 20350 | 5000 | 5000 |

The five lessons add 10672 JavaScript bytes / 2677 gzip bytes. CSS is unchanged.
These are local bundle measurements, not field performance or ranking results.

## Remaining gates

- Browser-emulated reduced motion: the current browser API exposes viewport
  controls but no media-preference override. The CSS regression test passed;
  browser-level emulation remains unverified.
- Full pointer-hover and keyboard-only traversal of every outbound/footer link
  remain deploy-preview checks; tested keyboard sorting/focus is not a claim that
  the entire accessibility journey has been audited.
- Original LinkedIn captions require accessible source content or manual review.
- Push, merge, deploy, Search Console submission, and production smoke checks
  require a separate instruction. After an authorized content commit, regenerate
  SEO and recheck lastmod from the clean committed state before publishing.
