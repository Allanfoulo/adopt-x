# Adopt X DOX Integration Design

## Summary

This change integrates the `agent0ai/dox` AGENTS.md framework into this repository as a hierarchical documentation contract. The integration is documentation-only. It rewrites the existing root and Mastra agent files into DOX-style equivalents, preserves the current Lovable, Convex, and Mastra rules in equivalent wording, and adds a small set of high-signal child `AGENTS.md` files for the repo's real subsystem boundaries.

## External Reference

The DOX model is based on the public `agent0ai/dox` guidance:

- DOX is a lightweight AGENTS.md hierarchy rather than a package or runtime.
- Root `AGENTS.md` owns project-wide rules and the top-level index.
- Child `AGENTS.md` files define local contracts for specific areas.
- Agents should walk the AGENTS tree before making edits and keep the tree current as the project changes.

Sources:

- [agent0ai/dox overview](https://imtaqin.id/agent0ai-dox-tiny-agents-md-framework-that-gives-an-ai-agent-precise-project-context)
- [example DOX-style root AGENTS in agent0ai/space-agent](https://github.com/agent0ai/space-agent/blob/main/AGENTS.md)

## Goals

- Adopt a DOX-style `AGENTS.md` hierarchy for this repository.
- Preserve current repo-specific rules in equivalent wording:
- Lovable history safety constraints
- Convex generated-guidelines-first rule
- Mastra skill-first and script usage rules
- Create child `AGENTS.md` files only for meaningful subsystem boundaries.
- Make the root `AGENTS.md` an explicit contract index for the hierarchy.

## Non-Goals

- No application runtime behavior changes.
- No dependency installation.
- No package, CLI, or build-tool integration.
- No low-signal `AGENTS.md` files in generated, transient, or vendor directories.
- No attempt to create a child file for every folder in the repo.

## Approved Approach

Use a layered DOX hierarchy with a small number of intentional agent files:

1. Rewrite the root `AGENTS.md` into DOX style.
2. Rewrite `adoptx-mastra/AGENTS.md` into DOX style while preserving its current rules.
3. Add child `AGENTS.md` files for the app UI, Convex backend, and docs subtree.
4. Keep the root file as the authoritative index of every repo `AGENTS.md` path.

This gives the repo the actual DOX operating model without creating instruction clutter.

## Target Hierarchy

### Root

- `/AGENTS.md`

### Child Files

- `/src/AGENTS.md`
- `/convex/AGENTS.md`
- `/docs/AGENTS.md`
- `/adoptx-mastra/AGENTS.md`

### Excluded Areas

Do not add AGENTS files inside:

- `node_modules/`
- `.output/`
- `.superpowers/`
- `.tanstack/`
- `.wrangler/`
- `.last30days-output/`
- `convex/_generated/`
- other generated or transient directories

## Root AGENTS Contract

The rewritten root `AGENTS.md` should:

- establish that the repo uses a DOX-style AGENTS hierarchy
- instruct agents to read the root file first, then descend into the relevant child file(s) for the subtree they are editing
- state that only user-requested behavior should be implemented
- keep an explicit index of every repo `AGENTS.md` path
- preserve the Lovable and Convex rules in equivalent wording

### Root Rule Preservation

#### Lovable Rule Equivalence

Preserve the current intent of the existing root file:

- do not rewrite published git history
- avoid force pushing, rebasing, amending, or squashing already-pushed commits in ways that break Lovable history
- keep pushed branches in a working state because Lovable syncs from them

#### Convex Rule Equivalence

Preserve the current Convex safety rule:

- before editing Convex code, always read `convex/_generated/ai/guidelines.md`
- treat those generated guidelines as authoritative over generic prior knowledge

## Child File Contracts

### `/src/AGENTS.md`

Scope:

- app UI
- shell
- routes
- components
- hooks
- lib code used by the UI

Expected rules:

- preserve established app-shell and route-level composition patterns
- prefer localized route changes over unrelated cross-app refactors
- keep dashboard/admin-style UI work aligned with existing density and layout patterns
- avoid pushing docs-specific or backend-specific rules into UI work

### `/convex/AGENTS.md`

Scope:

- backend functions
- schema
- mutations, queries, actions

Expected rules:

- always read `convex/_generated/ai/guidelines.md` before Convex edits
- treat generated guidance as the primary contract
- keep backend work isolated from UI-only concerns
- avoid editing generated files unless explicitly required

### `/docs/AGENTS.md`

Scope:

- specs
- product packet artifacts
- design assets under `docs/`

Expected rules:

- preserve existing docs structure and artifact organization
- keep specs concise, implementation-oriented, and scoped
- do not mix runtime code into documentation areas
- keep docs changes aligned with the repo's current product and design workflow

### `/adoptx-mastra/AGENTS.md`

Scope:

- Mastra project subtree

Expected rules preserved from the current file:

- load the `mastra` skill first before Mastra work
- do not rely on stale or cached Mastra API assumptions
- register agents, tools, workflows, and scorers in `src/mastra/index.ts`
- use package scripts from `package.json` instead of invoking `mastra dev` or `mastra build` directly

## Root Index Requirement

The root `AGENTS.md` should include an explicit index of all repo `AGENTS.md` files after this change:

- `/AGENTS.md`
- `/src/AGENTS.md`
- `/convex/AGENTS.md`
- `/docs/AGENTS.md`
- `/adoptx-mastra/AGENTS.md`

This index must be updated whenever an `AGENTS.md` file is added, removed, moved, or renamed.

## Writing Style

The DOX rewrite should:

- be concise and directive
- avoid marketing language
- use repo-specific rules instead of generic filler
- separate global and local contracts cleanly
- keep equivalent meaning for existing constraints even if wording changes

## Error Handling

- avoid dropping current safety rules during the rewrite
- avoid duplicating the same global rules in every child file
- avoid creating contradictory instructions between root and child files
- avoid placing AGENTS files in generated or transient directories

## Testing

- verify the root `AGENTS.md` exists and is rewritten into DOX style
- verify the child AGENTS files exist at the intended boundaries
- verify the root file indexes every repo `AGENTS.md`
- verify Lovable, Convex, and Mastra rules are still present in equivalent form
- verify no AGENTS files are added to generated or transient directories

## Recommendation

Implement this as a documentation-only DOX adoption pass. Rewrite the current root and Mastra files into a proper hierarchy, add only the necessary child files for `src`, `convex`, and `docs`, and keep the root as the authoritative index and repo-wide contract.
