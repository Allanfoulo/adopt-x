# AGENTS.md

## Scope

This file governs the `src/` subtree.

Read the root `/AGENTS.md` first, then this file before editing app UI code.

## Local Focus

This subtree contains the application shell, routes, components, hooks, and UI
supporting code.

## Local Rules

- Preserve established shell, route, and panel composition patterns unless the
  user explicitly asks for a redesign.
- Prefer localized route or component edits over broad cross-app rewrites.
- Keep dashboard and admin-style UI work aligned with the existing density,
  spacing, and status vocabulary already used in the app.
- When a change is visual, preserve responsive behavior unless the user
  explicitly requests a breakpoint-specific redesign.
- Keep backend or docs-specific rules out of UI-only edits.

## Boundaries

- Runtime UI code belongs here.
- Product specs, packets, and design documentation belong under `/docs`.
- Convex backend code belongs under `/convex`.

