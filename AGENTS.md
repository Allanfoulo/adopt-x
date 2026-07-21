# AGENTS.md

## Purpose

This repository uses a DOX-style `AGENTS.md` hierarchy.

Start here first. Before making changes, read this file, then descend into the
most relevant child `AGENTS.md` for the subtree you are editing.

Only implement what the user asked for. Keep edits scoped, preserve working
states, and avoid unrelated refactors.

## Read Order

1. Read this root file.
2. Identify the subtree you are editing.
3. Read the nearest child `AGENTS.md` for that subtree before making changes.
4. If a deeper child file exists later, prefer the deeper file for local rules.

## Global Rules

### Lovable Safety

- This project is connected to Lovable.
- Do not rewrite published git history in ways that would break Lovable sync.
- Avoid force pushing, rebasing, amending, or squashing already-pushed commits
  unless the user explicitly requests it and the impact is understood.
- Keep pushed branches in a working state because Lovable syncs from them.

### Convex Safety

- Before editing Convex code, always read
  `convex/_generated/ai/guidelines.md`.
- Treat the generated Convex guidelines as authoritative over generic prior
  knowledge.
- Do not edit generated Convex files unless the user explicitly asks for it or
  there is a clear generated-file workflow that requires it.

### Scope Discipline

- Prefer the smallest correct change.
- Preserve existing project-specific patterns when working in established
  surfaces.
- Keep documentation-only changes separate from runtime changes when possible.

## AGENTS Index

Keep this index current whenever an `AGENTS.md` file is added, removed, moved,
or renamed.

- `/AGENTS.md`
- `/src/AGENTS.md`
- `/convex/AGENTS.md`
- `/docs/AGENTS.md`
- `/adoptx-mastra/AGENTS.md`

## Subtree Guide

### `/src`

Read `/src/AGENTS.md` before editing the app UI, routes, components, hooks, or
frontend helper code.

### `/convex`

Read `/convex/AGENTS.md` before editing backend functions, schema, queries,
mutations, or actions.

### `/docs`

Read `/docs/AGENTS.md` before editing specs, product packet artifacts, or
design assets stored in the docs tree.

### `/adoptx-mastra`

Read `/adoptx-mastra/AGENTS.md` before editing the Mastra subtree.

## Excluded Areas

Do not add `AGENTS.md` files inside generated, transient, or vendor
directories, including:

- `node_modules/`
- `.output/`
- `.superpowers/`
- `.tanstack/`
- `.wrangler/`
- `.last30days-output/`
- `convex/_generated/`

