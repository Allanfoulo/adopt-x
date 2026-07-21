# AGENTS.md

## Scope

This file governs the `adoptx-mastra/` subtree.

Read the root `/AGENTS.md` first, then this file before editing anything in
this subtree.

## Required Setup

- Load the `mastra` skill before doing Mastra work.
- Do not rely on cached or stale Mastra API knowledge. Verify against the
  current Mastra guidance for this project.

## Local Rules

- Register agents, tools, workflows, and scorers in `src/mastra/index.ts`.
- Use the package scripts from `package.json` instead of invoking
  `mastra dev` or `mastra build` directly.
- Keep Mastra-specific changes inside this subtree unless the task explicitly
  requires app or backend integration work elsewhere.

## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Skills Discovery](https://mastra.ai/.well-known/skills/index.json)

