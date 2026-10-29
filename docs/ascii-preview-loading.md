# ASCII preview loading and viewport reveal

Updated 29 October 2026 (Asia/Jakarta), build `v2026.10.29`.

Preview images receive one ASCII reveal at their first visible viewport entry,
including images that are already loaded or cached. Skeletons represent a real
image load only. This fixes the previous behavior where fast/cached previews
could skip the effect entirely.

The owner approved this behavior for both websites, with the existing dark/green
identity, Space Grotesk / IBM Plex Sans, Dither skeleton, Decode/Fast reveal and
no mascots. The installed dependency stays pinned to `ascii-reveal` **0.3.0**;
its distribution was verified against upstream commit
`f602e204232d2d31de2b67c66a166bcdbde51602`. UI/UX Pro Max guidance informed the
motion/accessibility constraints. No additional framework or font is installed.

## Lifecycle

- Keep actual `img` elements, alt text, dimensions and responsive/priority attributes
  in server-rendered HTML. The initial placeholder is empty and hidden. Native
  images remain readable with no JavaScript or when the effect cannot load.
- Prepare one shared animation import when an eligible preview comes within
  **600 px** of the viewport, independently of the image loading state.
- Start the reveal only at **15% visible intersection**, when both image and
  library are ready. Images stay visible while the library is arriving. If an
  image arrives first, its reveal remains queued instead of being discarded.
- A pending, visible image gets the library's Dither skeleton markup and an
  `aria-busy` preview. Image arrival clears both immediately; there is no forced
  loading duration. The image then decodes if it is still visible.
- Track consumed previews in memory per document, route and image source. Scrolling,
  hovering, sorting, effect reruns, credential filtering/remounting and size changes
  cannot replay the same preview. A new source or page reload gets a fresh reveal.
- Capture initial priority once per component, so sorting cannot reclassify an
  originally non-priority image as a protected first image or reset a played effect.
- Reduced motion keeps cached content native, keeps skeletons static and stops an
  active effect immediately. No delayed replay follows switching it back off after
  the preview was consumed. A still-pending skeleton can resume when allowed.
- Restore media on exit/unmount. Release canvases and listeners. Retain the 15s
  actual visible-image deadline, 1.5s reveal watchdog, and the engine's slow-device
  fallback. Animation errors do not turn a successfully loaded image into an error.

The effect targets only preview images. Headers, body text, links and inputs remain
usable; skeletons and canvas layers are decorative and cannot intercept clicks.
No full-page preloader, artificial progress, URL change, vendor form change,
tracking addition, or public copy rewrite is included.

## Verification

The regression for a cached preview preparing before viewport entry fails against
the previous implementation and passes after the change. There are **13 lifecycle
regressions per repository**: cache, actual entry, early/late module and image
arrival, offscreen loading, queued reentry, remount deduplication, sorting priorities,
source replacement, Strict Mode cleanup, errors/deadlines, reduced motion and
fallback restoration. Full suites pass: **133 portfolio tests and 42 Data Sketch tests**.

Required app/build-tool typechecks, lint, build, SEO and portfolio campaign checks
pass. Existing route, metadata, schema, editorial dates, image bytes and Netlify
redirect regressions stay intact. The public build label remains `v2026.10.29`
because this development is on the same local date.

Production-build Chromium checks on ordinary, unthrottled connections at 375 and
1440 px cover fresh and warm-cache loads on both sites. All **eight combinations**
produce exactly one target reveal, including when the image is already complete at
viewport entry. Instrumentation captured nontransparent canvas glyph frames while
the native image was still transitioning, not only a method/event invocation.

Additional browser cases cover real loading skeletons, reduced motion and live
preference changes, failed images, a simulated 15s deadline, image-before-chunk
recovery, no-JavaScript images, sorting/scroll replay prevention, credential filter
remounts and keeping the initial priority image native. All **25 browser cases**
pass with no uncaught page errors. Screenshots, glyph frames, QA scripts and raw
measurements are retained in `/workspace/scratch/ascii-reveal-viewport-2026-10-29/`.
These are local production-build checks, not claims about a new live deployment.

## Release

Push development to `codex/datasketch-newsletter` in each repository. This change
requires a new owner instruction before merging to `main` or deploying production.
Both production branches retain their previously released commits during this work.

## Data Sketch scope

The hook is `src/hooks/useAsciiImage.ts`. Gallery episodes 02–09 are eligible for
viewport reveal with the current default ordering. Initial priority episode 01 and
the main lesson diagram stay native to protect LCP. Upcoming 10/11 remain asset-free
teasers. Sorting still places published 09–01 before Upcoming 10/11.

## Local performance comparison

Three cold runs per build, Chromium 375 x 844, 4x CPU, 75 ms network latency and
200 KB/s download, initial viewport only. This is lab evidence, not field CWV.

| Site | Baseline median LCP | New median LCP | Baseline CLS | New CLS |
| --- | --- | --- | --- | --- |
| portfolio | 840 ms | 888 ms | 0.01285 | 0.01285 |
| datasketch | 1608 ms | 1624 ms | 0.00067 | 0.00067 |

The engine remains an optional chunk of about 17 kB gzip, now prepared before
viewport entry even for cached images. It can therefore be requested earlier
than the loading-only implementation. Across all JavaScript chunks, the hook
revision adds less than 1 kB gzip per site. Critical text and initial priority
media keep native rendering. Normal sample variance applies to LCP comparisons.
