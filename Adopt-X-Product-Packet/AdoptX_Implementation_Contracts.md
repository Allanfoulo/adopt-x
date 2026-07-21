# Adopt X Implementation Contracts

## Convex Collections

### sourceHits

- `sourceClass`
- `sourceType`
- `publisher`
- `url`
- `headline`
- `publishedAt`
- `rawExcerpt`
- `scanRunId`
- `hash`

### dealCandidates

- `dedupeKey`
- `status`
- `company`
- `target`
- `dealType`
- `sector`
- `geography`
- `announcementDate`
- `aiRole`
- `sourceConfidence`
- `confidenceScore`
- `thesisFitScore`
- `reviewEdits`
- `briefId?`

### scanRuns

- `status`
- `sourceTypes`
- `hitCount`
- `candidateCount`
- `errorCount`
- `startedAt`
- `completedAt`

### briefRuns

- `candidateId`
- `status`
- `last30daysUsed`
- `startedAt`
- `completedAt`
- `error`

### dealBriefs

- `candidateId`
- `version`
- `executiveSummary`
- `transactionOverview`
- `strategicRationale`
- `dealStructure`
- `risks`
- `marketImplications`
- `keyTakeaways`
- `sourcesSnapshot`

## Key Indexes

- `sourceHits.by_publishedAt`
- `sourceHits.by_hash`
- `dealCandidates.by_status_and_announcementDate`
- `dealCandidates.by_sector_and_status`
- `dealCandidates.by_geography_and_status`
- `scanRuns.by_startedAt`
- `briefRuns.by_status_and_startedAt`
- `dealBriefs.by_candidateId`

## State Enums

### Candidate status

- `new`
- `normalized`
- `scored`
- `pending_review`
- `approved`
- `rejected`
- `brief_queued`
- `brief_ready`
- `brief_failed`

### Run status

- `queued`
- `running`
- `completed`
- `failed`
- `partial_failed`

## Commands and Mutations

- `captureSourceHit`
- `normalizeCandidate`
- `scoreCandidate`
- `approveCandidate`
- `rejectCandidate`
- `editCandidateMetadata`
- `queueBrief`
- `markBriefReady`
- `markBriefFailed`

## Events

- `source_hit.captured`
- `candidate.normalized`
- `candidate.scored`
- `candidate.reviewed`
- `candidate.approved`
- `candidate.rejected`
- `brief.requested`
- `brief.generated`
- `brief.failed`

## Mastra Agents

- `triage-agent`
- `brief-agent`
- optional `adoption-analyst-copilot`

## Mastra Tools

- `get_candidate_context`
- `score_candidate`
- `draft_brief_sections`
- `run_last30days_enrichment`
- `load_source_snapshot`

## Windmill Jobs

- `scan_sources`
- `parse_source_documents`
- `normalize_candidates`
- `rerun_failed_briefs`

## HTTP Route Contracts

- `POST /mastra/triage/score`
- `POST /mastra/brief/generate`
- `POST /mastra/brief/enrich`

Each route should accept structured input and return validated structured output.

## Error Model

- source fetch errors are retryable
- invalid structured output is non-retryable until prompt or tool fix
- brief generation can fail independently without corrupting candidate state

## Role and Permission Matrix

- `analyst`
  - read queue
  - edit tags and scores
  - approve or reject
  - view briefs
- `admin`
  - all analyst permissions
  - rerun jobs
  - change runtime config

## Test and Evaluation Plan

- unit tests for candidate status transitions
- tests for dedupe and normalization logic
- contract tests for agent outputs
- run lifecycle tests
- permission tests for review actions

## First Sprint

1. source hit schema and scan runs
2. candidate schema and queue page
3. review actions and audit log
4. stub brief generation path

