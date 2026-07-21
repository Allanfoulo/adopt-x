# Adopt X Dashboard Donut Legend Wrap Design

## Summary

This change fixes overflow in the `Counts by Deal Type` dashboard card by allowing long legend labels to wrap onto multiple lines while keeping numeric values and percentages aligned inside the card. The adjustment is limited to the `DonutLegend` helper in the dashboard route. Desktop composition remains unchanged.

## Goals

- Keep the `Counts by Deal Type` legend fully inside its container.
- Allow long legend labels to wrap onto multiple lines on narrow widths.
- Keep the numeric value and percentage aligned on the right.
- Preserve the current desktop layout and overall visual rhythm.

## Non-Goals

- No changes to the outer dashboard grid or panel layout.
- No changes to the donut chart itself.
- No truncation of the long deal-type labels.
- No redesign of other dashboard charts or legends.

## Approved Approach

Use a small, component-level fix inside `DonutLegend` in `src/routes/dashboard.tsx`.

- Keep the existing donut-plus-legend composition.
- Change the legend row layout so the label column can wrap.
- Keep the value and percentage cells non-wrapping and right-aligned.
- Preserve the desktop appearance where width is already sufficient.

## Layout Behavior

### Desktop

- Keep the existing visual structure and spacing.
- Labels remain effectively single-line where there is enough width.

### Narrow Widths

- Long deal-type labels wrap to multiple lines inside the available label column.
- The value and percentage remain pinned to the right edge of the row.
- Each row grows vertically rather than overflowing horizontally.

## Component Boundary

### `src/routes/dashboard.tsx`

Update only `DonutLegend`.

Expected adjustments:

- remove the label truncation behavior
- allow the label cell to wrap naturally
- keep the numeric cells fixed-width or non-wrapping
- maintain clean spacing between the color dot, label text, value, and percentage

## Error Handling

- Prevent long labels from pushing the numeric cells outside the card.
- Avoid label wrapping that collapses the numeric columns.
- Preserve readable spacing when several legend rows grow taller.

## Testing

- Verify the `Counts by Deal Type` legend stays inside the card on narrow widths.
- Verify long labels wrap onto multiple lines instead of overflowing.
- Verify numeric values and percentages remain aligned and readable.
- Verify the desktop layout remains visually unchanged.
- Verify the dashboard route still builds successfully.

## Recommendation

Implement this as a minimal `DonutLegend` layout fix in `src/routes/dashboard.tsx`. The problem is local to the legend row structure, so the smallest correct solution is to let the label column wrap while keeping the numeric cells pinned on the right.
