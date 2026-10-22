# Data Sketch console greeting

Implemented on 2026-10-22 (Asia/Jakarta), build `v2026.10.22`.

The browser console displays the approved "Read between the boxes." message,
source-to-destination diagram and existing developer ASCII signature. The
heading is 22 px bold monospace, the diagram is 13 px, body text is 14 px and
the signature is 12 px. The 11 px label, diagram and signature URL use green
`#00E677` on a small `#1A1A1A` background. Other text inherits the DevTools
foreground. The console uses system monospace without downloading another font.

`src/main.tsx` calls `printConsoleGreeting` from `src/consoleGreeting.ts` outside
React rendering, after the initial mount or hydration has been requested. A
symbol on the current document prevents duplicate calls and module reevaluation
from printing another greeting. React state changes do not repeat it. Data
Sketch's normal links load a new document, so each destination prints once.
Importing or calling the module without a document prints nothing. Native console
methods are unchanged.

## Verification

- Typecheck, lint, 28 existing tests, production build and source SEO check pass.
- Existing HTTP checks pass against dev and production preview: 12 public pages,
  nine published images, metadata, Markdown headers, redirects and 404 responses.
- Chromium verifies exact copy and ASCII, six style segments, one greeting on
  initial load, no repeat after changing the gallery sort order, and one greeting
  per document after lesson navigation and reload. Reevaluating the module and
  calling it repeatedly also prints no additional greeting. No uncaught
  JavaScript errors occurred, including under development StrictMode.
- The approved greeting stays out of the page DOM. No page styling, metadata,
  routes, sitemap, editorial dates or beehiiv settings changed.
- Native DevTools visual inspection is blocked by the environment's browser
  policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). Browser console arguments and CSS
  were verified; rendering of the native console UI remains a manual check.

To inspect after an authorized release, open Chrome DevTools > Console, enable
Info messages, clear the filter and reload. Check both dark and light DevTools
themes. Production deployment is separate from this development change.
