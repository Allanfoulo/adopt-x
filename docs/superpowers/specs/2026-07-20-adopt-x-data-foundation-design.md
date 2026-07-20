# Adopt X Data Foundation Design

## Summary

This spec defines the first functional backend foundation for Adopt X. It turns the current mock-driven UI into a Convex-backed system of record while preserving the product packet's architecture: structured public sources feed provenance records, provenance records normalize into deal candidates, analysts review candidates, and approved candidates flow into brief generation and archive state.

The first implementation should not wire real authentication, live source scanning, Mastra scoring, or live `last30days` calls. It should build the canonical data model, seed realistic demo records from the product packet, and expose queries and mutations that make Overview, Dashboard, Triage Queue, Candidate Detail, Approve/Reject, and Brief Archive functional against real Convex records.

## Source Material

This design is grounded in:

- `Adopt-X-Product-Packet/AdoptX_Architecture.md`
- `Adopt-X-Product-Packet/AdoptX_Data_Flow_Model.md`
- `Adopt-X-Product-Packet/AdoptX_Implementation_Contracts.md`
- `Adopt-X-Product-Packet/AdoptX_PRD.md`
- `Adopt-X-Product-Packet/AdoptX_Demo_Dataset.json`

## Goals

- Create a Convex schema that represents the product packet's canonical collections and provenance requirements.
- Seed a realistic internal workspace with analysts, source hits, candidates, run records, briefs, audit events, and runtime config.
- Replace route-local mock data incrementally with backend-backed read models.
- Support the first workflow sequence: overview/dashboard first, then triage queue, candidate detail, approve/reject, and brief archive.
- Keep authentication deferred while preserving user and role fields so later auth wiring does not require reshaping the domain model.
- Keep Mastra, Windmill, and `last30days` behind explicit boundaries until the core product workflows function.

## Non-Goals

- No live external source scanning in this pass.
- No real auth provider, login flow, or RBAC enforcement beyond seeded role-aware fields.
- No live Mastra agent execution.
- No live `last30days` research calls.
- No Windmill job integration.
- No multi-tenant SaaS model, billing, or external customer administration.
- No broad UI redesign; this pass should preserve the current desktop compositions.

## Approved Approach

Build the full canonical data foundation now, including provenance, audit, event, and user-role records. Defer runtime integrations and auth wiring.

This avoids schema churn when moving from Overview/Dashboard into Candidate Detail. It also matches the product packet's core rule: source hits never become briefs directly; every item must pass through the `dealCandidates` state model and human review gate.

## Domain Model

### `workspaces`

Represents the internal Adopt X environment. The MVP uses one seeded workspace.

Fields:

- `name`
- `slug`
- `createdAt`

Indexes:

- `by_slug`

### `users`

Seeded internal users for ownership, audit, and future auth mapping.

Fields:

- `workspaceId`
- `displayName`
- `email`
- `role`: `analyst` or `admin`
- `avatarInitials`
- `avatarUrl?`
- `authSubject?`
- `createdAt`

Indexes:

- `by_workspaceId`
- `by_workspaceId_and_role`
- `by_authSubject`

Auth note: `authSubject` stays optional until real authentication is wired. Review mutations use a seeded default analyst when running in anonymous demo mode.

### `runtimeConfig`

Stores operational settings from the Settings page.

Fields:

- `workspaceId`
- `sourceToggles`: structured and community source settings
- `scanCadenceMinutes`
- `timezone`
- `dedupeSimilarityThreshold`
- `briefReadyThreshold`
- `briefGenerationMode`
- `last30daysAfterApproval`
- `eventRetentionDays`
- `provenanceValidationMode`
- `requireSourceUrl`
- `minimumSourceConfidence`
- `publisherReputationFloor`
- `detectConflictingInfo`
- `duplicateContentCheck`
- `maxParallelScans`
- `modelTier`
- `rateLimitBackoff`
- `dataResidency`
- `auditRetentionDays`
- `updatedAt`

Indexes:

- `by_workspaceId`

### `scanRuns`

Tracks source scanning lifecycle even while live scanning is deferred.

