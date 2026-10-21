# Compact beehiiv form settings

Website work prepared on 22 October 2026 (Asia/Jakarta). These are the exact
remaining **manual beehiiv builder changes**, not changes already applied to the
account. The website cannot style or label a cross-origin iframe's contents.

Open the existing **Data Sketch – Website Newsletter** form, ID
`ab182b1c-934e-4199-8b97-a37031a05ced`. Edit this form in place; keep its existing
embed code and ID. Do not create another publication or form.

## Content

| Control | Value |
| --- | --- |
| Header → Title | Off |
| Header → Subtitle | Off |
| Fields | Email only |
| Email label | Email address, if the native label control is available |
| Email placeholder | Email address |
| Button text | Subscribe |
| While submitting | Subscribing… |
| Require consent checkbox | On; unchecked by default |
| Use custom consent text | On |
| Consent | I agree to receive Data Sketch by email. I can unsubscribe at any time. |
| Privacy policy link | `https://datasketch.caesarmar.io/privacy` |

Beehiiv may disable the label toggle for single-field forms. If it is locked,
retain the email-only form and use **Email address** as the placeholder. This is
a vendor accessibility limitation; a label outside the iframe cannot associate
with that input. Do not add an unnecessary field to unlock labels.

## Style

| Control | Value |
| --- | --- |
| Embed layout | Regular Inline |
| Background → Transparent | On |
| Background → Padding | 0 on all sides |
| Background → Border thickness | 0 |
| Background → Shadow | None |
| Background → Width | Fill / responsive, not a fixed pixel width |
| Background → Height | Auto / Fit |
| Background → Gap | 16 |
| Form → Direction | Horizontal: email then button |
| Form → Width | Fill / responsive |
| Form → Padding / Gap | 0 / 0 |
| Form → Corner radius | 8 |
| Fields / Button / Terms font | IBM Plex Sans |
| Fields / Button font size | 16 |
| Button weight | Semi Bold (600) |
| Input background / text | `#FFFFFF` / `#0A0A0A` |
| Placeholder | `#6B7280` |
| Button background / text | `#00E677` / `#0A0A0A` |
| Terms text | `#E5E7EB`, 14 px, left aligned |
| Checkbox accent / background | `#00E677` / `#FFFFFF` |

Keep the field and button together in one row on mobile; the email must shrink
within the available width. Check the builder's phone preview and the actual
embed at 320 and 375 px before saving. If the builder cannot support this
responsively, report that limitation rather than publishing an overflowing form.

**Height:** target an actual rendered input/button height of 44–48 px. The
builder's “Field and button height” value is not a direct CSS pixel measurement:
the previously published value **21** rendered at about **45 px**. Start with
that working value and measure the preview; do not enter 48 blindly.

## Settings and publish

- Select **Show a success message**:
  **Check your inbox to confirm your subscription.**
- Set **Require double opt-in** to **On** on this form, regardless of the
  publication default. Keep the existing confirmation email and welcome flow.
- Save/publish the form changes. Reuse the existing loader embed on `/newsletter`.
- Check the public website after the vendor settings propagate: no duplicate
  heading, no charcoal panel, no large outer padding, required unchecked consent,
  readable placeholder, and input/button visible within the first 375×844 viewport.

The official form owns validation, submitting, pending-confirmation and success
states. The website supplies loading feedback, a timed failure state, Privacy,
and a direct hosted-form fallback for blocked scripts or JavaScript-disabled use.

## Delivery check after release

Use an owner-controlled address to check confirmation, subscriber status, welcome
delivery, reply-to and unsubscribe. No address was submitted during code QA.
The website redesign alone does not verify these email behaviors. Production
release still requires a separate owner instruction.
