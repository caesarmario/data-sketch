# Latest-first gallery and shared newsletter width

Development date: 2026-11-08. Branch: `codex/datasketch-newsletter`.
The owner authorized implementation, push, merge into production `main`, and
live verification. There is no `master` branch in this repository.

## Result

- A new gallery document starts with published episodes 10 through 1, followed
  by upcoming episodes 11, 12 and 13. Latest first is the first and initially
  pressed sort button; Episode order switches the published entries to ascending.
  Refresh restores Latest first. The underlying content array remains unchanged.
- React SSR, hydration and gallery Markdown use the shared default. The first
  published image retains eager loading and high fetch priority. Sorting keeps
  stable keys and the existing single-reveal ASCII lifecycle.
- Newsletter inherits the shared 1280px outer shell and responsive gutters. Its
  header and footer align with the gallery and privacy page. Its main content
  shares privacy's 760px maximum width; introductory copy keeps its existing
  shorter measure. The theme, fonts and embedded form configuration are preserved.
- Only gallery `contentUpdated` advances to 2026-11-08. Individual episode dates,
  canonical routes, image bytes, random newsletter samples and analytics stay
  unchanged. Build label remains `v2026.11.08` for the same development date.

## Verification

- A regression failed on the prior oldest-first SSR, then passed with the change.
  It covers SSR and built HTML order, initial button state/order, priority image
  and corresponding gallery Markdown order.
- Typecheck, lint, production build, all 68 Node tests and SEO checks pass.
  Dev/preview HTTP smoke covers 13 pages, ten diagrams, Markdown, aliases and 404s.
- Twelve Chromium scenarios pass: shared frames at 320/375/768/1440px; no-JS
  content; delayed hydration; mouse and keyboard sorting; cached refresh;
  reduced motion; single reveals on episodes 10 and 1; stable published-only
  newsletter samples and real beehiiv iframe sizing at 375/1440px.
- No hydration errors, horizontal page overflow or observed native-image flashes.
  Layout detector reports no findings. Desktop/mobile screenshots are inspected.
  The real signup form is loaded read-only; no email is submitted or sent.

Current-machine evidence: `/workspace/scratch/datasketch-latest-layout-2026-11-08/`.
Baseline frame measurements are in `baseline-layouts.json`; browser results and
screenshots use `local-` prefixes. Production verification uses `live-` prefixes.
Local passes do not establish a successful production deployment. After pushing
`main`, verify the new asset fingerprint, gallery order, production frame widths,
route responses and GitHub CI, and retain those results in that evidence folder.
