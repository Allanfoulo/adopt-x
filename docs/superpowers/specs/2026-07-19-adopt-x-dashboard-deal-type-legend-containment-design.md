# Adopt X Dashboard Deal Type Legend Containment Design

## Summary

This change fixes overflow in the `Counts by Deal Type` dashboard card by keeping the legend content inside its container on narrow widths. The adjustment is limited to the `DonutLegend` helper in the dashboard route. Desktop composition remains unchanged.

## Goals

- Keep the deal-type legend content fully inside its card container.
- Preserve the current desktop dashboard composition.
- Allow long legend labels to wrap onto multiple lines on narrower widths.
- Keep numeric values and percentages readable and right-aligned.

## Non-Goals

- No changes to the outer dashboard panel layout.
- No changes to the donut chart itself.
- No truncation of deal-type labels.
- No redesign of other dashboard charts or legend components.

## Approved Approach

Use a narrow, component-level fix inside `DonutLegend` in `src/routes/dashboard.tsx`.

- Keep the donut-plus-legend composition.
- Allow the label column to wrap instead of truncating or overflowing.
- Keep value and percentage cells non-wrapping and right-aligned.
- Preserve the current desktop visual rhythm as much as possible.

## Layout Behavior

### Desktop

- Preserve the current arrangement and spacing.
- Keep labels effectively single-line where there is sufficient width.

### Narrow Widths

- Allow the legend label text to wrap to multiple lines within the available column width.
- Keep the numeric value and percentage on the right without wrapping.
- Ensure the row grows vertically rather than overflowing horizontally.

## Component Boundary

### `src/routes/dashboard.tsx`

Update only the `DonutLegend` helper.

Expected adjustments:

- remove truncation behavior from the label column
- allow the label container to wrap
- keep the right-side numeric cells fixed and non-wrapping
- maintain clean spacing between the color dot, label text, value, and percentage

## Error Handling

- Prevent long labels from pushing numeric values outside the card.
- Avoid collapsing the numeric columns when labels wrap.
- Preserve readable spacing when multiple legend rows become multi-line.

## Testing

- Verify the `Counts by Deal Type` legend stays within its card on narrow widths.
- Verify long labels wrap onto multiple lines instead of overflowing.
- Verify numeric values and percentages remain right-aligned and readable.
- Verify desktop layout remains visually unchanged.
- Verify the route still builds successfully.

## Recommendation

Implement this as a minimal `DonutLegend` fix in `src/routes/dashboard.tsx`. The problem is local to the legend row layout, so the smallest correct solution is to let the label column wrap while keeping the numeric cells pinned on the right.
