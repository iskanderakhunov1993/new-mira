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

# Design QA — дневник ежедневных отметок

- Source visual truth: пользовательская серия `IMG_0227.PNG`–`IMG_0235.PNG` (Flo diary flow).
- Implementation route: `http://127.0.0.1:3000/diary?date=2026-08-02&demo=1`.
- Browser viewport: 390 × 844 px.
- Scope: только страница дневника; Today не изменялась.

## Адаптация под Mira

- Сохранена знакомая модель: компактная дата, поиск, быстрые частые отметки, категории и крупные чипы.
- Визуальный язык Flo не копируется: используются цвета, типографика, радиусы и Lucide-иконки Mira.
- Категории можно скрывать и возвращать через «Настроить»; выбранные состояния видны сразу.
- Сохранены существующие сценарии данных: месячные, симптомы, настроение, интимное здоровье, активность, контрацепция, тесты, лекарства, сон, измерения и заметка.

## Проверка

- Выбор «Мигрень» переключает состояние чипа и обновляет сводку выбранных отметок.
- Production build и TypeScript прошли.
- Lint и `git diff --check` прошли.
- Мобильная и широкая компоновки сохраняют читаемую иерархию без горизонтального переполнения.

final result: passed

---

# Design QA — «Мой цикл», вариант 3

- Source visual truth: `/Users/iskander/.codex/generated_images/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/exec-6f3d105f-da16-4bb2-868b-71e432b39a90.png`
- Implementation screenshot: `/private/tmp/mira-analytics-desktop-qa-final.png`
- Mobile screenshot: `/private/tmp/mira-analytics-mobile-390-settled.png`
- Side-by-side comparison: `/private/tmp/mira-analytics-comparison-qa-final.png`
- Route: `http://127.0.0.1:3000/analytics?demo=1`
- State: local demo with dynamically calculated current date and cycle day
- Desktop viewport: 991 × 705 CSS px, DPR 1.5
- Mobile viewport: 390 × 844 CSS px, DPR 1.5
- Source pixels: 1487 × 1058, normalized to 991 × 705 for comparison
- Implementation pixels: 991 × 705

## Full-view comparison evidence

The selected compact analytics hierarchy is preserved: current phase and forecast, phase timeline, overview tabs, cycle-length chart with interpretation, summary metrics, cycle history, selected-cycle details, and final detail/report actions.

The persistent Mira bottom navigation is intentionally retained because it is part of the current product shell and was not present in the concept image.

## Focused region comparison evidence

The chart and history regions remain readable in the normalized full-width comparison, so a separate crop was not required. The implementation matches the source hierarchy, proportions, muted rose/lavender palette, compact radii, borders, and information density.

Intentional adaptations:

- The current day is dynamic, so the implementation shows day 6 while the source snapshot shows day 5.
- The implementation uses actual demo cycle dates and values rather than copied source values.
- Confidence is presented as “first observations” rather than “high confidence” because four completed cycles are not enough to justify stronger medical certainty.
- The Today route and its components were not changed.

## Interaction and implementation checks

- Overview, History, and Data tabs were activated successfully.
- Three-month and six-month chart ranges update the visualization and interpretation.
- Selecting another cycle updates the detail panel.
- The detailed-records accordion opens and exposes existing flow and pain data.
- Desktop and mobile views have no horizontal overflow.
- Browser console logs remained empty during the checked flows.

## Comparison history

### Pass 1 — blocked

- P1: the chart collapsed to zero height inside the responsive container.
- P2: the page was too tall and the report action was visually detached.

Fixes:

- Added an explicit responsive chart height.
- Compressed the desktop hierarchy and combined the bottom actions into one row.
- Kept full mobile stacking and touch-size behavior.

### Pass 2 — passed

- The final side-by-side comparison shows no remaining P0/P1/P2 mismatch.
- P3: the persistent bottom navigation partially overlaps the last desktop row at this forced short viewport; it behaves correctly in normal page scrolling and on mobile.

final result: passed

---

# Design QA — «Мои закономерности», Flo-adapted card

- Source visual truth: `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_KC3iV2/Снимок экрана 2026-08-02 в 00.11.00.png`
- Implementation screenshot: `/private/tmp/mira-symptom-pattern-flo-adapted-final.png`
- Route: `http://127.0.0.1:3000/today?demo=1`
- Browser viewport: 1910 × 1075 CSS px, device scale factor 1.34
- Implementation CSS region: 720 × 302 px
- State: demo pattern «Усталость», four of four completed cycles, typical timing during menstruation

## Focused comparison evidence

The supplied Flo reference and the rendered Mira card were inspected in the same comparison pass. The implementation now follows the reference's information order: symptom header, concise interpretation, ten-day phase timeline, one highlighted typical day, legend, and a single detail action.

