# Adopt X Overview Layout Design

## Summary

This change reshapes the `Overview` main content pane to match the approved desktop screenshot as closely as possible while preserving the current responsive behavior on tablet and mobile. The route remains an operational dashboard rather than a marketing-style summary page. The redesign focuses on exact desktop information architecture, card grouping, table density, right-rail structure, and the bottom refresh/footer bar shown in the screenshot.

## Goals

- Match the approved `Overview` desktop composition 1:1 in structure, grouping, and density.
- Preserve the current responsive behavior instead of forcing the desktop arrangement onto smaller breakpoints.
- Keep the sidebar unchanged.
- Keep the overview page aligned with the new triage-level visual density and operational tone.
- Include the bottom refresh/footer bar shown in the approved screenshot.

## Non-Goals

- No changes to the sidebar layout, styling, icons, or collapse behavior.
- No backend or data-model changes.
- No route renames or navigation changes.
- No redesign of the global shell beyond what is needed inside the overview route composition.
- No attempt to make the desktop layout pixel-perfect at the expense of maintainable code.

## Approved Approach

Use an exact desktop composition-first rebuild for `src/routes/index.tsx`, then preserve the current responsive collapse and stacking behavior below the desktop breakpoint. Keep the route’s role as an operational overview, but replace the current structure with the screenshot’s card rhythm, central table layout, right rail, and footer bar.

## Desktop Layout Structure

### Shared Page Header

- Keep the route title and subtitle aligned to the screenshot.
- Use route-level actions on the right:
- Search field
- `Filters` button
- Primary `New Scan` button
- Overflow button

This utility cluster belongs to the route composition, not the sidebar.

### Top Metrics Row

Use a four-card desktop row:

1. `Queue Summary`
2. `Latest Scan`
3. `Latest Brief Generation`
4. `Sector Distribution`

Desktop emphasis:

- `Queue Summary` is the widest card in the row.
- `Latest Scan` and `Latest Brief Generation` are compact and equal-weight.
- `Sector Distribution` is wide enough to show all sector bars and counts inline.

### Main Workspace

Use a two-zone desktop workspace:

- Left: broad multi-card operational area
- Right: narrow stacked context rail

Left area composition:

1. `Needs Attention`
2. `Recent Approvals`
3. `Recent Queue Activity`

Desktop grouping:

- Row 1: `Needs Attention` and `Recent Approvals`
- Row 2: `Recent Queue Activity` spanning the full width beneath them

Right rail composition:

1. `Operational Runs`
2. `Audit Trail (Recent)`

### Bottom Footer Bar

Include a full-width bottom utility bar matching the screenshot:

- Left: last data refresh timestamp and refresh affordance
- Right: timezone / time-display note

This bar is part of the overview route layout, not a global shell footer.

## Card-Level Composition

### Queue Summary

- Show the five queue counts inline:
- `Pending Review`
- `Brief Queued`
- `Brief Ready`
- `Rejected`
- `Approved`
- Keep a compact header row with the info icon.
- Treat this as a horizontally-scannable metrics card, not a grid of nested stat cards.

### Latest Scan

- Show current status prominently.
- Show timestamp beneath.
- Keep a compact route-level CTA (`View Scans`) inside the card.

### Latest Brief Generation

- Same density and composition as `Latest Scan`.
- Keep its own CTA (`View Briefs`).
- Status reads as a compact operational state, not a large hero number.

### Sector Distribution

- Use horizontal bars across the top portion of the card.
- Show sector labels and counts inline below each bar.
- Keep the compact analytical rhythm from the screenshot instead of a chart-heavy card treatment.

## Left Workspace Details

### Needs Attention

- Present as a dense table-style review list.
- Columns:
- `Company / Target`
- `Issue`
- `Status`
- `Age`
- Keep `View all` in the panel header.
- Include compact pagination/footer controls matching the screenshot rhythm.

### Recent Approvals

- Present as a dense approval list with compact rows.
- Columns:
- `Company / Target`
- `Status`
- `Approved By`
- `Time`
- Keep `View all` in the panel header.
- Include compact pagination/footer controls.

### Recent Queue Activity

- Present as a broad table spanning the left workspace width.
- Columns:
- `Time`
- `Company / Target`
- `Sector`
- `Deal Type`
- `Status`
- `Assigned To`
- Keep `View all` in the header area.
- Keep compact pagination/footer controls at the bottom.

## Right Rail Details

### Operational Runs

- Header includes:
- Section title
- `View all`
- Tabs:
- `Runs`
- `Activity`
- Initial implementation can keep `Runs` active by default.

Within `Runs`, render a compact table:

- `Run ID`
- `Type`
- `Status`
- `Started`
- `Duration`

Keep the density and row rhythm close to the screenshot.

### Audit Trail (Recent)

- Present as a compact stacked feed.
- Each item includes:
- actor avatar or system mark
- actor name
- action
- target context
- optional quoted detail
- relative timestamp
- Keep `View all` in the panel header.

## Responsive Behavior

- Desktop is the fidelity target.
- Tablet and mobile keep the current responsive behavior principle:
- top cards stack or reflow
- left workspace cards stack vertically
- right rail drops below the primary workspace
- wide tables keep internal horizontal scrolling where needed
- footer bar can stack or wrap if necessary
- Do not force the desktop composition below the breakpoint where it becomes cramped or unreadable.

## Component Boundaries

### `src/routes/index.tsx`

- Recompose the route to match the desktop screenshot structure.
- Split repeated structures into small local helpers where it improves readability.

Likely local helper units:

- `OverviewQueueSummaryCard`
- `OverviewRunStatusCard`
- `SectorDistributionCard`
- `NeedsAttentionTable`
- `RecentApprovalsTable`
- `RecentQueueActivityTable`
- `OperationalRunsPanel`
- `OverviewAuditTrailPanel`
- `OverviewFooterBar`

The goal is maintainability and screenshot fidelity, not premature abstraction.

## Error Handling

- Keep horizontal overflow inside table regions rather than the route shell.
- Preserve readability when long company or issue text exceeds expected width.
- Avoid layout jumps between cards with different row counts.
- Ensure the footer bar still behaves cleanly when content wraps at smaller sizes.

## Testing

- Verify desktop overview layout matches the screenshot composition closely.
- Verify the sidebar remains unchanged.
- Verify the top metrics row matches the approved grouping and width hierarchy.
- Verify `Needs Attention` and `Recent Approvals` sit side-by-side on desktop.
- Verify `Recent Queue Activity` spans the full left workspace beneath them.
- Verify the right rail contains `Operational Runs` above `Audit Trail (Recent)`.
- Verify the bottom refresh/footer bar is present and aligned correctly.
- Verify responsive stacking remains usable on medium and small breakpoints.
- Verify table overflow is contained within table regions where necessary.
- Verify the route still builds successfully.

## Recommendation

Implement this as a focused route-level rewrite in `src/routes/index.tsx`. Preserve the existing responsive collapse logic, but replace the desktop composition with the approved operational-dashboard layout so the overview page matches the screenshot section-for-section and reads as the primary command summary for Adopt X.
