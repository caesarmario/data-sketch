# Green ASCII-first Data Sketch images

Updated 29 October 2026 (Asia/Jakarta), build `v2026.10.29`.

The owner approved an ASCII-first entrance on every refresh, including when the
image file is cached. File caching remains enabled; playback state is reset by a
new document. Within one document, scroll, sorting and responsive sizing do not
replay a consumed image. Identical artwork in different page sections has its own
entrance, so a Highlight cannot suppress its Mentoring preview.

## First-paint contract

- The existing `ascii-reveal` 0.3.0 library generates deterministic Dither markup
  during SSR. The same markup hydrates without replacement; it starts hidden in
  default HTML. Real `img` elements, sources, alt text, dimensions and fetch
  priorities remain present.
- A small inline head bootstrap opts supported, motion-enabled JavaScript clients
  into `data-ascii-boot="on"` before the body can paint. Scoped CSS then covers
  pending media with the green scaffold and sets native image opacity to zero.
  This closes the SSR/cache flash that a passive React effect cannot prevent.
- The application claims startup after React commits, including image-free public
  routes. A 5s bootstrap deadline fails open if the application never starts.
  Late hydration after that deadline cannot re-hide or replay the native image.
- Readiness is independent of cache: completed files still decode and wait for
  15% viewport visibility. Two presentation frames give the scaffold a painted
  frame before the reveal starts. Skeleton visibility is a deliberate entrance,
  not a claim that a cached image is downloading.
- `aria-busy` represents a real pending visible image. A 15s load deadline exposes
  the existing accessible fallback; decode rejection or its 1s safety deadline
  retains the valid image. A bounded reveal watchdog prevents stuck covers.
- No-JavaScript, unsupported clients and reduced motion retain native media.
  A live reduced-motion request disables the gate for the document and cancels
  active effects. Do not re-enable it later in that document.
- Glyphs and scaffolds use the existing `--accent` green. Overlays are decorative
  and pointer-transparent. Text, navigation, forms and logos remain usable.

## Verification

All required typechecks, lint, builds, tests, SEO and portfolio campaign checks pass:
**50 Data Sketch tests and 141 portfolio tests**. These include actual hook/frame
lifecycle tests, bootstrap failure handling and every prerendered media route's
head-before-body gate and real SSR glyph markup. The existing source SSR test
loader now compiles .mjs dependencies as CommonJS for its VM; application module
semantics are unchanged.

A controlled before/after browser reproduction holds application JavaScript while
allowing the image to finish loading. Both old pages exposed native opacity 1;
both new pages retain opacity 0 and a visible scaffold before hydration.

All **42 production-build browser scenarios** pass: homepage, credential archive,
gallery, newsletter samples and primary lesson diagram at 375/1440 px, each with
an initial visit and two refreshes; delayed JavaScript, startup timeout with no late
replay, reduced motion and no JavaScript. Samples assert a painted green scaffold,
exactly one effect per target and no native frame before effect start. Data Sketch
runs also capture actual green canvas pixels; sorting cannot replay previews.

Current-machine evidence is in `/workspace/scratch/ascii-first-paint-2026-10-29/`.
HTTP smoke checks cover Data Sketch dev/preview, Markdown/aliases, unpublished and
unknown-path 404s, plus portfolio preview routes and exact legacy handoffs. The
Impeccable detector reports no findings on the changed media surfaces.

## Performance observations

Three cold Chromium runs per build, 375 × 844, CPU 4×, latency 75 ms, download
200 KB/s, initial viewport only. Portfolio median LCP is 832 → 972 ms, and CLS stays
0.01285. Data Sketch CLS stays within the existing 0.00015–0.00067 range. These are
small lab samples, not field CWV or ranking guarantees.

Data Sketch's reported LCP changes from 1652 ms on an image to 752 ms on a decorative
scaffold span. Those candidates are **not comparable evidence that the diagram
loads faster**. The actual diagram is intentionally held until its entrance.
Portfolio total emitted JS grows by 354 gzip bytes; Data Sketch total falls by
2897 gzip bytes. Data Sketch now loads its core engine with the application so
SSR scaffolding and the reveal can hand over synchronously, rather than leaving a
completed image visible while an optional engine arrives.

## Release

The owner authorized development, push, merge and live verification for both sites
in this request. Development remains on `codex/datasketch-newsletter`; release is
by fast-forward to the validated commit. Actual remote and production results are
recorded separately during release. The build marker remains `v2026.10.29` for the
same local development day. Theme, fonts, image bytes, public copy, metadata,
editorial dates, redirects, cache headers and newsletter settings are preserved.

## Data Sketch treatment

All published gallery episodes **01–09**, the **primary lesson diagrams**, and the
**two newsletter sample diagrams** use Decode from the top-left corner at **1.8×**,
with the cinematic base timing and no mascot. The custom preset retains Decode's
ramp/cells and sets image glyph color to `accent`; merely setting `--ascii-glyph`
would leave the preset's original mono image renderer white.

The engine primes its opacity hold synchronously while the scaffold still covers
the image. The hook then releases the scaffold into Decode in the same task. A
1.5s reveal watchdog restores native media on failure. Episode 01 and lesson
images retain eager/high fetch priority independently of reveal eligibility.

`AsciiImage` supplies the same SSR and lifecycle to lesson/newsletter diagrams.
Gallery cards preserve their existing original-post error link. Upcoming 10/11
remain asset-free, and latest-first still places 09–01 before Upcoming 10/11.
The beehiiv iframe is outside the gate; signup controls are never animation-gated.
