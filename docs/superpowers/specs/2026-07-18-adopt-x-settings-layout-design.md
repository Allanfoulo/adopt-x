# Adopt X Settings Layout Design

## Summary

This change rebuilds the `Settings` main content pane to match the approved desktop screenshot 1:1 in structure, density, and hierarchy while preserving the app's current responsive behavior on smaller breakpoints. The sidebar remains unchanged. The screenshot's bottom horizontal status strip is explicitly out of scope because the app now uses the shared overlay toast system instead.

## Goals

- Match the approved desktop main-pane composition for the settings route.
- Preserve the current responsive behavior instead of forcing the desktop arrangement onto tablet and mobile layouts.
- Keep the page aligned with the newer overview, triage, and brief archive compositions in density and operational tone.
- Preserve the shared overlay toast system and exclude the screenshot's bottom strip from the route layout.

## Non-Goals

- No changes to the sidebar layout, icons, collapse behavior, or sizing.
- No changes to the global overlay toast system beyond preserving it.
- No backend, schema, or data-model changes.
- No route renames or navigation changes.
- No attempt to reproduce the screenshot's bottom horizontal status strip inside the settings route.

## Approved Approach

Use an exact composition-first rewrite of `src/routes/settings.tsx`. The route should be rebuilt around the screenshot's desktop structure rather than incrementally restyling the current settings page. Responsive behavior should remain adaptive below desktop, with stacking and overflow containment where needed.

## Desktop Layout Structure

### Shared Page Header

- Keep the route title as `Settings`.
- Keep the subtitle aligned to the screenshot's governance and configuration framing.
- Replace the current right-side text action with the screenshot's compact saved-state banner inside the main pane header area.

The banner should read as a status confirmation tile rather than a global toast.

### Main Desktop Grid

Use a three-column desktop workspace:

- Left column: source and provenance controls
- Center column: cadence, enrichment, and runtime controls
- Right column: review governance and permissions

Desktop grouping:

- Left column:
1. `Source Toggles`
2. `Provenance & Quality Rules`

- Center column:
1. `Scan Cadence Controls`
2. `Enrichment Controls`
3. `Runtime Config`

- Right column:
1. `Human Review Gate`
2. `Permissions`

## Header Saved-State Banner

Render a compact success-status panel in the top-right of the main pane.

It contains:

- success icon
- `Settings saved` title
- short descriptive subcopy
- dismiss icon affordance

This banner is part of the page composition and should visually match the screenshot's desktop placement.

## Left Column Details

### Source Toggles

Render a dense source-management panel with two grouped sections:

1. `Structured Public Sources (enabled by default)`
2. `Secondary & Community Sources (optional)`

Each section includes:

- left-aligned section label
- right-aligned enabled count
- dense toggle rows with:
- source name
- source description
- compact category badge (`Structured` or `Community`)
- right-side toggle

Additional behavior:

- structured group appears mostly enabled
- community group appears mostly disabled
- include the small availability note at the bottom of the panel

### Provenance & Quality Rules

Render a compact governance panel with dense rows:

- `Require source URL` toggle
- `Minimum source confidence` select
- `Publisher reputation floor` select
- `Detect conflicting info` toggle
- `Duplicate content check` toggle

Include the small explanatory footer note shown in the screenshot.

## Center Column Details

### Scan Cadence Controls

Render a compact form-style panel with dense label/value rows:

- `Scan cadence` select
- `Next scheduled scan` value row
- `Last scan run` value row with status chip
- `Timezone` select

This replaces the current selectable cadence cards with the screenshot's denser administrative control layout.

### Enrichment Controls

Render dense rows for:

- `Dedupe similarity threshold` select
- `Scoring threshold for Brief Ready` select
- `Brief generation default` select
- `Last 30 days enrichment after approval` toggle row
- `Event retention (days)` select
- `Provenance validation rules` select

Include the muted explanatory note at the bottom of the panel.

### Runtime Config

Render dense rows for:

- `Max parallel scans` select
- `AI model tier` select
- `Rate limit backoff` select
- `Data residency` select
- `Audit log retention (days)` select

This section should read as infrastructure configuration, not product marketing.

## Right Column Details

### Human Review Gate

Render the review workflow as a vertical staged process rather than the current horizontal cards.

The panel includes:

- title and short explanatory subcopy
- vertical sequence with numbered stages and connector line
- active emphasis on `Analyst Review`

Stages:

1. `Scan & Ingest`
2. `Enrich & Score`
3. `Analyst Review`
4. `Approve / Reject`
5. `Brief Generation`

Include the warning callout box at the bottom stating that analyst approval is required and automated briefs are never final.

### Permissions

Render a compact restricted-access panel with:

- title and lock icon
- `Permission Restricted` status badge
- explanatory access-copy body
- disabled `Edit Settings` button
- inline text links beneath for requesting access or viewing audit logs

This should replace the current role-card presentation with the screenshot's tighter governance card.

## Responsive Behavior

- Desktop is the fidelity target.
- On smaller breakpoints, the three columns stack vertically.
- The saved-state banner drops into normal document flow rather than staying pinned awkwardly to the header edge.
- Dense control rows remain readable and may wrap where necessary.
- Wide select controls shrink responsibly without breaking panel padding.
- No shell-level horizontal overflow should be introduced.

## Component Boundaries

### `src/routes/settings.tsx`

Recompose the route around focused local helpers so the file stays readable while matching the screenshot.

Likely helper units:

- `SettingsSavedBanner`
- `SourceTogglesPanel`
- `ProvenanceRulesPanel`
- `ScanCadencePanel`
- `EnrichmentControlsPanel`
- `RuntimeConfigPanel`
- `HumanReviewGatePanel`
- `PermissionsPanel`
- `SettingsFieldRow`
- `SettingsToggleRow`

The goal is route-level clarity and screenshot fidelity, not premature shared abstraction.

## Error Handling

- Keep long labels from collapsing control alignment in dense rows.
- Prevent the right column workflow panel from becoming unreadable at intermediate breakpoints.
- Keep the saved-state banner readable when it wraps below the title area.
- Preserve clean spacing when toggle rows and select rows mix inside the same panel.

## Testing

- Verify the settings main pane matches the screenshot's desktop composition closely.
- Verify the sidebar remains unchanged.
- Verify the page uses a three-column desktop composition with the same section ordering as the screenshot.
- Verify the `Human Review Gate` uses a vertical workflow layout.
- Verify the `Permissions` panel matches the restricted-access structure rather than the old role-card structure.
- Verify the screenshot's bottom strip is not recreated and the shared overlay toast system remains untouched.
- Verify responsive stacking remains usable on tablet and mobile.
- Verify the route still builds successfully.

## Recommendation

Implement this as a focused route-level rewrite of `src/routes/settings.tsx`, following the screenshot section-for-section inside the main pane while preserving the current responsive behavior below desktop and leaving the shared toast system untouched.