Fields:

- `workspaceId`
- `externalRunId`
- `status`: `queued`, `running`, `completed`, `failed`, `partial_failed`
- `sourceTypes`
- `hitCount`
- `candidateCount`
- `errorCount`
- `error?`
- `startedAt`
- `completedAt?`
- `createdAt`

Indexes:

- `by_workspaceId_and_startedAt`
- `by_workspaceId_and_status_and_startedAt`

### `sourceHits`

Stores raw provenance captured from public sources.

Fields:

- `workspaceId`
- `sourceClass`: `primary_structured`, `secondary_signal`, or `community`
- `sourceType`
- `publisher`
- `publisherReputation?`
- `url`
- `headline`
- `publishedAt`
- `rawExcerpt`
- `scanRunId`
- `hash`
- `createdAt`

Indexes:

- `by_workspaceId_and_publishedAt`
- `by_workspaceId_and_hash`
- `by_workspaceId_and_scanRunId`
- `by_workspaceId_and_sourceClass_and_publishedAt`

Rules:

- Primary structured sources can drive intake.
- Secondary and community sources can enrich candidates later but are not source-of-truth intake in the MVP.
- `hash` supports dedupe of repeated announcements.

### `dealCandidates`

The canonical operational record for each AI adoption deal candidate.

Fields:

- `workspaceId`
- `dedupeKey`
- `status`: `new`, `normalized`, `scored`, `pending_review`, `approved`, `rejected`, `brief_queued`, `brief_ready`, `brief_failed`
- `company`
- `target`
- `dealType`
- `sector`
- `geography`
- `announcementDate`
- `aiRole`
- `confidenceScore`
- `thesisFitScore`
- `sourceConfidence`
- `reasoningSummary?`
- `reviewEdits?`
- `assignedToUserId?`
- `approvedByUserId?`
- `rejectedByUserId?`
- `rejectionReason?`
- `briefId?`
- `createdAt`
- `updatedAt`

Indexes:

- `by_workspaceId_and_status_and_announcementDate`
- `by_workspaceId_and_sector_and_status`
- `by_workspaceId_and_geography_and_status`
- `by_workspaceId_and_dealType_and_status`
- `by_workspaceId_and_dedupeKey`
- `by_workspaceId_and_updatedAt`

Rules:

- `pending_review` is the human review gate.
- Approval should move the candidate to `brief_queued` when brief generation is requested immediately.
- Rejection must capture a reason or system-generated reason.
- Score and taxonomy edits must be auditable.

### `candidateSourceLinks`

Links candidates to their source hits without storing unbounded source arrays on the candidate document.

Fields:

- `workspaceId`
- `candidateId`
- `sourceHitId`
- `sourceRole`: `primary`, `supporting`, `conflicting`, or `enrichment`
- `claimSummary?`
- `createdAt`

Indexes:

- `by_workspaceId_and_candidateId`
- `by_workspaceId_and_sourceHitId`
- `by_workspaceId_and_candidateId_and_sourceRole`

### `candidateFacts`

Stores extracted facts for Candidate Detail and distinguishes machine-generated values from human-edited values.

Fields:

- `workspaceId`
- `candidateId`
- `field`
- `value`
- `source`: `ai` or `human`
- `sourceHitId?`
- `updatedByUserId?`
- `updatedAt`

Indexes:

- `by_workspaceId_and_candidateId`
- `by_workspaceId_and_candidateId_and_field`

### `reviewAuditEvents`

Human and system audit trail for candidate and brief state.

Fields:

- `workspaceId`
- `candidateId?`
- `briefId?`
- `actorType`: `user`, `agent`, or `system`
- `actorUserId?`
- `action`
- `before?`
- `after?`
- `reason?`
- `correlationId`
- `createdAt`

Indexes:

- `by_workspaceId_and_createdAt`
- `by_workspaceId_and_candidateId_and_createdAt`
- `by_workspaceId_and_briefId_and_createdAt`

### `domainEvents`

Append-only event log for state transitions and future event-driven integrations.

Fields:

