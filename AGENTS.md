# Data Sketch agent guidelines

- This chat's work is restricted to the Data Sketch repository. Do not edit the
  portfolio repository or run its optional migration checks without a separate request.
- Read README and docs/migration.md before making routing or deployment changes.
- Preserve the approved dark/green editorial style and local IBM Plex Sans / Space Grotesk fonts. Logo remains uncropped. No GSAP or new UI frameworks by default.
- Episode content lives in src/data/sketches.ts; no unpublished image or hidden asset is allowed in public output. Keep one gallery DOM and stable episode IDs.
- Episodes 01-09 are published; 10-11 are asset-free teasers. Source PNGs remain
  outside public output; published JPEGs retain the full 1080 x 1350 artwork.
- Keep supplied LinkedIn shortlinks verbatim. Their highlighted-post redirects
  can select a different shared update; do not strip parameters or infer a replacement URL.
- Keep month-only publication dates when that is all the source diagram provides.
  Never infer a daily publication date from the filename or a LinkedIn activity ID.
- Public routes live in the typed site.routes manifest. Use it for SSR, metadata, sitemap, dev, preview and Netlify routing so those surfaces cannot drift.
- Edit public copy through anti-slop-writing, humanizer and stop-slop in that order. Preserve technical terms, source meaning and honest uncertainty; never invent incidents, metrics, dates or platform behavior to make a lesson sound specific.
- Preserve prerender/hydration parity. Do not hide initial content behind JavaScript or entrance animations. Follow prefers-reduced-motion and use CSS for lightweight motion.
- Canonical, sitemap, OG identity and analytics belong to datasketch.caesarmar.io, never the root portfolio. Author/social links may point to caesarmar.io.
- Compute sitemap and schema `dateModified` from the published episode's
  explicit `modifiedAt` editorial date, never a shared file mtime or Git commit.
  Gallery uses the latest published editorial date or site contentUpdated.
  Bump affected dates for meaningful copy, metadata, diagram or shared-template
  changes; do not bump them for reformatting or a build. Publication stays month-only.
  Keep diagram images discoverable in image sitemap entries and ImageObject;
  do not add deprecated image:caption tags to the sitemap.
- Gallery title/description/intro read site.config.mjs; do not duplicate them in
  route metadata. Lesson OG previews remain their diagrams, not the gallery card.
- Brand sources are the approved PNGs in design/brand. Generate icon/OG derivatives
  offline; never re-export the legacy design/og-image.svg over the new PNG.
  Old favicon.svg is a legacy asset only and must not be advertised by HTML.
- Preserve source alpha in every favicon PNG and ICO frame. Use transparent
  padding; never flatten the mark onto white or another opaque background.
- Keep 404 as static HTML with both local fonts, noindex metadata, a real HTTP
  404 status and a Back to gallery link. Verify actual Netlify response headers
  after an authorized deploy; local HTTP checks are not production evidence.
- Generate llms.txt and each Markdown page from the same episode data used by
  the UI. HTML pages must expose `rel=describedby` and a Markdown alternate;
  Markdown stays out of sitemap and uses noindex plus canonical Link headers.
- Treat llms.txt as a curated source index, not a ranking promise. Do not add
  llms-full.txt, Content-Signal, WebMCP, AI catalogs, agent cards, or named AI
  crawler groups without a concrete product or API need.
- Never copy credentials, .env files, Supabase or resume flows from the portfolio.
- Keep preview noindex and actual unknown-path 404. Social links use fixed absolute portfolio handoff URLs.
- No push/deploy/DNS changes without explicit user approval. Portfolio cutover must wait for verified subdomain production.
- Run typecheck, lint, build, tests and seo:check. Report blocked browser QA accurately; HTTP status is not a visual or end-to-end test.
- Update todo/list.todo with verified results and remaining release gates. Never edit list_backup.todo in the portfolio.
