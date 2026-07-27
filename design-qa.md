# Design QA — Today cycle history and dynamics

- Source visual truth:
  - `/Users/iskander/Desktop/IMG_0181.PNG`
  - `/Users/iskander/Desktop/IMG_0182.PNG`
- Implementation:
  - `http://127.0.0.1:3002/today?demo=1`
  - `/private/tmp/mira-health-check-entry/design-qa-history-final.png`
  - `/private/tmp/mira-health-check-entry/design-qa-dynamics-final.png`
- Comparison boards:
  - `/private/tmp/mira-health-check-entry/design-qa-history-comparison-final.png`
  - `/private/tmp/mira-health-check-entry/design-qa-dynamics-comparison-final.png`
- Viewport: implementation `684 × 969` CSS px, device scale factor 1.
- Source pixels: `1206 × 2622`; the relevant regions were cropped and normalized to a width of 684 px before comparison.
- State: demo profile with one current and three completed cycles. The source and implementation use different cycle values, but the same populated history and dynamics states.

## Full-view comparison evidence

- The implementation keeps the source hierarchy: white rounded history card, header action, three cycle rows, compact day markers, followed by a separate dynamics card.
- The graph preserves the source structure: subdued grid, personal range band, connected cycle points, one highlighted differing point, explanatory copy, and a rounded gradient action.
- The implementation intentionally uses Mira typography, navigation, colors, and real routes instead of copying Flo branding or the Premium paywall.

## Focused comparison evidence

- History: row density, title/date hierarchy, chevrons, separators, and dot rhythm were checked on the combined history board.
- Dynamics: chart height, range band, line contrast, point emphasis, explanatory copy, and action placement were checked on the combined dynamics board.
- No source image asset was required. The red floating media panel in the references is a phone/system overlay and was correctly excluded.

## Comparison history

### Pass 1 — blocked

- P2: history rows were visibly denser than the reference.
- P2: the graph was too shallow, weakening the visual hierarchy.

Fixes:

- Increased history header and row height, type sizes, vertical padding, and marker size.
- Increased the chart viewBox height and vertical plotting range.

### Pass 2 — passed

- Revised browser captures show the history rows and chart now have the intended vertical rhythm.
- No remaining P0, P1, or P2 visual mismatch was found.

## Required fidelity surfaces

- Typography: Mira’s existing Onest/Manrope hierarchy is retained; weights and wrapping remain readable.
- Spacing: card radii, separators, padding, row height, and chart proportions align with the selected reference.
- Colors: neutral white/grey surfaces, pink period markers, teal current-day marker, and orange attention state remain consistent with Mira.
- Image quality: no image assets are part of these components; the source’s unrelated media overlay was excluded.
- Copy: medical language is deliberately safer than the source. “Отличается” compares with the user’s own three previous cycles and explicitly states that it is not a medical assessment.

## Interaction and console checks

- History header and rows route to the existing cycle analytics pages.
- Dynamics action routes to `/analytics/cycles`.
- Empty and insufficient-data states are implemented.
- Browser console was checked. One pre-existing development-only hydration warning comes from Telegram viewport styles on the root element; no error from the new components was observed.

final result: passed
