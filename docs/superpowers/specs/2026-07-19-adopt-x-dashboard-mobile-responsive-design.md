# Adopt X Dashboard Mobile Responsive Design

## Summary

This change improves the `Dashboard` route for tablet and mobile breakpoints while preserving the current desktop composition exactly from the desktop breakpoint upward. The goal is to make the dashboard components readable, scroll-safe, and usable on smaller screens without changing the existing desktop information architecture.

## Goals

- Preserve the current desktop dashboard composition exactly.
- Improve tablet and mobile responsiveness across the dashboard main pane.
- Prevent cramped cards, clipped labels, chart overflow, and broken header actions on smaller screens.
- Keep the page aligned with the app's current responsive shell behavior.

## Non-Goals

- No changes to the desktop dashboard layout or section ordering.
- No redesign of chart meanings, copy, or metric content.
- No sidebar changes.
- No backend, schema, or data changes.
- No route renames or navigation changes.

## Approved Approach

Use a breakpoint-first responsive pass in `src/routes/dashboard.tsx`.

- Keep the current desktop layout untouched at `lg` and above.
- Add targeted responsive adjustments below desktop for:
- page header actions
- KPI row
- chart grids
- chart internals
- insights and queue-health sections
- right rail stacking

This is the safest way to improve mobile without disturbing the current desktop layout.

## Responsive Strategy

### Desktop

- Preserve the current layout exactly as-is from `lg` upward.
- Keep the existing KPI row density, chart grouping, insights layout, and right rail placement.

### Tablet

- Allow the route to collapse to fewer columns while preserving content order.
- Main chart rows may become two-column or one-column layouts depending on panel width.
- The right rail drops below the main chart region if needed.

### Mobile

- Stack all major dashboard sections into a single-column flow.
- Keep panels full-width and prevent shell-level horizontal overflow.
- Prefer internal overflow handling or simpler label treatment within charts rather than shrinking everything until it becomes unreadable.

## Header Actions

The route header actions currently contain:

- primary date range
- comparison date range
- `Filters`
- `Export`

Responsive behavior:

- allow clean wrapping on smaller widths
- prevent date controls from forcing overflow
- keep the primary action readable and tappable
- preserve the current desktop arrangement at larger breakpoints

## KPI Row

The six KPI cards should:

- remain six-up on desktop
- reduce to fewer columns on tablet
- become a simpler stacked or two-column layout on mobile

Responsive requirements:

- consistent card heights where practical
- no clipped delta text
- no compressed labels that wrap into unreadable stacks
- preserve current desktop density and visual treatment

## Main Chart Rows

### Top Chart Row

Current desktop grouping:

1. `Adoption by Sector`
2. `Counts by Deal Type`
3. `Geography Breakdown`

Responsive behavior:

- preserve order
- stack to one column on narrow screens
- allow two-column intermediate layouts only where panel width remains usable

### Second Chart Row

Current desktop grouping:

1. `AI Role Distribution`
2. `Candidates Over Time`
3. `Approved Briefs Over Time`

Responsive behavior:

- preserve order
- stack to one column on narrow screens
- keep chart canvases readable rather than forcing a compressed three-up layout below desktop

## Chart Internal Adjustments

### Bar Charts

- reduce label crowding at smaller widths
- keep value labels readable
- avoid bars becoming too narrow to interpret

### Donut + Legend Panel

- allow the donut visualization and legend to stack vertically on smaller widths
- keep legend labels readable without overflowing the panel width

### Horizontal Bar Chart

- shorten or constrain label width below desktop
- use truncation or better wrapping where needed
- keep bar/value alignment readable on narrow screens

### Line Chart

- prevent x-axis date labels from colliding
- allow narrower chart heights only if labels remain readable
- keep the legend and footer text from crowding the plot area

### Bar Comparison Chart

- preserve the paired-bar meaning on smaller screens
- keep x-axis labels readable
- avoid tiny bars caused by over-compressed panel width

## Insights and Queue Health

### Key Insights

- keep the same content and ordering
- collapse to a single-column flow on small screens
- preserve readable paragraph widths and spacing between numbered insight items

### Queue Health Summary

- keep the same content and ordering
- prevent the internal mini-card grid from collapsing into cramped tiles
- allow fewer columns or a stacked layout below desktop
- preserve the summary text below the mini-card grid

## Right Rail

Current desktop rail contains:

1. `Operational Overview`
2. `Queue Aging`
3. `Audit & Review Activity`

Responsive behavior:

- preserve content order
- move the rail below the main content on smaller screens
- keep each panel full-width
- prevent inner status rows and timestamps from colliding on narrow screens

## Component-Level Boundaries

### `src/routes/dashboard.tsx`

Keep the work focused inside the route and its local helpers.

Likely touch points:

- `Dashboard` layout wrappers
- header actions inside `AppShell` usage
- `KPI`
- `ChartPanel`
- `Legend`
- `BarChart`
- `DonutLegend`
- `HBarChart`
- `LineChart`
- `BarComparison`
- `RunLine`

The goal is to make the current route responsive, not to create a new shared chart system.

## Error Handling

- avoid shell-level horizontal scrolling
- keep charts readable when labels are long
- avoid timestamp and status collisions in right-rail rows
- prevent header controls from wrapping into unusable fragments
- ensure panel padding still feels intentional at narrow widths

## Testing

- verify the desktop dashboard composition remains unchanged
- verify the page becomes usable on tablet widths without overflow
- verify the page becomes usable on mobile widths without overflow
- verify the KPI row collapses cleanly
- verify chart panels stack or reflow in the correct order
- verify chart labels remain readable enough to interpret
- verify the right rail drops below the main content on smaller screens
- verify header actions wrap cleanly
- verify the route still builds successfully

## Recommendation

Implement this as a targeted responsive pass in `src/routes/dashboard.tsx`, preserving the current desktop dashboard exactly while adapting layout wrappers, chart internals, and supporting panels below desktop so the route remains usable on tablet and mobile.
