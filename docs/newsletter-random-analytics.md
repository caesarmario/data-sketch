# Newsletter samples and analytics

Development date: 8 November 2026. Build: `v2026.11.08`.

The owner authorized development on `codex/datasketch-newsletter`, followed by
merge to the existing production branch `main`. No `master` branch exists. This
batch is restricted to Data Sketch; the portfolio's pending card changes and
separate analytics identifiers are outside its scope.

## Published samples

The development branch was fast-forwarded to `fa53b3a` before editing, retaining
the already-published episode 10 and asset-free upcoming episodes 11-13. The
eligible pool reads `status: 'published'` from `src/data/sketches.ts`; publishing
a later lesson makes it eligible without editing a second list.

A partial Fisher-Yates shuffle selects two distinct episodes per document.
Sampling can produce the same pair on separate visits. It uses no browser
storage, cookie, session history or server runtime. The selection remains stable
through Strict Mode, form readiness changes, scroll and resize.

Static HTML and Markdown retain episodes 2 and 8 as working fallback examples.
On the newsletter route only, a small parser bootstrap clones and updates those
two cards from a catalog containing published metadata. It commits both cards
before the deferred React entry runs; React reads that same pair for hydration.
This avoids rendering fixed samples, swapping them after hydration and replaying
their image effects. Only selected images are inserted; the catalog has no
unpublished artwork, captions or newsletter subscriber data.

Native HTML is visible by default. A short-lived head opt-in covers the sample
list while the synchronous parser step prepares its cards. A 5s deadline restores
the existing fallback if the parser script fails or arrives late; late startup
cannot hide or resample already-exposed content. The signup form, introduction
and navigation stay outside this cover. With JavaScript off, the original sample
links and signup fallback remain usable. CSR development selects once per document.

The existing green Decode/top-left/1.8x/no-mascot image lifecycle stays intact.
Prerendered content, diagram dimensions, source image bytes, theme and fonts are
preserved. Newsletter and privacy use explicit 8 November editorial updates;
the gallery's 3 November date and individual lesson dates are unchanged.

## Dedicated analytics

| Provider | Public identifier |
| --- | --- |
| Umami | `daf49df6-d97c-46a5-adc4-596b58be9260` |
| Cloudflare | `bcab4397f11c4bb69df934e6a7c39b9c` |

The shared HTML-head generator emits one production loader. It checks the exact
canonical hostname and guards repeated execution before appending each external
script once. Both are deferred classic scripts; Cloudflare does not use module
semantics. Deploy previews/branch deploys omit the loader and keep noindex plus
an empty sitemap. Localhost and other hostnames cannot start these trackers even
when serving a production build. Static 404 output has no tracker.

The IDs live in `site.config.mjs`. The old Cloudflare environment variable cannot
silently override the owner-supplied token. This app does not read signup values
or add subscription-success events. Umami strips search/hash through supported
tracker attributes and a callback that sanitizes page/referrer URLs and removes
event form properties. The callback accepts the current one-argument payload
format and the older two-argument format. Event metadata stays intact.

The vendor scripts downloaded during verification are Umami's current tracker
and Cloudflare's beacon. Cloudflare also strips query/hash/user-info from its
reported location/referrer. Local browser QA runs those actual scripts with
collector requests intercepted; fixture tests do not create production visits.

## Verification

Current-machine logs and screenshots are in
`/workspace/scratch/datasketch-newsletter-2026-11-08/`.

- 67 Node tests pass, including sampling, hydration seed reuse, eligibility,
  production host guards, dedicated identifiers, serialization and payload hygiene.
- Typecheck, ESLint, production build and SEO source checks pass.
- HTTP smoke checks pass on dev and preview: 13 pages, 10 images, Markdown
  headers, aliases, and actual unknown/upcoming 404 responses.
- 19 production-build browser scenarios pass at 320/375/768/1440 px: repeated
  refreshes, unchanged pair during form updates, one ASCII reveal per image,
  episode 10, reduced motion, no JS, delayed hydration, failed startup/parser,
  CSR and actual vendor code with intercepted collectors.
- The local form-readiness test uses an inert iframe fixture. No email was
  submitted, and this does not establish beehiiv email-delivery behavior.
- Actual vendor requests omit the test email/query/hash and form input. Exactly
  one script per provider loads per document in the canonical-host fixture.
- An actual deploy-preview build has 13 noindex public pages, no analytics loader,
  noindex response headers and an empty sitemap. Browser checks on the canonical
  hostname still produce no tracker requests; random sample selection works.
- Visual inspection preserves the existing dark/green layout and both fonts.
  The detector flags only existing Space Grotesk declarations and the unchanged
  quote border; the owner's pinned theme takes precedence over those suggestions.

Release execution must verify the newly served public build, route responses,
sample choices and real tracker requests after merging to `main`. Dashboard
totals require provider access and must not be inferred from script tags alone.