- `workspaceId`
- `type`
- `version`
- `aggregateType`
- `aggregateId`
- `correlationId`
- `causationId?`
- `actorType`
- `actorId`
- `data`
- `source`
- `createdAt`

Indexes:

- `by_workspaceId_and_createdAt`
- `by_workspaceId_and_type_and_createdAt`
- `by_workspaceId_and_aggregateType_and_aggregateId_and_createdAt`
- `by_workspaceId_and_correlationId`

Initial event types:

- `source_hit.captured`
- `candidate.normalized`
- `candidate.scored`
- `candidate.reviewed`
- `candidate.approved`
- `candidate.rejected`
- `brief.requested`
- `brief.generated`
- `brief.failed`

### `briefRuns`

Tracks brief generation jobs independent of candidate state.

Fields:

- `workspaceId`
- `candidateId`
- `status`: `queued`, `running`, `completed`, `failed`, `partial_failed`
- `last30daysUsed`
- `startedAt`
- `completedAt?`
- `error?`
- `createdAt`

Indexes:

- `by_workspaceId_and_status_and_startedAt`
- `by_workspaceId_and_candidateId`
- `by_workspaceId_and_startedAt`

### `dealBriefs`

Versioned brief content for the archive.

Fields:

- `workspaceId`
- `candidateId`
- `version`
- `status`: `draft`, `generated`, `approved`, or `archived`
- `ownerUserId?`
- `executiveSummary`
- `transactionOverview`
- `strategicRationale`
- `dealStructure?`
- `risks`
- `marketImplications`
- `keyTakeaways`
- `sourcesSnapshot`
- `confidenceScore?`
- `createdAt`
- `updatedAt`
- `approvedAt?`

Indexes:

- `by_workspaceId_and_candidateId`
- `by_workspaceId_and_status_and_updatedAt`
- `by_workspaceId_and_approvedAt`
- `by_workspaceId_and_updatedAt`

## Application API

### Foundation and Seeds

- `datasets.seedFixtures`
  - Idempotently seeds the workspace, users, runtime config, source hits, candidate records, source links, facts, runs, briefs, audit events, and domain events.
  - Uses stable external IDs from `AdoptX_Demo_Dataset.json` in source fields or deterministic keys so repeated seeding does not duplicate records.

### Overview Queries

- `overview.getSummary`
  - Returns queue status counts, latest scan, latest brief generation run, sector distribution, needs-attention rows, recent approvals, operational runs, audit trail, and latest refresh metadata.

### Dashboard Queries

- `dashboard.getInsights`
  - Returns KPIs, sector breakdown, deal type breakdown, geography breakdown, AI role breakdown, candidate trend, brief trend, queue health, queue aging, operational runs, and recent audit events.
  - In the first pass, historical trends can derive from seeded `announcementDate`, `createdAt`, and `approvedAt` values.

### Triage Queries

- `candidates.listQueue`
  - Supports bounded pagination, search, status, sector, geography, deal type, and source class filters.
  - Returns table-ready rows with linked source count and score fields.

- `candidates.getDetail`
  - Returns candidate headline, provenance sources, extracted facts, AI relevance summary, editable attributes, validation rows, score explanations, audit trail, social/community enrichment status, and tags.

### Review Mutations

- `candidates.editMetadata`
  - Updates sector, geography, deal type, AI role, tags, confidence, thesis fit, or source confidence.
  - Writes `reviewAuditEvents` and `domainEvents`.

- `candidates.approve`
  - Valid from `pending_review`, `scored`, or `brief_ready` states depending on current demo data.
  - Sets approval fields, emits `candidate.approved`, queues a brief run if configured, and creates `brief.requested` when a brief is queued.

- `candidates.reject`
  - Valid unless the candidate is already `rejected`.
  - Sets rejection fields and emits `candidate.rejected`.

### Brief Queries and Mutations

- `briefs.listArchive`
  - Supports bounded pagination and filters for status, sector, geography, deal type, source class, and owner.

- `briefs.getWorkspace`
  - Returns selected brief content, section navigation counts, source snapshot, metadata, recent runs, and audit trail.

