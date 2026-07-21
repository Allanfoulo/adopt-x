# Adopt X Runtime Topology And LLM Boundary

## Dev Runtime

```text
npm run dev:all
  -> convex dev
  -> mastra dev
  -> react/tanstack dev server
```

Windmill is optional locally until scheduled jobs and heavy parsers are implemented.

## Communication Paths

- Browser -> React/TanStack
- React/TanStack -> Convex queries, mutations, actions
- React/TanStack -> Mastra HTTP routes for bounded agent actions where needed
- Mastra -> Convex through approved tools or clients
- Convex / Mastra -> Windmill for durable scans or heavy parsing
- Windmill -> Convex structured results

## Source of Truth Rule

Convex owns canonical state. Mastra reasons about state. Windmill executes durable background tasks. None of them bypass Convex for final product truth.

## Hosted Model Path

- default path: hosted model through Mastra provider adapter
- suitable for scoring and brief drafting

## Optional Local Model Path

- Ollama or compatible endpoint behind provider adapter
- useful for experiments or privacy-sensitive local demos
- not mandatory for first MVP

## Provider Selection

Runtime config should capture:

- provider id
- model id
- prompt version
- tool contract version

## Prompt and Tool Contract Versioning

Version:

- triage prompt
- brief prompt
- scoring schema
- source summarization schema
- `last30days` enrichment adapter contract

## Evaluation Gates Before State Mutation

- candidate scoring output validated against schema before write
- brief output validated structurally before `brief_ready`
- final approval always remains human gated

## Cost, Latency, and Privacy Tradeoffs

- hosted models are easiest and fastest to ship
- local models may reduce vendor dependence but increase setup complexity
- `last30days` is valuable for context but should remain bounded because it expands research cost and noise

