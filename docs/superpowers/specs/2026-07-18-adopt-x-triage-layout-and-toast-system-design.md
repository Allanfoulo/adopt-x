# Adopt X Triage Layout And Toast System Design

## Summary

This change reshapes the `Triage Queue` main content pane to match the approved desktop screenshot as closely as possible while preserving the current responsive behavior on tablet and mobile. In parallel, it replaces the current bottom state-strip concept with a reusable global toast system that is layered over the UI, anchored to the bottom of the viewport, and capable of rendering page-specific operational messages across the app.

## Goals

- Match the approved `Triage Queue` desktop composition 1:1 in information architecture, grouping, and density.
- Preserve the current responsive behavior instead of forcing the desktop arrangement onto smaller breakpoints.
- Keep the sidebar unchanged.
- Replace the bottom horizontal state-strip concept with reusable layered toast notifications.
- Make toast visuals and behaviors reusable across routes while allowing route-specific message content.

## Non-Goals

- No changes to the sidebar layout, styling, icons, or collapse behavior.
- No backend or data-model changes.
- No attempt to make the desktop layout pixel-perfect at the expense of maintainable code.
- No inclusion of the bottom horizontal state strip in the triage page layout match.
- No route renames or navigation changes.

## Approved Approach

Use an exact desktop composition-first rebuild for `src/routes/triage.tsx`, then preserve the existing responsive collapse and stacking behavior below the desktop breakpoint. Separately, add a shared app-level toast provider and bottom-docked toast viewport so the current state-strip area is no longer part of the page layout model.

## Desktop Layout Structure

### Shared Page Header

- Keep the page title and subtitle aligned to the screenshot.
- Add the top-right utility cluster inside the route content:
- Search field
- `Filters` button
- Primary `New Scan` button
- This is part of the triage route composition, not a sidebar change.

### Summary Row

- First card: `Latest Scan`
- Second card: `Latest Brief Run`
- Third card: wider `Queue Summary`
- `Queue Summary` contains the five counts inline:
- `Pending Review`
- `Brief Queued`
- `Brief Ready`
- `Rejected`
- `Approved`

Desktop behavior:

- The two run cards remain equal width.
- The queue summary card spans the remaining width and reads as the dominant card in the row.

### Main Workspace

Use a two-column desktop workspace:

- Left: wide candidate review panel
- Right: narrow operational context rail

The left panel contains, in order:

1. Status tabs row
2. Filter controls row
3. Bulk actions row
4. Table header and dense candidate rows
5. Footer with results count, pagination, and rows-per-page controls

The right rail contains, in order:

1. `Operational Panel`
2. `Audit Trail`

## Triage Table Composition

### Tabs Row

- Match the screenshot’s horizontal status-tab row:
- `All`
- `Pending Review`
- `Brief Queued`
- `Brief Ready`
- `Approved`
- `Rejected`
- Active tab uses the lime-highlight treatment shown in the screenshot.

### Filter Row

- Include left-aligned search input inside the table workspace.
- Include dropdown filters for:
- `Sector`
- `Geography`
- `Deal Type`
- `Status`
- `Source Class`
- `More`
- Keep `Clear` as a separate reset control on the right.

### Bulk Action Row

- Show selected count at left when any rows are selected.
- Actions:
- `Approve`
- `Reject`
- `Queue Brief`
- `More`
- Keep a right-aligned sort control matching the screenshot rhythm.

### Candidate Table

- Increase structural fidelity to the screenshot:
- checkbox column
- company/target grouped cell
- sector chip
- geography
- deal type
- AI role
- three score columns
- published date
- status pill
- overflow action
- Use denser row height and tighter table alignment than the current route.
- Keep row selection and route navigation behavior.
- Keep the selected-row visual emphasis close to the screenshot.

### Footer

- Show results count at left.
- Center pagination controls.
- Keep rows-per-page control on the right.

## Right Rail Structure

### Operational Panel

- Header with section title and tab switcher:
- `Runs`
- `Activity`
- Initial implementation can keep `Runs` active by default.
- Show two stacked subsections:
- `Scan Runs`
- `Brief Runs`
- Each subsection keeps `View all` at the right.
- Run rows should mirror the screenshot’s compact id, status, and time layout.

