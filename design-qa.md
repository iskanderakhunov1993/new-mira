# Mira landing — Design QA

- Source visual truth: `/Users/iskander/.codex/generated_images/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/call_thXoRmX5AbqIyHmieeQoZ37A.png`
- Implementation: `http://localhost:3001/`
- Desktop screenshot: `/Users/iskander/.codex/visualizations/2026/07/24/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/mira-landing-v3-qa/implementation-desktop.png`
- Mobile screenshot: `/Users/iskander/.codex/visualizations/2026/07/24/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/mira-landing-v3-qa/implementation-mobile.png`
- Combined hero comparison: `/Users/iskander/.codex/visualizations/2026/07/24/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/mira-landing-v3-qa/design-comparison-hero.png`
- Combined focused comparison: `/Users/iskander/.codex/visualizations/2026/07/24/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/mira-landing-v3-qa/design-comparison-feature.png`
- State: public landing, unauthenticated, light theme.
- Desktop viewport: 1440 × 1000 requested; browser-reported CSS viewport 1800 × 1250 at device scale 0.8. Screenshot 2250 × 1563.
- Mobile viewport: 390 × 844 requested; browser-reported CSS viewport 487 × 1055 at device scale 0.8. Screenshot 609 × 1319.
- Source pixels: 864 × 1821.
- Density normalization: combined comparisons resize implementation evidence to the source width before placing both images in one canvas.

## Findings

- No actionable P0/P1/P2 mismatch remains.
- The selected option’s story structure is preserved: split hero with a daily timeline, trust strip, alternating 01/02/03 sections, and a centered final CTA.
- The visual system intentionally uses Mira UI Kit rather than the mock’s generic palette: Mira Pink `#FBA0E4`, Pink Pressed `#E889D0`, Lavender `#887BB8`, Lavender Soft `#F2EFF9`, Milk `#FAF8F5`, Surface `#FFFFFF`, Graphite `#24222A`, and Muted `#77737E`.
- Typography uses the UI Kit’s Apple-style system stack with Cyrillic fallbacks. Display weight, wrapping, and compact UI labels preserve the reference hierarchy.
- Spacing follows the UI Kit’s 8 pt rhythm. Cards use the documented 20–28 px radii; buttons use 13–15 px radii.
- Icons come from the project’s existing Lucide set at stroke 1.6, matching the UI Kit. No emoji, custom SVG, or placeholder asset is used.
- The pattern matrix and doctor report use semantic table roles and the same pink/lavender data language as the UI Kit.
- Copy remains factual and cautious: Mira does not diagnose or prescribe.
- Desktop and mobile have no horizontal document overflow.
- Primary interactions checked: demo CTA, registration CTA, login link, anchor navigation, privacy/terms links, and report link are present with valid destinations.
- Console review found an existing Telegram SDK hydration warning caused by runtime styles on the root element, plus Telegram 6.0 capability warnings. No landing-specific runtime error was found.

## Comparison history

1. Initial mobile capture showed the display headline too large for narrow Cyrillic wrapping.
   - Fix: reduced the mobile display clamp from `45–62 px` to `42–54 px`.
   - Post-fix evidence: `implementation-mobile.png`; the document remains at `scrollWidth === innerWidth`.
2. Initial full-page capture hid unrevealed sections because the motion observer had not scrolled them into view.
   - Fix: content is now visible by default; motion no longer gates access to sections.
   - Post-fix evidence: `implementation-full.png` and the focused comparison.

## Required fidelity surfaces

- Fonts and typography: passed.
- Spacing and layout rhythm: passed.
- Colors and visual tokens: passed, intentionally mapped to Mira UI Kit.
- Image and icon fidelity: passed; this direction has no raster assets, and all icons use the established library.
- Copy and content: passed.

## Follow-up polish

- P3: a future motion-only pass can add subtle section transitions without hiding content before intersection.

final result: passed