- `briefs.queueForCandidate`
  - Creates a queued `briefRun`, moves the candidate to `brief_queued`, and emits `brief.requested`.
  - The first implementation can create a deterministic generated brief from seeded candidate state rather than calling Mastra.

- `briefs.markReady`
  - Marks a brief run completed, creates or updates `dealBriefs`, moves candidate to `brief_ready`, and emits `brief.generated`.

- `briefs.markFailed`
  - Marks a run failed, moves candidate to `brief_failed`, stores the error, and emits `brief.failed`.

### Settings Queries and Mutations

- `settings.getRuntimeConfig`
  - Returns source toggles, scan cadence controls, enrichment controls, runtime config, permissions display state, and review gate state.

- `settings.updateRuntimeConfig`
  - Updates config fields and writes audit/domain events.
  - In this phase, UI may show permission-restricted state while the mutation remains available for seeded admin/dev use.

## State Transition Rules

- `source_hit.captured` creates or links `sourceHits`.
- `candidate.normalized` creates or updates `dealCandidates`.
- `candidate.scored` sets score fields and can move `normalized` to `scored` or `pending_review`.
- `candidate.reviewed` records metadata edits without forcing approval or rejection.
- `candidate.approved` records human approval and can trigger `brief.requested`.
- `candidate.rejected` terminally removes the candidate from brief generation unless later manually reopened.
- `brief.requested` creates a `briefRuns` record and moves candidate to `brief_queued`.
- `brief.generated` creates a `dealBriefs` version and moves candidate to `brief_ready`.
- `brief.failed` stores run failure and moves candidate to `brief_failed`.

## UI Integration Sequence

1. Add Convex schema and seed fixture mutation.
2. Add backend read models for Overview and Dashboard.
3. Update Overview and Dashboard to read from Convex with route-local fallback only for loading or unseeded states.
4. Add queue list and candidate detail queries.
5. Wire Triage Queue and Candidate Detail to Convex.
6. Add approve, reject, and edit metadata mutations with toasts wired to mutation success/failure.
7. Add brief archive queries and deterministic brief generation stubs.
8. Wire Brief Archive to Convex records.
9. Wire Settings to `runtimeConfig`.

## Error Handling

- Empty database should return structured empty states rather than throwing.
- Duplicate seed attempts should update or skip existing records by stable keys.
- Invalid state transitions should throw typed errors with user-facing messages.
- Review mutations should write audit and domain events in the same transaction as state changes.
- Brief generation failure should never corrupt candidate or source state.
- Query collections should be bounded or paginated; dashboard aggregates should use bounded seeded data initially and move to maintained counters when live ingestion grows.

## Testing

Backend tests should cover:

- seed idempotency
- candidate status transitions
- approve and reject audit/event writes
- brief queue, ready, and failed transitions
- source link retrieval for candidate detail
- overview counts derived from candidate records
- dashboard distribution calculations
- settings update persistence

Frontend verification should cover:

- Overview renders Convex data.
- Dashboard renders Convex data.
- Triage filters and row selection still work.
- Candidate approve/reject updates state and shows toast feedback.
- Brief Archive reflects generated/approved brief state.
- Settings reads persisted runtime config.

## Implementation Notes

- Use Convex validators for all query and mutation arguments.
- Keep generated Convex files untouched.
- Avoid unbounded arrays on candidate records; use link tables for sources and facts.
- Use stable workspace seeding so demo data remains predictable.
- Keep user role fields in records now, but defer auth enforcement until the workflows function.
- Treat Mastra, Windmill, and `last30days` as future adapters. The backend contracts should make those adapters easy to add without changing the UI-facing data model.

## Acceptance Criteria

- A developer can run the seed fixture and get a populated Adopt X workspace.
- Overview and Dashboard can be backed by Convex without hard-coded route arrays.
- Triage Queue can list real candidates and open a real candidate detail payload.
- Approve and reject actions mutate canonical candidate state and write audit/events.
- Brief Archive can show versioned brief records tied to approved candidates.
- The schema explicitly preserves provenance and human review history.
- Authentication remains deferred, but users and roles are present in the model.
