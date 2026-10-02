# Data Sketch agent guidelines

- Read README and docs/migration.md before making routing or deployment changes.
- Preserve the approved dark/green editorial style and local IBM Plex Sans / Space Grotesk fonts. Logo remains uncropped. No GSAP or new UI frameworks by default.
- Episode content lives in src/data/sketches.ts; no unpublished image or hidden asset is allowed in public output. Keep one gallery DOM and stable episode IDs.
- Public routes live in the typed site.routes manifest. Use it for SSR, metadata, sitemap, dev, preview and Netlify routing so those surfaces cannot drift.
- Edit public copy through anti-slop-writing, humanizer and stop-slop in that order. Preserve technical terms, source meaning and honest uncertainty; never invent incidents, metrics, dates or platform behavior to make a lesson sound specific.
- Preserve prerender/hydration parity. Do not hide initial content behind JavaScript or entrance animations. Follow prefers-reduced-motion and use CSS for lightweight motion.
- Canonical, sitemap, OG identity and analytics belong to datasketch.caesarmar.io, never the root portfolio. Author/social links may point to caesarmar.io.
- Never copy credentials, .env files, Supabase or resume flows from the portfolio.
- Keep preview noindex and actual unknown-path 404. Social links use fixed absolute portfolio handoff URLs.
- No push/deploy/DNS changes without explicit user approval. Portfolio cutover must wait for verified subdomain production.
- Run typecheck, lint, build, tests and seo:check. Report blocked browser QA accurately; HTTP status is not a visual or end-to-end test.
- Update todo/list.todo with verified results and remaining release gates. Never edit list_backup.todo in the portfolio.
