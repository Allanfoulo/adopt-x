# Signal -> Thesis Map Implementation Plan

## Scope

Implement the approved two-stage Signal -> Thesis Map design from
`docs/superpowers/specs/2026-08-17-signal-thesis-map-design.md`.

## Phase 1: Contracts and schema

1. Add shared TypeScript/Zod shapes for the pre-review assessment and expanded
   Thesis Map in `adoptx-mastra/src/mastra/contracts/`.
2. Extend `candidateDraftSchema` and `adoptionScanOutputSchema` with the
   optional pre-review assessment.
3. Extend `briefEnrichmentSchema` with the required Thesis Map object and
   source external-ID references.
4. Add optional, backward-compatible `preReviewAssessment` and `thesisMap`
   fields to the Convex `dealCandidates` and `dealBriefs` validators in
   `convex/schema.ts`.
5. Add Convex-side validators and normalization helpers for source references,
   confidence bands, and explicit unavailable states.

## Phase 2: Scan and enrichment flow

1. Update `adoptx-mastra/src/mastra/agents/adoption-agent.ts` to generate only
   the lightweight assessment from supplied evidence; do not add a second
   numeric scoring model.
2. Update `convex/ingest.ts` to persist the assessment when present, resolve
   source external IDs against the ingested source batch, and preserve the
   candidate when assessment generation fails.
3. Update `adoptx-mastra/src/mastra/agents/brief-enrichment-agent.ts` to
   generate the expanded Thesis Map after approval, including counter-thesis,
   invalidation conditions, and precise no-evidence language.
4. Update `convex/briefs.ts` to pass the assessment and source external IDs to
   Mastra, validate returned Thesis Map references, persist the map with the
   brief, and expose a retryable unavailable state when map generation fails.
5. Add correlation and contract-version metadata to audit events for map
   generation and retry attempts.

## Phase 3: Live API types and UI

1. Extend `src/lib/brief-types.ts` with typed assessment and Thesis Map models.
2. Update the candidate detail query and `src/routes/candidate.tsx` to render
   the expandable Pre-review Assessment panel with available, low-evidence, and
   unavailable states.
3. Update the brief detail query and `src/routes/briefs.tsx` to expose the
   four dedicated views: `Brief`, `Thesis Map`, `Evidence`, and `Sources`.
4. Add evidence-claim selection/highlighting and source links to the evidence
   rail. Preserve responsive stacking on smaller screens.
5. Support a deep-link view parameter so archive actions can open the selected
   brief directly on Thesis Map, Evidence, or Sources.
6. Keep the existing archive preview and row actions working while routing the
   full analysis to the dedicated page.

## Phase 4: Export and audit states

1. Extend `src/lib/brief-pdf.ts` to include the full Thesis Map and all cited
   sources, including limitations and confidence rationale.
2. Add visible retry and unavailable states for failed Thesis Map generation.
3. Keep generated content separate from analyst edits and preserve audit trail
   entries for regeneration.

## Phase 5: Verification and rollout

1. Add contract tests for complete, incomplete, conflicting, and no-evidence
   assessment/map payloads.
2. Add Convex tests for source-reference integrity, retry idempotency, and
   backward-compatible historical briefs.
3. Add UI tests for all four views, claim/source interaction, deep links,
   responsive stacking, and unavailable states.
4. Add PDF verification for complete and low-evidence briefs.
5. Run Convex codegen/typecheck and Mastra typecheck/build using the project
   workflows. Do not edit generated Convex files manually.
6. Backfill only records whose source external IDs can be resolved; historical
   records without resolvable evidence remain explicitly unavailable.

## Key implementation constraints

- Convex remains the system of record.
- Mastra receives source IDs from Convex and cannot invent them.
- Windmill remains responsible for collection and scheduling, not thesis
  synthesis.
- `last30days` remains secondary context and cannot establish a deal.
- Existing deterministic candidate scores remain authoritative.
- Preserve the unrelated uncommitted Triage pagination/filter changes.
