# AGENTS.md

## Scope

This file governs the `docs/` subtree.

Read the root `/AGENTS.md` first, then this file before editing anything in the
docs tree.

## Local Focus

This subtree contains:

- implementation specs
- product packet artifacts
- design and presentation support assets stored under `docs/`

## Local Rules

- Preserve the existing docs structure and artifact organization.
- Keep specs concise, scoped, and implementation-oriented.
- Do not mix runtime application logic into the docs tree.
- When updating specs, keep them aligned with the repo's current product and
  design workflow.
- Prefer additive or targeted doc edits over broad reorganization unless the
  user explicitly asks for a restructure.

## Boundaries

- Documentation artifacts belong here.
- Runtime UI code belongs under `/src`.
- Convex backend code belongs under `/convex`.
