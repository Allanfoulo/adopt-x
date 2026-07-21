# Adopt X Architecture

## System Goal

Build a trustworthy internal analyst system that detects public AI integration deals, routes them through a human-reviewed queue, and generates structured briefs from approved canonical records.

## Runtime Topology

- **React/TanStack:** analyst interface
- **Convex:** source of truth, business rules, event log, run state, audit log
- **Mastra:** candidate scoring, interpretation, brief drafting
- **Windmill:** scheduled scanning, retries, parser-heavy or long-running jobs

## Clean Architecture Layers

### Domain

- deal candidate
- source hit
- review action
- brief
- run
- adoption thesis-fit semantics

### Application

- capture source hit
- normalize candidate
- score candidate
- review candidate
- request brief
- generate brief

### Ports

- source collectors
- `last30days` enrichment adapter
- brief renderer
- run scheduler

### Adapters

- Convex repositories
- Mastra tools
- Windmill job endpoints
- UI action hooks

### Frameworks

- React
- Convex
- Mastra
- Windmill

## Module Boundaries

- **Intake module:** capture and persist source hits
- **Candidate module:** normalize, dedupe, classify, score
- **Review module:** human decisions, edits, audit trail
- **Brief module:** packet generation and archive
- **Insights module:** dashboard and summary views

## Convex Schema Direction

Canonical tables:

- `sourceHits`
- `dealCandidates`
- `scanRuns`
- `briefRuns`
- `dealBriefs`
- `reviewAuditEvents`
- `runtimeConfig`

## Mastra Agent Boundaries

- **Triage agent:** proposes sector, deal type, AI role, confidence, thesis fit
- **Brief agent:** drafts structured brief from approved state
- **Optional analyst copilot:** read-only helper for archive and queue insight

Mastra never becomes the source of truth.

## Windmill Boundaries

- scheduled source fetch
- retryable parser work
- long-running source-specific extractors
- batched reprocessing

Windmill returns structured outputs that Convex validates before state mutation.

## External System Boundaries

- filings and exchange endpoints
- IR pages
- PR wires
- sector and business press
- `last30days` research engine as a bounded secondary tool

## Authentication and Authorization Assumptions

- single internal team first
- authenticated analyst user
- roles can start simple: `analyst`, `admin`
- review and approval actions require authenticated backend enforcement

## Observability and Auditability

- scan runs and brief runs tracked separately
- approval and edit history persisted
- correlation IDs across source capture, candidate scoring, review, and brief generation
- visible failure states for scans and brief jobs

## Deployment Assumptions

- dev stack runs locally
- preview web surface can deploy to Vercel or Netlify if desired
- durable services remain portable

## Failure Modes and Recovery

- source fetch fails -> retryable `scanRun` error
- normalization ambiguity -> candidate stays `pending_review`
- brief generation fails -> `brief_failed` with rerun support
- duplicate candidate slips through -> manual merge or later dedupe repair

## Final Recommendation

Keep Convex as the center of gravity. Use Mastra for interpretation and drafting only. Use Windmill only where durability and schedule control are needed. Model `secondary_signal` sources now but do not let them drive the main intake in the MVP.

