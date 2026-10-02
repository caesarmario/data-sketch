# Data Sketch migration runbook

## Release gates (not executed automatically)

1. Review `codex/data-sketch-launch` in the data-sketch repo. Keep the existing portfolio deployment unchanged.
2. Run all local checks, approve the visual preview at 320/375/768/1024/1440 px, and verify both sort controls with mouse and keyboard. Inspect browser console for hydration warnings, test failed image rendering and reduced motion.
3. Push/merge the new repo only after explicit approval. Create its own Netlify site and test a noindex Deploy Preview, including the gallery, all four lesson routes, their clean-path aliases, refresh, unknown path HTTP 404, `404.html`, all four images, text files, fonts and social links.
4. Configure only `datasketch.caesarmar.io` DNS to the new site's Netlify target. Do not change root-domain records, mail/MX records, or the portfolio hosting. Use the target Netlify actually supplies; do not guess it. Verify certificate issuance and HTTPS before launch (the root domain already uses HSTS including subdomains).
5. Merge/deploy the Data Sketch production branch and verify canonical, indexing-enabled robots metadata, route-specific OG images, image dimensions, fallback links and page content without JavaScript. Add its dedicated Cloudflare beacon token when available; verify the request and separate dashboard.
6. Only after step 5 passes, review and deploy `codex/data-sketch-cutover` from the portfolio. Do not combine these deployments or merge the portfolio branch early.
7. Confirm HTTP 301 on the four old page addresses and the four exact image paths. Confirm destination 200, image Content-Type, no loops, and query parameters cannot change the destination. Do not use broad redirects for all portfolio routes.
8. Smoke-test portfolio `/`, `/projects`, `/certifications`, `/mentoring-speaking`, social handoffs, public resume modal and authorized secure resume flow. Typecheck/build alone are not end-to-end proof.
9. Submit the new sitemap in Search Console and resubmit the updated portfolio sitemap. This is a section move, not a whole-domain move: do not request a domain-wide Change of Address.
10. Monitor both sites for 14 days after the actual cutover: missing assets, unexpected 404/5xx, redirects, indexing, LCP/INP/CLS with sample counts. Retain exact permanent redirects for at least one year after cutover. No reminder/automation is installed by the code change.

## Exact mapping

`/data-sketch`, `/data-sketch/`, `/data-sketch.html`, `/data-sketch/index.html` on caesarmar.io -> `https://datasketch.caesarmar.io/`.

`/images/data-sketch/data-sketch-episode-01.jpg` through `04.jpg` on caesarmar.io -> the same path on datasketch.caesarmar.io. Never redirect images to HTML. Assets were copied byte-for-byte before deletion from the cutover branch.

The user's latest decision explicitly replaces the previous legacy-404 plan with permanent 301 redirects. Old gallery runtime and asset files are removed only in the cutover branch, not in the currently deployed main branch.

## Rollback

Keep the last known-good portfolio deploy available (source baseline: `93f1645`). If cutover fails, restore that deploy to serve the original gallery and remove broken redirects. Restore the prior Data Sketch deploy separately when appropriate. A cached 301 may persist in clients, so keep the subdomain available during rollback. Do not reset Git history or modify unrelated routes to recover.

## Versions

Data Sketch remains at 1.0.0 with build marker v2026.10.02 for this launch batch. The portfolio UX and SEO work is prepared separately as 1.8.0 / v1.8.0, while the Data Sketch cutover remains isolated and still requires explicit release approval. Version markers are configured release identifiers, not per-build counters.
