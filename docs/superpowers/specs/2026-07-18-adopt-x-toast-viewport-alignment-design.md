# Adopt X Toast Viewport Alignment Design

## Summary

This change updates the shared global toast viewport so notifications anchor to the bottom-right of the main application shell on desktop while preserving the current centered, full-width stacked behavior on smaller screens.

## Goals

- Move the shared toast stack to the bottom-right on desktop.
- Preserve the current bottom-edge positioning across all breakpoints.
- Preserve the current small-screen behavior, including full-width viewport coverage and stacked toast cards.
- Keep the change centralized in the shared toast system rather than introducing per-route overrides.

## Non-Goals

- No redesign of toast card styling, tone colors, spacing, or actions.
- No route-specific toast positioning.
- No changes to toast timing, dismissal behavior, or interaction patterns.
- No changes to the app shell layout outside the existing toast viewport alignment.

## Approved Approach

Use a single responsive alignment change in `src/components/app-toast.tsx`.

- Keep the outer viewport pinned to the bottom edge of the main pane.
- Keep the existing mobile and tablet stack behavior.
- Change only the desktop alignment so the toast row is right-justified at the `lg` breakpoint and above.

This keeps the shared toast system intact and avoids unnecessary configuration or duplication.

## Layout Behavior

### Small Screens

- The toast viewport remains full-width across the bottom edge.
- Toasts continue to stack vertically.
- Card width behavior remains unchanged, so the stack still reads as a centered or naturally full-width mobile presentation.

### Desktop

- The toast viewport remains layered over the main pane at the bottom edge.
- The toast row aligns to the right side of the viewport at `lg` and above.
- Toast cards continue to wrap when multiple notifications are present, but the stack origin becomes the bottom-right corner instead of the bottom-left.

## Component Boundary

### `src/components/app-toast.tsx`

Update only the `ToastViewport` container classes so alignment changes responsively:

- preserve the existing absolute bottom positioning
- preserve the existing padding
- preserve the existing vertical stacking behavior on smaller screens
- apply right-justified layout behavior on desktop

The toast provider API and toast record model remain unchanged.

## Error Handling

- Avoid clipping or overflow when multiple toasts are visible at once.
- Preserve readable spacing between cards after right alignment.
- Ensure the desktop alignment change does not collapse the small-screen layout into a narrow right-aligned column.

## Testing

- Verify a single toast appears bottom-right on desktop.
- Verify multiple toasts stack from the bottom-right on desktop.
- Verify toast cards remain full-width or centered appropriately on smaller screens.
- Verify toast layering remains over the UI rather than affecting document flow.
- Verify existing toast interactions still work:
- dismiss
- primary action
- secondary action
- timed auto-dismiss
- Verify the app still builds successfully.

## Recommendation

Implement this as a focused shared-system update in `src/components/app-toast.tsx`. The requested behavior is a viewport alignment change, not a toast redesign, so the smallest correct solution is to adjust the desktop flex alignment while leaving the rest of the toast system untouched.