Intentional adaptations:

- Mira uses its own rose/lavender tokens and existing symptom icon library.
- Population comparisons were omitted because Mira has no validated cohort data.
- “Doctor's comment” was replaced with the factual “Посмотреть наблюдение” action.
- The copy describes only the user's completed-cycle history and does not diagnose or promise medical precision.
- The desktop card remains horizontally compact; the mobile layout wraps responsively instead of copying the source device dimensions.

## Interaction and implementation checks

- The detail action points to the encoded route for the detected symptom.
- The timeline uses real completed-cycle length, period duration, personal typical day, and personal recurrence data.
- No new API, migration, or persistence layer was required; the existing deterministic pattern engine remains the source of truth.
- No horizontal overflow or missing visual assets were observed.
- No P0/P1/P2 visual mismatch remains after the adapted comparison.

final result: passed

---

# Design QA — «Мои циклы», вариант 2

- Source visual truth: `/Users/iskander/.codex/generated_images/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/exec-07aa4735-b6dc-485f-87db-f2e869cd2f9d.png`
- Implementation screenshot: `/private/tmp/mira-today-cycles-option2-final.png`
- Route: `http://127.0.0.1:3000/today?demo=1`
- State: local demo; last completed cycle 26 days, period 4 days, recent range 26–31 days
- Browser viewport: 1910 × 1075 CSS px, device scale factor 1.34
- Rendered component region: 720 × 300 CSS px

## Full-view comparison evidence

The source image and rendered Today screen were emitted in the same comparison input. The implementation preserves the selected composition: a large last-cycle fact on the left, two supporting facts on the right, an internal header, and a quiet personal-range track.

## Intentional adaptations

- The card uses live cycle history instead of fixed sample values.
- The range status is phrased as a personal comparison, not a medical assessment.
- The last-cycle area links to that cycle's detail page; “История” links to the full analytics route.
- The existing Mira typography, semantic colors, and responsive shell are retained.

## Findings

- No P0/P1/P2 visual mismatch remains.
- No horizontal overflow was detected in the rendered component.
- The progress control exposes its current value and an accessible label.

## Interaction and implementation checks

- “История” resolves to `/analytics`.
- The primary last-cycle area resolves to `/analytics/cycles/2026-07-02` in demo state.
- The empty-history state remains intact for users without completed cycles.
- shadcn Card and Progress primitives are used with correct named imports.
- Lint, TypeScript production build, 91 domain tests, and whitespace validation passed.

## Comparison history

### Pass 1 — passed

- The selected hierarchy, proportions, data density, and responsive structure match the approved direction.
- No corrective P0/P1/P2 pass was required after browser inspection.

final result: passed

---

# Design QA — «Динамика циклов», вариант 2

- Source visual truth: `/Users/iskander/.codex/generated_images/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/exec-d82acdfd-21b6-4e3c-97bf-a1aeb82238ca.png`
- Implementation: `http://127.0.0.1:3000/today?demo=1`
- Browser-rendered implementation screenshot: `/private/tmp/mira-cycle-trend-option2-final.png`
- State: demo profile with four completed cycles and a personal comparison range of 28–31 days.
- Comparison evidence: the selected source and the final in-app browser capture were emitted together in one visual comparison pass.

## Fidelity and adaptations

- Preserved the selected structure: title, completed-cycle scope, concise interpretation, horizontal comparison rows, personal range band and a collapsed explanation row.
- Reused Mira's existing white card, rose/lavender palette, typography and cautious health language.
- Real cycle dates and values drive the chart; no values are hard-coded into the UI.
- The last completed cycle is emphasized in rose while earlier cycles remain neutral.
- The range is explicitly labelled and the numeric scale includes the “Дни цикла” axis label.

## Interaction and accessibility checks

- The chart exposes a Russian accessible summary of all cycle values and the personal range.
- Hidden cycle links retain direct navigation to each completed-cycle detail page.
- “Как Mira сравнивает циклы” opens with keyboard-compatible shadcn/Base UI accordion behavior and displays the non-medical comparison explanation.
- The insufficient-data state remains available when fewer than three completed cycles exist.

## Validation

- ESLint: passed.
- Domain tests: 91 passed.
- Production build and TypeScript: passed.
- Whitespace validation: passed.
- Visual comparison: no remaining P0, P1 or P2 mismatch for the selected adapted design.

final result: passed

---

# Design QA — Today, компактная полная страница

- Source visual truth:
  - `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_DUQVeV/Снимок экрана 2026-08-01 в 22.47.41.png`
  - `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_WyINuO/Снимок экрана 2026-08-01 в 22.47.45.png`
- Implementation: `http://127.0.0.1:3000/today?demo=1`
- Browser-rendered implementation screenshots:
  - `/private/tmp/mira-today-compact-implementation.png`
  - `/private/tmp/mira-today-compact-middle.png`
