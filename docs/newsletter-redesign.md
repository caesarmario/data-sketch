# Newsletter redesign — 22 October 2026

The `/newsletter` page now uses a left-aligned reading column up to 640 px wide.
The heading explains the subject, the description explains the series format, and
the frequency precedes the signup form. The existing logo, dark/green palette,
local Space Grotesk and IBM Plex Sans, official beehiiv integration, canonical
route, and prerendering remain in use.

Newsletter-specific navigation is logo + **Browse sketches**. The examples are
real, full-ratio diagrams from episodes 2 and 8; the links lead to their lessons.
The author area is **About Mario**. Attribution, Privacy and the site's version
and text links sit in a normal-flow footer. Gallery, lessons and portfolio were
outside this redesign.

`newsletter.config.mjs` supplies the public introduction, frequency and headings
to HTML and Markdown, along with the form copy to use in beehiiv. Policy copy is
unchanged; `privacyModifiedAt` preserves its original 21 October date in HTML,
schema, sitemap and Markdown. Newsletter `modifiedAt` and the Data Sketch build
label are 22 October, the implementation date in Asia/Jakarta. The underlying
package version remains 1.0.2; lesson and gallery editorial dates stay unchanged.

## Visual review

The wording was refined on the same development date to match the wider data
engineering scope. The headline is **Data engineering, explained visually.**
The introduction reads: **Data Sketch is a series of diagrams and worked
examples, with short explanations you can follow and use in your own work.**
Frequency remains **Two emails a month.** Metadata uses the same scope and names
Mario Caesar as author; the layout, fonts and form settings are unchanged.
The screenshots below are refreshed for this wording update.

For this copy update, typecheck, lint, production build, all 28 existing tests
and SEO checks pass. Generated HTML and Markdown contain the approved wording;
description, Open Graph and Twitter metadata agree. A fresh browser pass at 320,
375, 768 and 1440 px found no text/page overflow or uncaught page errors, with one
loader and iframe. The headline takes two lines at 320, 375 and 1440 px, and one
line at 768 px. No layout adjustment was needed.

Actual local production-build captures, using the currently published vendor
form rather than a mockup:

- [Desktop, 1440 px](newsletter-redesign/desktop.png)
- [Mobile, 375 px](newsletter-redesign/mobile.png)

The form in these screenshots still has the vendor's existing title, subtitle,
charcoal background and outer padding. Apply
[the builder settings](newsletter-form-settings.md) to finish the compact form.
The website wrapper cannot style the iframe's contents. No beehiiv account
setting was changed from this environment.

One batched desktop/mobile review led to one correction batch: align the two
desktop lesson actions and make footer utilities 12 px with readable contrast.
One final desktop/mobile capture confirmed those adjustments. No generated
image, theme replacement, new UI framework or motion dependency was introduced.

## Verification

- Typecheck, lint, production build, 28 tests and SEO generation checks pass.
- HTTP smoke passes in development and preview for 12 pages, nine images,
  Markdown headers, canonical aliases and real unknown/teaser 404s.
- Browser checks at 320, 375, 414, 768, 1024 and 1440 px show no horizontal
  overflow in either the page or the vendor form. Two sample previews retain
  their 4:5 ratio; they stack on mobile and use two columns on desktop.
- Exactly one loader and iframe render; neither loads on gallery, privacy or
  lesson routes before newsletter navigation. A lesson's Subscribe link opens
  the newsletter and its form. No uncaught page or hydration errors occurred.
- Keyboard skip navigation focuses the main content; the email input receives
  focus and retains a native outline. The two local fonts load. A 200% CSS-zoom
  reflow check at a 1280 px viewport has no horizontal overflow; this is a
  layout check, not a claim of exhaustive assistive-technology testing.
- The initial loading reserve measures 200 px. Loader blocking and the 15-second
  timeout expose a hosted-form fallback and remove the empty reserve. With
  JavaScript off, introduction, samples, Privacy and signup link are available
  without an empty 200 px space. When ready, only Privacy remains below the form.
- An actual deploy-preview build, with a valid dummy analytics ID, produces
  12 noindex pages, no beacon, noindex headers and an empty sitemap. Local output
  was then restored to a production build and checked again.

## Design review and remaining limits

Impeccable's detector reported warnings for the owner's required Space Grotesk
and an existing lesson CTA's 2 px green side border. These were retained because
the font is explicitly locked and the lesson CTA is outside the redesign. The
inline design review checked the finished components and stylesheet against the
incumbent palette, typography, local font sources and reduced-motion behavior;
it introduced no replacement design system. Hallmark review: philosophy 4,
hierarchy 4, execution 4, specificity 5, restraint 4, variety 4. Existing palette
and brand artwork take precedence over catalog aesthetic rules.

The live vendor email input still has no associated label or aria-label and
uses **Enter your email** as its placeholder. The current checkbox is required
and unchecked, but double opt-in and delivery behavior were not inferred from
that checkbox. See the builder guide for the best native label option, darker
placeholder, shorter consent, transparent compact layout and double opt-in.

At 375×844 the current input/button are already within the first viewport
(about y=558–603), but the final compact form and its accessibility improvements
must be checked again after the owner publishes the vendor settings. No email
was submitted; confirmation, welcome, reply-to and unsubscribe require an
owner-controlled address. This is not a claim of full accessibility or end-to-end
email verification. Production release still needs the owner's instruction.
