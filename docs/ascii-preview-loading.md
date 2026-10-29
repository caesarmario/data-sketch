# Gallery preview Decode

Updated 29 October 2026 (Asia/Jakarta), build `v2026.10.29`.

Published gallery episodes **01–09** receive one Decode reveal when first entering
view, including cached previews. Episode 01 is eligible too: download priority is
an image-fetch setting, not a reason to skip the reveal. Its `eager` loading and
`high` fetch priority remain intact.

The owner approved **Decode**, a wave from the **top-left corner**, **1.8× speed**,
and no mascot. The underlying duration is `cinematic`, matching the upstream demo's
base timing rather than speeding up the previous `fast` setting. The dependency
stays pinned to `ascii-reveal` **0.3.0**, reviewed against upstream commit
`f602e204232d2d31de2b67c66a166bcdbde51602`.

Impeccable and UI/UX Pro Max informed the motion, loading and accessibility
constraints. The portfolio now has a separate, quieter loading treatment; it no
longer shares this gallery's animation lifecycle.

## Lifecycle

- Preserve real `img` elements, alt text, dimensions and fetch attributes in SSR.
  Placeholders start hidden and empty. No-JavaScript pages retain native images.
- Prepare the shared optional engine within **600 px** of the viewport. Reveal at
  **15% visible intersection** once the image and library are both ready. A cached
  image remains eligible. If the image arrives before the library, its reveal is
  queued; there is no full-page loading gate or artificial loading duration.
- Show the library's Dither skeleton only for a genuinely pending visible image,
  with `aria-busy` on the preview. Clear it on image arrival. Skeletons and canvases
  are decorative and cannot intercept links or clicks.
- Consume a reveal once per document, route and image source. Scrolling, sorting,
  responsive sizing and remounting cannot replay it. Download-priority changes
  neither exclude a card nor reset its consumed state.
- Honor reduced motion, including live preference changes. Keep skeletons static
  when requested, stop active reveals and retain the native final image.
- Restore native media on exit, cleanup or engine failure. Keep the visible-image
  loading deadline at 15 s and reveal watchdog at 1.5 s; these are safety limits,
  not minimum animation/loading times. Retain the engine's slow-device fallback.

The main lesson diagram stays native. Upcoming episodes 10/11 stay asset-free.
Latest-first remains 09–01 followed by Upcoming 10/11. No theme, font, content,
metadata, diagram bytes, URL, newsletter form or editorial-date change is included.

## Verification

The episode-01 regression fails on the previous priority bypass and passes after
this change. The lifecycle tests also assert the actual Decode/corner/1.8× options,
cache, viewport entry, deduplication, cleanup, reduced motion, errors and fail-open
restoration. Full Data Sketch checks and all **42 tests** pass.

Current-machine browser evidence, before/after lab measurements and verification
logs are in `/workspace/scratch/ascii-refinement-2026-10-29/`. These are local
production-build checks, not evidence of a new production release. See that
folder's `browser-results.json`, validation logs and performance comparison for
completed cases and exact conditions.

## Browser and performance results

All **26 browser scenarios** across both sites pass at 375/1440 px, covering
ordinary connections and warm cache, real pending loads, delayed hydration,
reduced motion and live preference changes, failures, deadlines, delayed decoding,
late Data Sketch chunks, sorting, credential filtering and no JavaScript. Actual
nontransparent episode-01/02 glyph frames were captured; portfolio cover-opacity
samples confirm a monotonic fade without hiding the native image.

Three cold mobile lab runs per build (Chromium 375 × 844, CPU 4×, 75 ms latency,
200 KB/s download; initial viewport only) produced these medians:

| Site | Baseline LCP | Refined LCP | Baseline CLS | Refined CLS |
| --- | --- | --- | --- | --- |
| Portfolio | 804 ms | 884 ms | 0.01285 | 0.01285 |
| Data Sketch | 1608 ms | 1624 ms | 0.00067 | 0.00067 |

These small samples are lab observations, not field CWV or ranking guarantees.
Portfolio's total emitted JavaScript falls by **15,896 gzip bytes** because the
Decode engine is removed; Data Sketch's total decreases by 11 gzip bytes. Data
Sketch now prepares the optional engine near episode 01 as well, so it may arrive
earlier and do more work during the initial viewport. Reduced-motion and
slow-device fallbacks remain in place. Public/editorial SEO data is unchanged.

## Release

Development is pushed to `codex/datasketch-newsletter`. The current production
baseline is `8428059`; this refinement requires a separate owner instruction
before merging to `main` or deploying. The build label remains `v2026.10.29` for
the same development day. Sitemap dates remain editorial dates.
