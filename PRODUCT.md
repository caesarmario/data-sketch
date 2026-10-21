# Data Sketch

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Beginners learning SQL and data engineering, and practitioners applying those
ideas at work. The owner confirmed equal priority for both audiences.

## Product Purpose

Mario Caesar publishes diagrams with worked examples and short explanations.
The gallery is the reading destination. The newsletter lets readers receive two
emails a month after confirming their subscription.

## Capabilities and Constraints

- Nine published lessons; episodes 10–11 remain asset-free teasers.
- One signup page at `/newsletter`, using the owner's official beehiiv form.
- Beehiiv controls consent, double opt-in, delivery, and unsubscribe. Its
  cross-origin form settings require the owner's form builder access.
- Public copy is English. Preserve prerendered content and a no-JavaScript
  signup fallback; keyboard navigation and mobile use must remain practical.
- Development stays on `codex/datasketch-newsletter`. Production release needs
  a separate owner instruction.

## Brand Commitments

Preserve the owner's existing dark/green identity, uncropped Data Sketch logo,
and local Space Grotesk / IBM Plex Sans fonts. Do not change the site's theme.
Keep the wording direct, personal, and grounded in the published lessons.

## Evidence on Hand

The published lessons and their diagrams live in `src/data/sketches.ts` and
`public/images/data-sketch/`. Use these works as examples; do not invent subscriber counts,
testimonials, results, or other social proof.
