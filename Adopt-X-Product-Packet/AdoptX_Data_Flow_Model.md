# Adopt X Data Flow Model

## Data Ownership by Module

- **Intake owns:** raw source hits and scan run tracking
- **Candidate owns:** normalized event records, dedupe keys, draft classifications, confidence
- **Review owns:** edits, decisions, audit trail
- **Brief owns:** generated packet content and version history
- **Insights owns:** derived counts and dashboard projections

## Canonical Collections

- `sourceHits`
- `dealCandidates`
- `scanRuns`
- `briefRuns`
- `dealBriefs`
- `reviewAuditEvents`
- `runtimeConfig`

## Derived Projections

- queue counts by status
- approvals by sector
- deal counts by geography
- brief success/failure counts
- recent scan health summary

## Event Registry

- `source_hit.captured`
- `candidate.normalized`
- `candidate.scored`
- `candidate.reviewed`
- `candidate.approved`
- `candidate.rejected`
- `brief.requested`
- `brief.generated`
- `brief.failed`

## Job Registry

- `scanSourcesJob`
- `normalizeCandidatesJob`
- `scoreCandidatesJob`
- `generateBriefJob`
- `rerunBriefJob`

## Agent Tool Contracts

### Triage agent input

- candidate id
- source excerpts
- extracted entities
- prior candidate state

### Triage agent output

- sector
- deal type
- AI role
- geography
- confidence
- thesis fit
- reasoning summary

### Brief agent input

- approved candidate
- linked sources
- reviewer edits
- optional `last30days` enrichment result

### Brief agent output

- structured brief sections
- key takeaways
- source snapshot

## Human Decision Points

- approve candidate
- reject candidate
- edit tags and scores
- rerun or accept brief after failure

## Data Retention Assumptions

- source hits retained for provenance
- approved briefs retained indefinitely for archive value
- run logs retained for operational debugging and demo credibility

## System Context Diagram

See [AdoptX_Mermaid_Diagrams.mmd](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Mermaid_Diagrams.mmd).

## Domain Event Shape

```ts
type DomainEvent = {
  eventId: string;
  type: string;
  version: number;
  aggregate: { type: string; id: string };
  correlationId: string;
  causationId?: string;
  actor: { type: "user" | "agent" | "system"; id: string };
  data: Record<string, unknown>;
  metadata: { createdAt: number; source: string };
};
```

## End-to-End Flow

1. Scheduled scanner captures a source hit.
2. Convex stores `sourceHit`.
3. Normalization job creates or updates `dealCandidate`.
4. Triage agent scores and classifies candidate.
5. Candidate enters `pending_review`.
6. Analyst approves or rejects and optionally edits metadata.
7. Approval emits `brief.requested`.
8. Brief job generates packet content and stores `dealBrief`.

