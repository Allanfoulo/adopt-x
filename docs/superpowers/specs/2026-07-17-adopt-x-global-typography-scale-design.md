# Adopt X Global Typography Scale Design

## Summary

This change applies a smaller typography scale across the main Adopt X application while explicitly leaving the sidebar unchanged. The goal is to make the product surfaces feel denser, calmer, and more operational, using the updated `Candidate Detail` page as the reference direction for the rest of the app.

## Goals

- Reduce the overall typography scale across the app's main content surfaces.
- Preserve the existing information hierarchy while stepping most text sizes down by roughly one visual notch.
- Leave the sidebar exactly as it is today.
- Keep primary actions prominent through color, weight, and contrast rather than oversized text.
- Maintain readability on laptop screens and standard desktop monitors.

## Non-Goals

- No sidebar typography changes.
- No navigation or route-structure changes.
- No redesign of spacing or layout unless smaller type makes a specific surface feel obviously too loose.
- No new design-token system or typography abstraction in this pass.

## Approved Approach

Apply the smaller scale by updating shared shell typography for non-sidebar surfaces and then tuning route-level hardcoded sizes on the major pages:

- `src/components/app-shell.tsx`
- `src/routes/index.tsx`
- `src/routes/triage.tsx`
- `src/routes/briefs.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/settings.tsx`
- `src/routes/candidate.tsx`

This is a practical global shift, not a token-first refactor.

## Scope

Apply the smaller scale to:

- Page titles in the main content header
- Page subtitles in the main content header
- Toolbar buttons and shared action controls
- Panel titles and panel action text
- Card labels and metric labels
- Tables, row values, and column headers
- Form fields, helper text, inline notes, and operational metadata
- Chips, compact badges, and audit rows
- Route-level headings and dense content blocks

Do not apply the shift to:

- Sidebar logo/title text
- Sidebar navigation items
- Sidebar quick filters
- Sidebar analyst card and system status text

## Typography Direction

### Hierarchy Rules

- Keep the current hierarchy relationships intact.
- Lower the absolute scale of most text by one step.
- Reserve the largest type only for page titles and the most important hero values.
- Reduce overuse of `13px` to `12px` where dense operational content benefits from compaction.
- Reduce `12px` helper and metadata text to approximately `11px` where still readable.
- Reduce `10.5px` microcopy and mono labels to approximately `10px` or `9.5px` where appropriate.

### Product Register Constraints

- This is a product UI pass, not a brand-expression pass.
- Favor operational density, predictability, and clarity over visual drama.
- The app should feel more like a serious analyst console and less like a roomy design mockup.

## Shared Component Changes

### `src/components/app-shell.tsx`

Apply the scale shift only to the non-sidebar portions:

- Main header title
- Main header subtitle
- Search input text
- Keyboard shortcut hint
- Toolbar buttons
- Primary button text
- Shared status-badge sizing if needed for consistency
- Panel header title and panel header action text
- State strip text if it visually overpowers surrounding pages

Explicit exclusion:

- Do not alter the sidebar section of this file

## Route Changes

### `src/routes/index.tsx`

- Reduce the run context strip labels and values slightly
- Compress metric cards and recent activity table text
- Reduce audit-trail and attention-row typography

### `src/routes/triage.tsx`

- Reduce filter labels and select/input text
- Reduce queue table headers and row text
- Reduce right-rail operational and audit text
- Reduce metric-chip sizes where they feel oversized

### `src/routes/briefs.tsx`

- Reduce archive filter labels and table text
- Reduce brief-preview section headings and body size slightly
- Reduce metric cards and revision-history microcopy

### `src/routes/dashboard.tsx`

- Reduce KPI labels and large metric companions while keeping KPI values clearly dominant
- Reduce chart panel headings, legends, footers, and right-rail metadata
- Reduce audit and queue-health supporting text

### `src/routes/settings.tsx`

- Reduce settings panel headings and helper copy
- Reduce form labels, toggle rows, source rows, and badges
- Keep the settings page readable, not cramped

### `src/routes/candidate.tsx`

- Use the current smaller candidate-detail scale as the reference baseline
- Only adjust further if shared changes create inconsistency

## Spacing Policy

- Do not begin with a broad spacing rewrite.
- If smaller text makes a component feel too airy, tighten that component locally.
- Prefer small spacing trims near headers, table rows, and helper copy rather than sweeping padding changes.

## Error Handling

- Avoid shrinking text so far that compact badges, form controls, or audit rows become hard to scan.
- Preserve truncation behavior in dense rows and table cells.
- If a component becomes visually weak after the type reduction, restore emphasis using weight or contrast before increasing size again.

## Testing

- Verify the sidebar remains unchanged.
- Verify the shared header and toolbar scale down outside the sidebar only.
- Verify all six routes still feel visually related after the shift.
- Verify dense tables remain legible.
- Verify primary actions are still clearly dominant.
- Verify small helper text remains readable on laptop-scale viewports.
- Verify the app still builds successfully.

## Recommendation

Implement this as a focused global content-surface pass, centered on shared non-sidebar shell typography and route-level hardcoded sizes. Do not introduce a token-system refactor in this step. The fastest correct move is a controlled reduction of existing size utilities across the major pages, with the sidebar explicitly excluded.
