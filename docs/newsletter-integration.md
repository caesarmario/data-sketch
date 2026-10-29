# Newsletter integration

Prepared on 21 October 2026. The signup page lives at
`https://datasketch.caesarmar.io/newsletter`; `/privacy` explains subscription data
and links to the provider policies. Both pages use the existing dark/green style,
local fonts, prerendering, Markdown alternates, and route manifest.

The 22 October newsletter refinement is recorded in
[newsletter-redesign.md](newsletter-redesign.md). Its remaining vendor changes
are in [newsletter-form-settings.md](newsletter-form-settings.md). These are
manual beehiiv settings; they have not been applied through this environment.

The header and the end of each published lesson link to the signup page. The
portfolio adds a secondary link beside its existing Data Sketch shortcut. Release
Data Sketch before the portfolio so that the new destination exists first.

`newsletter.config.mjs` owns the beehiiv form ID, public loader/form URLs,
newsletter copy, sample episode IDs, privacy copy, and policy update date. The
official loader runs after hydration on the newsletter page only. The form has an
accessible iframe title and a direct signup link if JavaScript or the provider
script is unavailable. No API key, custom subscriber database, or server endpoint
was added. Confirmation and welcome email behavior remains controlled in beehiiv.

The initial integration used build labels `v2026.10.21` on both sites. The shared Data Sketch header,
lesson signup invitation, and footer privacy link changed rendered content, so
the gallery and nine lessons have editorial modification dates of 21 October.
Original publication months, lesson copy, source URLs, and image bytes are intact.
The source-bound preservation tests still pass.

## Verification

- Data Sketch: typecheck, lint, production build, 26 tests, and SEO checks passed.
- Portfolio: lint, all three typechecks, production build, 120 tests, SEO and
  campaign source/dist checks passed.
- Data Sketch development/preview HTTP checks passed for all 12 HTML pages,
  Markdown endpoints, nine diagrams, aliases, and real unknown/teaser 404s.
  Checks also verify route-specific HTML titles in development and preview.
- An actual deploy-preview build produced 12 noindex pages, an empty sitemap,
  and no analytics beacon, even with a valid test beacon ID configured. The final
  local output was rebuilt in production mode afterward.
- Browser checks at 320, 375, 768, 1024, and 1440 px passed on both sites without
  horizontal overflow or uncaught page errors. The signup page rendered exactly
  one loader and one iframe at each width; its input and button remained inside
  the iframe viewport. The portfolio link retained a 44 px target.
- A lesson's Subscribe link opened the newsletter page and loaded the form.
  Privacy and lesson pages made no beehiiv requests before that navigation.
- Blocking the loader displayed the failure message and direct signup link.
  With JavaScript disabled, the prerendered page, examples, privacy link, and
  direct signup link remained available.

## Remaining release checks

No subscription was submitted, no email was sent, and no beehiiv account setting
was changed during these checks. Test confirmation, subscriber status, welcome
email delivery, replies, and unsubscribe using an owner-controlled address.

The embedded provider currently presents the email input using its placeholder.
The label toggle may be disabled for single-field forms; see the documented
vendor limitation and remaining consent/placeholder settings in the builder guide.

Production deployment, actual Netlify headers/clean URLs, and the subscription
email flow still require release verification. Keep production `main` unchanged
until the owner instructs otherwise.

## Netlify routing correction — 29 October 2026

After the owner authorized the main release, production verification exposed a
self-redirect at `/newsletter` and `/privacy`. Netlify matches trailing-slash
variants as the same path, so forced `/newsletter/ -> /newsletter` and
`/privacy/ -> /privacy` rules also matched their own destinations.

The generator now omits slash-only aliases from Netlify output, as it already
does for lesson URLs. Explicit HTML aliases stay permanent redirects; local
Vite aliases, canonical URLs, metadata, page content and build date stay intact.
A regression fails on the old output and passes after the correction. Typecheck,
lint, build, all 37 tests and SEO checks passed. Verify canonical pages, HTML
aliases, Markdown headers and the actual 404 again after this deployment.