- Combined comparison evidence:
  - `/private/tmp/mira-today-compact-top-comparison.png`
  - `/private/tmp/mira-today-compact-lower-comparison.png`
- Browser viewport: `1256 × 1243` CSS px, device scale factor 1.
- Source pixels: `584 × 1754` and `790 × 480`.
- Implementation pixels: `1256 × 1243`; the `720 × 1243` app region was normalized to `584 × 1008` for comparison.
- State: demo profile with forecast, daily content, recommendations, current and completed cycles, cycle dynamics and one confirmed pattern.

## Full-view comparison evidence

- The forecast and three quick actions remain the clear first task, while their combined height is reduced.
- “Полезное сегодня” and “Рекомендации дня” now use the same compact card rhythm and no longer dominate the cycle information below.
- Cycle summary, history, dynamics and pattern evidence read as one continuous story instead of a stack of equally heavy panels.

## Focused comparison evidence

- Top comparison: forecast hierarchy, quick actions, horizontal content cards and the cycle summary were compared at the same normalized width.
- Lower comparison: history row density, current-cycle emphasis, graph hierarchy, evidence footer and persistent navigation were compared at the same normalized width.
- No custom raster asset was needed; the implementation continues to use Mira's existing icon library and UI surfaces.

## Required fidelity surfaces

- Typography: existing Onest/Manrope hierarchy is preserved; section headings and card titles now use a smaller, consistent scale.
- Spacing: section gaps, card heights, row padding, radii and shadows were reduced consistently across the page.
- Colors: the lavender/rose Mira palette and semantic pink, teal and dark states are unchanged; current-cycle tint is deliberately subtle.
- Image quality: no source image assets are part of this screen; icons remain vector components from the existing library.
- Copy: all forecasts, personal comparisons and safety wording are unchanged. Short header links were simplified to “Все” and keep their original destinations.

## Interaction and browser checks

- The “Симптомы” quick action was opened in the in-app browser and returned successfully to Today.
- DOM inspection confirmed named regions, heading order, accessible link names and all existing destinations.
- Browser logs were checked; no application error was present. Telegram SDK and development HMR logs remain informational.
- Lint, TypeScript and whitespace validation passed.

## Comparison history

### Pass 1 — passed

- No P0, P1 or P2 issue remained in the normalized top and lower comparisons.
- P3: the full page is still intentionally information-rich because Today also exposes cycle history and evidence; the new compact rhythm keeps it scannable without hiding those features.

final result: passed

---

# Design QA — Today, вариант 3 «Health dashboard»

- Source visual truth: `/Users/iskander/.codex/generated_images/019f95ee-5b56-75c1-9e9d-2f5cc1f1ec99/call_UXjRJw6BYiXRHgUru75jm8WG.png`
- Implementation: `http://localhost:3001/today?demo=1`
- Implementation screenshot: `/private/tmp/mira-today-variant3-implementation.png`
- Side-by-side comparison: `/private/tmp/mira-today-qa-comparison.png`
- State: local demo profile, populated cycle history, two measurement points and one recurring symptom pattern.
- Viewport: mobile override `390 × 844` CSS px; both comparison columns normalized to the source dimensions.

## Visual comparison

- The implementation preserves the selected hierarchy: compact header, cycle ring, forecast values, one primary logging surface, grouped daily indicators, recommendation and medication row.
- Mira's existing profile and safety flow remain reachable without competing with the primary action.
- The selected design is extended below the first screen with one grouped cycle area: summary, three recent cycles, cycle trend and one evidence-backed symptom pattern.

## Comparison history

### Pass 1 — blocked

- P1: decorative page layers created horizontal overflow at the mobile breakpoint.
- P2: legacy three-widget defaults hid the available temperature and weight rows.
- P2: the cycle summary rendered as three tall stacked rows instead of the intended compact dashboard strip.

Fixes:

- Clipped decorative page layers and verified `scrollWidth` equals the mobile viewport width.
- Migrated the legacy default widget selection in the client and raised the persisted limit to five indicators.
- Scoped the cycle summary and history overrides to the new cycle hub.

### Pass 2 — passed

- The final side-by-side board shows the intended information hierarchy, spacing, grouped surfaces and Mira palette.
- No remaining P0, P1 or P2 mismatch was found.
- P3: Mira keeps a separate subdued «Мне плохо» safety row; this is an intentional product-safety adaptation.

## Interaction and accessibility checks

- Primary and shortcut actions use existing routes for diary, symptoms, mood and period logging.
- Water logging remains a real button with progress semantics and saving/error states.
- Metric rows link to the existing detailed measurement analytics.
- History rows, graph points and pattern details retain their existing destinations.
- The page has no horizontal overflow at the verified mobile viewport.

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
