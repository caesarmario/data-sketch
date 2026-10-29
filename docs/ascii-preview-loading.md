# ASCII preview loading

Implemented 29 October 2026 (Asia/Jakarta), build `v2026.10.29`.

The owner approved skeleton + reveal from [ascii-reveal](https://github.com/quanhoangindex/ascii-reveal),
without mascots, with the existing dark/green theme and local content fonts.
Both apps pin npm `ascii-reveal` to **0.3.0**. Its eight dist files were verified
byte-for-byte against upstream commit `f602e204232d2d31de2b67c66a166bcdbde51602`.
The upstream is a React library, not an agent skill. UI/UX Pro Max informed loading,
layout stability and reduced-motion decisions.

## Behavior

The real `img`, alt text, dimensions, lazy/eager attributes and source URLs remain
in the prerendered HTML. The empty placeholder is hidden in that HTML. Hydration
inspects the image rather than substituting a skeleton for already available data.
Cached and priority/LCP images keep native rendering, with no animation import.
Only a still-pending, non-priority preview within 120 px of the viewport requests
the deferred ASCII module. Source changes reset the lifecycle; sort/rerender alone
does not replay it.

The library's `asciiSkeletonHTML` renderer produces the same Dither skeleton
markup as `AsciiSkeleton`; `animateSkeletons` adds the shimmer. Successful images
use `createAsciiReveal` with Decode, Fast, top-left origin and `mascot: null`.
The engine targets only the image, not surrounding text or controls. There is no
full-page loader, hydration entrance effect, fake progress or minimum loading delay.
If the image arrives before the animation chunk, it remains visible immediately
and the late chunk does not animate it retroactively.

Loading marks only the preview `aria-busy`; skeletons and overlays are decorative
and cannot capture pointer input. Reduced motion keeps the skeleton static and
skips decoding. Changing the preference stops an active shimmer/reveal immediately;
turning motion back on can resume a still-pending skeleton. The engine's slow-device
fallback stays enabled. Completed, cancelled and unmounted effects release canvases.
A 15-second image deadline starts near the viewport, not when a distant lazy image
mounts. Errors/deadlines expose the preview alternative. A 1.5-second reveal watchdog
restores a successful image if the effect stalls. Animation chunk failure preserves
native image behavior.

## Validation

- Required typecheck, lint, build, tests and SEO checks passed in both applications.
- Eight new behavioral tests per app cover SSR/cache/priority, pending visibility,
  late/blocked chunks, failure/deadline, live reduced motion, source replacement,
  Strict Mode cleanup and the reveal watchdog. Test totals: portfolio 128; Data Sketch 36.
- Production-preview Chromium checked normal/reduced motion at 375 and 1440 px,
  real slow-image skeleton/reveal, no stacked media/card entrance, cache, failed
  images, image-before-chunk recovery and no-JavaScript images. Image timeout uses
  an accelerated timer in browser QA; regression tests exercise the actual 15s timer.
- Existing dev/preview HTTP smoke checks passed for both sites, including canonical
  aliases, Markdown headers, images, 404s and portfolio handoffs.
- Existing metadata, schema, content dates, image bytes, linked destinations and
  tracking identities remain unchanged. Public build labels are regenerated; the
  portfolio's 135 changed public support files differ only in that label.

Current-machine scripts, screenshots and raw measurements are in
`/workspace/scratch/ascii-reveal-implementation-2026-10-29/`.
These are local checks, not measurements of a production Netlify deployment.

## Release

Development branch: `codex/datasketch-newsletter` in each repo. Main merge and
production deployment require the owner's separate instruction. No production
release, DNS change, subscription submission or beehiiv setting change is included.

## Data Sketch scope

Published gallery preview images use `src/hooks/useAsciiImage.ts`. The first,
high-priority gallery image and the lesson's main diagram render natively. Upcoming
10 and 11 retain their asset-free teaser treatment. Original LinkedIn and lesson
links remain usable while an image loads. Latest first still produces 09 through
01, followed by Upcoming 10 and 11. The cross-origin newsletter iframe and lesson
body are outside this effect.

## Local performance comparison

Three cold runs per build: Chromium, 375 x 844 px, 4x CPU throttling, 75 ms network
latency, 200 KB/s download; initial viewport only. These lab samples have normal
run-to-run variance and are not field Core Web Vitals.

| Site | Baseline median LCP | Final median LCP | Baseline median CLS | Final median CLS |
| --- | --- | --- | --- | --- |
| portfolio | 820 ms | 848 ms | 0.01285 | 0.01285 |
| datasketch | 1612 ms | 1612 ms | 0.00067 | 0.00067 |

The optional engine is a separate chunk of about 17.1 kB gzip in each site. It was
not requested in any of the six measured initial mobile viewport runs. Total built
JavaScript across all chunks increases by approximately 18 kB gzip per site; that
total is not the initial-page transfer size. Critical text and priority media are
not put behind its download or decoding. The measurements show low CLS and no
large LCP regression in this sample, not a guarantee for every device/network.

Additional browser checks passed: credential search removes a pending skeleton
and restores images after clearing; text-only project/mentoring archives keep their
normal presentation; keyboard links remain usable during loading; rapid episode
sorting keeps the pending image node; reduced-to-normal motion resumes shimmer.
There are 21 controlled browser cases across the two QA runs.
