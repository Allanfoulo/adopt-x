# AGENTS.md

## Scope

This file governs the `convex/` subtree.

Read the root `/AGENTS.md` first, then this file before editing Convex code.

## Required Setup

- Always read `convex/_generated/ai/guidelines.md` before editing anything in
  this subtree.
- Treat the generated Convex guidelines as the primary contract for backend
  changes here.

## Local Rules

- Keep backend changes isolated from UI-only concerns unless the task requires
  both sides.
- Avoid editing generated files directly unless the workflow explicitly
  requires it.
- Preserve schema and function boundaries unless the task clearly calls for a
  migration or backend reshaping.

## Boundaries

- Queries, mutations, actions, schema, and Convex backend logic belong here.
- App routes and components belong under `/src`.
- Specs and supporting documentation belong under `/docs`.

