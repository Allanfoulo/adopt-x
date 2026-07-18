# Adopt X Brief Archive Layout Design

## Summary

This change rebuilds the `Brief Archive` main content pane to match the approved desktop screenshot 1:1 in structure, density, and hierarchy while preserving the app's current responsive behavior on smaller breakpoints. The sidebar is explicitly out of scope and remains unchanged.

## Goals

- Match the approved desktop main-pane composition for the brief archive route.
- Preserve the current responsive behavior instead of forcing the desktop arrangement onto tablet and mobile layouts.
- Keep the page aligned with the newer overview and triage compositions in density, spacing rhythm, and operational tone.
- Include the full lower selected-brief workspace shown in the screenshot.

## Non-Goals

- No changes to the sidebar layout, icons, collapse behavior, or sizing.
- No backend, schema, or data-model changes.
- No route renames or navigation changes.
- No attempt to redesign the brief content itself beyond what is required to match the screenshot layout.
- No global shell changes outside this route.

## Approved Approach

Use an exact composition-first rewrite of `src/routes/briefs.tsx`. The route should be rebuilt around the screenshot's desktop structure rather than incrementally restyling the older archive page. Responsive behavior should remain adaptive below desktop, with stacking and internal overflow containment where needed.

## Desktop Layout Structure

### Shared Page Header

- Keep the route title as `Brief Archive`.
- Keep the subtitle aligned to the screenshot's archive-management framing.
- Use a route-level action cluster on the right:
- Search field
- `Filters` button
- Primary `Generate Brief` button

This action cluster belongs to the route header area inside the main pane, not the sidebar.

### Main Desktop Split

Use a two-zone desktop workspace:

- Left: broad primary archive workspace
- Right: narrow stacked context rail

The left side contains:

1. The tabbed archive table block
2. The selected-brief workspace block

The right rail contains:

1. `Recent Brief Runs`
2. `Audit Trail`
3. `Brief Metadata`

## Archive Table Block

### Tabs Row

Render a top tab row that matches the screenshot:

- `All Briefs (48)`
- `Approved (18)`
- `Generated (26)`
- `Draft (4)`
- `Archived (7)`

Desktop behavior:

- Active tab uses the lime underline treatment already established on overview and triage.
- Tabs should read as archive-state filters, not navigation to separate routes.

### Filter Row

Below the tabs, render the dense filter row:

- Search table field
- `All Sectors`
- `All Geos`
- `All Deal Types`
- `All Sources`
- `All Owners`
- `More`
- `Clear`

This row should visually mirror the triage page filter density while matching the archive screenshot's ordering and spacing.

### Archive Table

Render a dense desktop table with the screenshot's column structure:

- selection checkbox
- `Company / Target`
- `Sector`
- `Geography`
- `Approved Date`
- `Deal Type`
- `Key Takeaway`
- `Version`
- `Status`
- overflow actions

Row behavior:

- The first row is visually selected.
- Selected row uses a full-row highlight treatment that matches the screenshot, not a side-accent stripe.
- Company rows include the company mark plus company and target text.
- Sector uses compact colored chips.
- Version uses compact rounded version badges.
- Status uses the established archive-ready badge styling.
- Overflow actions stay compact and aligned to the right edge.

### Table Footer

The archive table footer should include:

- left summary text (`Showing 1 to 4 of 48 results`)
- centered pagination
- right `Rows per page` control

This should match the newer triage footer rhythm rather than the older archive footer style.

## Selected Brief Workspace

### Workspace Header

Below the archive table, render a full-width selected-brief workspace panel.

The header contains:

- company mark
- selected company / target title
- compact metadata line
- status badge
- version badge
- right-side actions:
- `Download`
- `Share`
- overflow button

This block should read as the active brief review surface rather than a generic preview card.

### Workspace Inner Layout

Inside the selected brief workspace, use a three-zone desktop layout:

- left internal section navigation
- center narrative and scoring pane
- right supporting details pane

This inner layout is part of the main pane and must match the screenshot compositionally.

### Left Internal Navigation

Render a vertical internal nav list containing:

- `Executive Summary`
- `Transaction Overview`
- `Strategic Rationale`
- `Risks & Mitigations`
- `Market Implications`
- `Key Takeaways`
- `Sources & Inputs`
- `Revision History`

