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

---

# Design QA — «Динамика циклов»

- Source visual truth: `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_OWrECO/Снимок экрана 2026-07-29 в 22.56.57.png`
- Implementation screenshot: `/private/tmp/mira-cycle-trend-implementation-final.png`
- Side-by-side comparison: `/private/tmp/mira-cycle-trend-comparison-final.png`
- Routes: `http://localhost:3004/today?demo=1`, `http://localhost:3004/analytics?demo=1`
- State: local demo with four completed cycles
- Browser viewport: 1600 × 900 CSS px, device scale factor 1
- Source pixels: 914 × 598 px
- Implementation CSS region: 680 × 568 px
- Density normalization: implementation crop normalized to 914 × 763 px; source retained at 914 × 598 px on a shared comparison canvas

## Full-view comparison evidence

The component appears after cycle history on Today and in the detailed My Cycle flow. Both routes render the same shared component, eliminating the previous visual and logical drift.

## Focused region comparison evidence

The comparison board places the supplied source on the left and the rendered Mira component on the right. Both show a short interpretation, a light smooth line, exact values above points, subtle right-side scale labels, and dates below the graph.

Intentional adaptations:

- Mira uses the user's actual four completed demo cycles rather than inventing six values.
- “Отличался по длине” replaces a medical-sounding short/long label.
- A personal recent range and its basis are shown below the graph.
- Current incomplete cycles are excluded.

## Findings

- No P0/P1/P2 mismatch remains.
- P3: Mira's card includes an evidence footer, making it slightly taller than the source; this is intentional for transparency.

## Required fidelity surfaces

- Typography: the source hierarchy is preserved using Mira's Onest/Manrope system.
- Spacing: title, interpretation, plot, axis labels, and footer use the same airy vertical rhythm as the reference.
- Colors: the source's muted grey line and dark points are retained, with one rose attention point from Mira's semantic palette.
- Image quality: the graph is rendered as responsive vector UI; no source raster asset was required.
- Copy: all conclusions describe personal recorded history and avoid diagnosis or false medical precision.

## Interaction and implementation checks

- The populated component renders on Today and My Cycle.
- The insufficient-data state remains available below three completed cycles.
- Lint, 75 domain tests, production build, and whitespace validation passed.
- No broken or missing assets were observed in the browser-rendered component.

## Comparison history

### Pass 1 — blocked

- P1: Today and My Cycle used different chart implementations.
- P2: values and dates were not presented like the source.
- P2: the previous line was angular and visually heavier.

Fixes:

- Replaced both implementations with one shared component.
- Added exact values, dates, subtle axis labels, and a human-readable interpretation.
- Replaced the polyline with a smooth curve that does not overshoot recorded values.

### Pass 2 — passed

- The focused side-by-side comparison shows the requested visual structure and no remaining P0/P1/P2 mismatch.

final result: passed

---

# Design QA — «Мои закономерности»

- Source visual truth: `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_iBeZPv/Снимок экрана 2026-07-29 в 22.51.32.png`
- Implementation screenshot: `/private/tmp/mira-symptom-pattern-qa/pattern-implementation.png`
- Side-by-side comparison: `/private/tmp/mira-symptom-pattern-qa/pattern-comparison.png`
- Route: `http://localhost:3004/insights?demo=1`
- State: local demo, one detected symptom pattern
- Browser viewport: 2000 × 2571 px full-page capture; focused implementation crop normalized from 760 × 386 px to 592 × 301 px
- Source pixels: 592 × 652 px
- Implementation CSS region: 760 × 385.44 px
- Density normalization: both comparison columns rendered at 592 px width

## Full-view comparison evidence

The feature is placed in the existing Insights hierarchy after the personal cycle fingerprint and current-cycle comparison. It remains secondary to orientation and data coverage, matching Mira's information architecture instead of reproducing Flo's screen order.

## Focused region comparison evidence

The combined comparison uses the supplied reference on the left and the rendered Mira card on the right. Both include a symptom title, explanation, ten-day sequence, highlighted symptom day, phase legend, and a primary detail action.

Intentional adaptations:

- Removed population comparison because Mira has no validated aggregate cohort.
- Replaced “doctor's comment” with a factual personal-observation detail page.
- Added explicit evidence chips for entry count and observed-cycle coverage.
- Applied Mira's rose/lavender palette, type scale, spacing, radii, and icon language.

## Findings

- No P0/P1/P2 mismatch remains for the adapted Mira component.
- P3: the reference uses a character-style symptom illustration; Mira uses the existing minimal outline icon language for consistency with the current product.

## Interaction and implementation checks

- The “Посмотреть наблюдение” control is visible and links to the matching encoded symptom route.
- The link was activated in the in-app browser and opened the symptom detail page.
- No broken or missing assets were observed in the browser render.
- Lint and whitespace validation passed before the final build check.

## Comparison history

### Pass 1

- The previous implementation presented patterns as compact technical cards and did not resemble the selected source.
- Replaced it with a prominent evidence card, phase timeline, symptom marker, legend, and clear action.
- Post-fix comparison shows the selected interaction model while preserving Mira's own design system and safety language.

## Follow-up polish

- Consider a dedicated symptom icon mapping once the UI kit contains clinically neutral icons for common symptoms.

final result: passed