### Audit Trail

- Match the screenshot’s compact stacked feed structure.
- Keep actor, action, target context, quoted detail, and relative timestamp.
- Use tighter spacing than the current implementation.
- Keep `View all` in the header area.

## Responsive Behavior

- Desktop is the fidelity target.
- Tablet and mobile keep the current responsive behavior principle:
- summary cards stack or reflow
- left workspace and right rail stack vertically
- filter controls wrap
- table keeps internal horizontal scrolling where necessary
- Do not force the desktop two-column composition below the breakpoint where it stops being usable.

## Toast System

### Product Decision

- Toasts are reusable and global.
- Toasts are layered over the UI, not embedded in route layouts.
- Toasts are anchored at the bottom of the viewport.
- Toast content is page-specific even though the component system is shared.

### Supported Toast States

- `success`
- `warning`
- `error`
- `info`
- `loading`

### Toast Behavior

- Support optional primary action.
- Support optional secondary link or text action.
- Support dismiss button.
- Support timed dismissal for low-risk confirmations.
- Support persistent display for important or in-progress states.
- Support multiple visible toasts in a bottom stack on desktop.
- Adapt to a mobile-safe stacked layout without obscuring essential controls.

### Example Message Types

- Triage: `2 candidates approved`
- Triage: `Brief queued for MediAxis / ClinPilot AI`
- Candidate detail: `Extracted facts saved`
- Settings: `Scan cadence updated`
- Runtime failure: `Scan failed at 07:42 AM`
- Access control: `Permission restricted`

### Visual Direction

- Use the bottom strip screenshot as the visual cue for tone and density, but render the notifications as floating layered toast cards rather than a layout-owned footer strip.
- Toast cards should feel operational and system-driven, not consumer-app playful.

## Component Boundaries

### `src/routes/triage.tsx`

- Recompose the route to match the desktop screenshot structure.
- Split repeated structures into small local helpers where that improves readability.

Likely local helper units:

- `TriageSummaryCard`
- `QueueSummaryCard`
- `TriageTabs`
- `TriageFilters`
- `TriageBulkActions`
- `TriageTable`
- `OperationalPanel`
- `AuditTrailPanel`

### Shared Toast Layer

- Add a global toast provider near the app shell or root route layer.
- Add a shared toast viewport anchored to the bottom of the window.
- Add a shared toast card component with state variants and action slots.
- Add a shared trigger API so routes can fire toast messages without local duplication.

Possible shared units:

- `ToastProvider`
- `ToastViewport`
- `ToastCard`
- `useToast`

The exact naming can follow repo conventions during implementation.

## Error Handling

- Keep horizontal overflow inside the table region, not the page shell.
- Prevent toast stacks from pushing layout or changing document flow.
- Ensure long toast messages wrap or truncate safely without breaking the viewport.
- Ensure multiple toasts do not overlap critical bottom controls on smaller screens.
- Keep route-level interaction intact when no toasts are visible.

## Testing

- Verify desktop triage layout matches the screenshot composition closely.
- Verify the sidebar remains unchanged.
- Verify summary cards align and size correctly on desktop.
- Verify the left table workspace and right rail match the approved section order.
- Verify tabs, filters, bulk actions, and sort control align like the screenshot.
- Verify the candidate table remains readable and interactive.
- Verify the right rail sections match the approved structure.
- Verify responsive stacking remains usable on medium and small breakpoints.
- Verify the global toast layer appears above the UI and anchored to the bottom.
- Verify each toast state renders correctly.
- Verify timed and persistent toasts behave correctly.
- Verify routes can trigger page-specific toast content through the shared system.
- Verify the app still builds successfully.

## Recommendation

Implement this in two coordinated parts: first, recompose the `Triage Queue` route for screenshot-faithful desktop structure; second, add the reusable global toast system at the app layer so operational feedback no longer depends on a page-owned bottom strip. This keeps the layout work focused while establishing the right long-term notification model for the rest of Adopt X.