Desktop behavior:

- `Executive Summary` is active by default.
- Active state uses a clear surface and border treatment without using a colored side stripe.
- `Sources & Inputs` and `Revision History` show count pills as in the screenshot.

### Center Narrative Pane

The center pane should contain:

- executive summary narrative copy at the top
- a compact grid of fit / evaluation cards
- a confidence score block at the bottom

The fit / evaluation cards should cover the same concepts shown in the screenshot:

- Strategic Fit
- Deal Attractiveness
- Market Opportunity
- Execution Readiness
- Value Creation
- Overall Assessment

Each card should be concise, operational, and denser than a marketing card treatment.

The confidence block should include:

- numeric confidence score
- short descriptive label
- supporting progress bar treatment

### Right Supporting Detail Pane

The right inner pane should contain:

1. `Transaction Overview`
2. `Source Snapshot (Top 3)`

`Transaction Overview` should use compact label-value rows for:

- Deal Type
- Structure
- Enterprise Value
- Announced
- Target HQ
- Employees
- Revenue (LTM)
- EBITDA Margin
- Customer Base
- Expected Close

`Source Snapshot (Top 3)` should list the top three sources with compact timestamps and a `View all 14 sources` action.

## Right Rail Details

### Recent Brief Runs

The top right rail panel should show recent brief runs in a compact stacked list.

Each row includes:

- company / target label
- version marker
- status line
- timestamp

The panel header includes `View all`.

### Audit Trail

The middle right rail panel should show a compact feed of recent archive actions.

Each item includes:

- actor avatar or system mark
- actor name
- action description
- affected brief or target
- supporting detail line
- timestamp

The panel header includes `View all`.

### Brief Metadata

The bottom right rail panel should show compact metadata rows for the selected brief:

- Owner
- Team
- Tags
- Visibility
- Last Updated

This is a static context panel in the desktop composition and should remain visually lightweight.

## Responsive Behavior

- Desktop is the fidelity target.
- On smaller breakpoints, the left workspace and right rail stack vertically.
- The lower selected-brief workspace collapses from a three-zone layout into a vertical flow.
- The internal section nav should move above the narrative pane on smaller widths.
- Wide table regions should keep internal horizontal scrolling rather than forcing shell-level overflow.
- Header actions may wrap as needed, but the desktop visual hierarchy should remain intact at large breakpoints.

## Component Boundaries

### `src/routes/briefs.tsx`

Recompose the route around focused local helpers so the file stays readable while matching the screenshot.

Likely helper units:

- `BriefArchiveHeaderActions`
- `BriefArchiveTabs`
- `BriefArchiveFilters`
- `BriefArchiveTable`
- `BriefArchiveTableFooter`
- `SelectedBriefWorkspace`
- `BriefWorkspaceSectionNav`
- `BriefWorkspaceSummaryPane`
- `BriefWorkspaceDetailPane`
- `RecentBriefRunsPanel`
- `BriefArchiveAuditTrailPanel`
- `BriefMetadataPanel`

The goal is route-level clarity, not premature shared abstraction.

## Error Handling

- Keep long company names and key takeaways from breaking row alignment.
- Prevent lower workspace columns from collapsing into unreadable widths on mid-sized screens.
- Keep action buttons usable when the page wraps at narrower widths.
- Contain horizontal overflow inside the archive table and any dense detail regions.

## Testing

- Verify the brief archive main pane matches the screenshot's desktop composition closely.
- Verify the sidebar remains unchanged.
- Verify the archive table tabs, filters, columns, selected-row emphasis, and footer structure match the approved layout.
- Verify the lower selected-brief workspace includes the left nav, center narrative pane, and right detail pane.
- Verify the outer right rail contains `Recent Brief Runs`, `Audit Trail`, and `Brief Metadata` in that order.
- Verify responsive stacking remains usable on tablet and mobile.
- Verify horizontal scrolling is contained within dense table regions where necessary.
- Verify the route still builds successfully.

## Recommendation

Implement this as a focused route-level rewrite of `src/routes/briefs.tsx`, following the screenshot section-for-section inside the main pane while preserving the current responsive behavior below desktop. This is the most direct path to a clean 1:1 archive layout without dragging older structure forward.
