# Adopt X Desktop Sidebar Collapse Design

## Summary

This change adds a desktop-only collapsible sidebar to the Adopt X analyst shell. The expanded state remains the current full sidebar. The collapsed state becomes an icon-only rail that stays visible and keeps route switching available without introducing sidebar scrolling.

## Goals

- Keep the desktop sidebar fully visible from top to bottom.
- Allow analysts to collapse the sidebar into an icon rail.
- Keep the collapse control inside the sidebar itself.
- Persist the desktop collapse preference across refreshes and route changes.
- Leave the existing mobile drawer behavior unchanged.

## Non-Goals

- No mobile navigation redesign.
- No refactor to the generic `src/components/ui/sidebar.tsx` abstraction.
- No change to route structure or sidebar item order.
- No hover-to-expand behavior in the first version.

## Interaction Model

### Expanded State

- Sidebar width stays at the current full width.
- Brand mark, product label, nav labels, quick filters, and analyst profile block remain visible.
- The collapse toggle is shown in the sidebar header.

### Collapsed State

- Desktop sidebar shrinks to a narrow icon rail.
- Route icons remain visible and clickable.
- Route text labels are hidden.
- Quick filters and the analyst profile/status block are hidden.
- The collapse toggle remains visible at the top of the rail.
- The active route keeps a clear selected treatment using the existing accent vocabulary.

### Persistence

- The collapsed state is stored in `localStorage`.
- The shell reads the stored preference on mount.
- Toggling the sidebar updates both React state and `localStorage`.
- If no stored preference exists, the desktop sidebar defaults to expanded.

## Layout Behavior

- This behavior applies on desktop breakpoints only.
- The desktop app shell remains a fixed-height viewport layout.
- The desktop sidebar uses full viewport height and does not scroll.
- The main content area remains the vertical scroll container.
- The mobile drawer continues using the existing open/close state and layout.

## Component Changes

### `src/components/app-shell.tsx`

- Add a desktop-only `sidebarCollapsed` state.
- Add a constant `localStorage` key for persistence.
- Add a mount-time effect to restore the stored preference.
- Add a toggle handler for collapse and expand.
- Update desktop sidebar width classes for expanded and collapsed modes.
- Update sidebar header so the collapse button lives in the sidebar.
- Conditionally render or hide label-heavy blocks in collapsed mode.
- Adjust nav item layout so collapsed mode centers icons cleanly.

## Error Handling

- `localStorage` access should be guarded for browser-only execution.
- If reading stored state fails, the sidebar falls back to expanded.
- If writing stored state fails, the UI still updates for the current session.

## Testing

- Verify desktop expanded state matches the current layout.
- Verify collapse reduces the sidebar to an icon rail.
- Verify the collapse control remains accessible in both states.
- Verify quick filters and analyst profile content hide in collapsed mode.
- Verify route navigation still works in collapsed mode.
- Verify refresh restores the last desktop sidebar state.
- Verify mobile drawer behavior is unchanged.

## Recommendation

Implement this directly in the existing custom shell instead of migrating to the generic sidebar abstraction. The current shell already owns the viewport and navigation behavior, so a focused local change is the lowest-risk path.
