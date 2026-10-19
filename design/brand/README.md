# Approved Data Sketch brand sources

The user supplied the original PNGs on 2026-10-19:

- `favicon-source.png`: Artboard 1.png, 1000 x 1000.
- `og-image-source.png`: og-image.png, 1200 x 630.

The sources are copied byte-for-byte. Do not reconstruct them from screenshots
or overwrite them with the legacy `design/og-image.svg` design.

`scripts/generate-brand-assets.mjs` regenerates committed derivatives with Sharp
in the offline tooling environment. It accepts `--logo` and `--og` source paths;
without arguments it uses these committed PNGs. If Sharp lives in the existing
Codex workspace bundle, point NODE_PATH to that bundle's node_modules directory.
The application build and CI tests do not require Sharp.

Favicon processing preserves the source alpha, finds all visible artwork bounds,
then fits that artwork inside a 512 px master with 20 px transparent outer
padding. No artwork is stretched, redrawn or cropped, and no opaque background
is added. Antialiased edge pixels retain partial transparency.
The current bounds are left 157, top 277, width 685, height 446. Transparent black
pixels in the source remain transparent. An earlier conversion flattened alpha
onto white; the 2026-10-19 transparency hotfix removes that behavior for the
master, every PNG size, Apple icon, and every ICO frame.
Each output size is sampled from the original cropped artwork, with transparent
padding added after resizing so the final border stays at alpha zero.

The ICO directory contains actual 16, 32 and 48 px PNG frames. Separate PNGs
are 16, 32 and 96 px; the Apple touch icon is 180 px. The old public/favicon.svg
remains available as an unadvertised legacy file, not the active identity.

OG output fits the source inside 1200 x 630 without crop/stretch and uses lossless
PNG encoding. For the current source, decoded RGBA bytes are identical before
and after optimization. The optimized output is 77787 bytes versus 93310 source
bytes. Gallery metadata uses this image; lesson metadata uses the episode diagram.

`manifest.json` records source SHA-256 hashes, dimensions, the favicon crop and
ICO sizes, plus the optimized OG hash and decoded pixel hash. No generated
timestamps are embedded, so rebuilding the assets is deterministic.
