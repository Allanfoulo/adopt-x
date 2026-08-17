# Signal -> Thesis Map

## Status

Approved design. This specification covers the first implementation of an
evidence-linked Signal -> Thesis Map for Adopt X.

## Objective

Help an analyst decide whether a market-adoption signal is worth pursuing and
make the resulting thesis auditable. The feature has two stages:

1. A lightweight pre-review assessment on Candidate Detail.
2. An expanded Thesis Map on the dedicated approved-brief page.

The feature is analytical infrastructure, not a video or content-generation
studio. It should support investment research, strategy, competitive
intelligence, founders, market research, M&A analysis, and discussion prep.

## Scope

### Pre-review assessment

The scan-time Adoption Agent produces a compact, evidence-bounded assessment
with:

- `signal`: what publicly happened
- `interestingBecause`: why the signal may matter
- `preliminaryThesis`: the initial interpretation
- `counterThesis`: the strongest alternative explanation available
- `evidenceRefs`: claim references to supplied source external IDs
- `missingEvidence`: material gaps that limit the assessment
- `confidenceRationale`: why the assessment is strong, weak, or incomplete

The assessment does not add an arbitrary numeric score. Candidate confidence
continues to come from the deterministic Convex scoring rubric, with the
assessment explaining the evidence behind that result.

Assessment failure must not block candidate ingestion. Candidate Detail must
show an explicit unavailable state when the assessment could not be generated.

### Expanded Thesis Map

After analyst approval, the existing brief enrichment flow generates a
structured Thesis Map with:

- `signal`
- `surfaceInterpretation`
- `interestingBecause`
- `thesis`
- `evidenceClaims`: stable claim ID, claim text, support or contradict status,
  and source external IDs
- `implications`
- `followTheMoney`
- `invalidationConditions`
- `counterThesis`
- `opportunities`
- `confidence`: qualitative band, derived score reference, and rationale
- `limitations`

The map must explicitly state when the evidence cannot support a conclusion.
Examples include:

- `No defensible opportunity identified from the available evidence.`
- `No independent source currently supports this implication.`
- `Counter-thesis unavailable because the source set does not contain a credible alternative explanation.`

## Non-goals

- Generating YouTube scripts or videos.
- Replacing analyst approval with an automated decision.
- Treating last30days context as proof that a deal occurred.
- Introducing a second source-of-truth database outside Convex.
- Building an interactive graph or canvas in the first release.

## Architecture

### Agent boundaries

The Adoption Agent remains responsible for scan-time normalization and the
lightweight pre-review assessment. It uses supplied source evidence and the
existing corroboration rules. It must not create unsupported transaction facts.

The Brief Enrichment Agent remains responsible for post-approval synthesis. It
receives the candidate, pre-review assessment, and linked source evidence. It
generates the expanded Thesis Map in the same enrichment response as the
existing brief sections.

The existing last30days tool remains bounded secondary context. It can explain
public discussion and adoption context, but it cannot establish the deal or
upgrade an unsupported claim.

### Convex boundaries

The candidate record stores the optional pre-review assessment. The brief
record stores the expanded Thesis Map and its version metadata. Convex is the
validation boundary and system of record.

Mastra receives source external IDs supplied by Convex. It may return only IDs
from that input. Convex resolves those IDs to source hits and verifies that
each source belongs to the candidate's source snapshot before storing the
assessment or Thesis Map.

This design reuses the existing `sourceHits`, `candidateSourceLinks`,
`dealCandidates`, `dealBriefs`, `briefRuns`, and `reviewAuditEvents` concepts.
It does not create a separate thesis database for the first release.

### End-to-end flow

1. Windmill collects and deduplicates public sources.
2. The Adoption Agent normalizes a candidate and generates the pre-review assessment.
3. Convex validates source references and persists the candidate assessment.
4. Candidate Detail displays the assessment before approval.
5. The analyst approves the candidate.
6. The existing brief run invokes the Brief Enrichment Agent with the assessment and all linked sources.
7. Convex validates the enrichment response, resolves evidence references, and stores the brief and Thesis Map.
8. The dedicated brief route renders the four views.
9. PDF export includes the thesis, evidence chain, counter-thesis, invalidation conditions, and confidence rationale.

## Data contract requirements

The Mastra Zod contracts and Convex validators must require non-empty text for
the core fields, constrain confidence bands to the supported qualitative
values, and require at least one evidence reference for a supported claim.

Evidence references should use source external IDs at the agent boundary. The
Convex persistence layer should resolve them to internal source-hit IDs and
reject references that are not in the candidate source set.

Generated content and human edits must remain separate. Regeneration may create
a new generated version but must not overwrite analyst-authored edits.

The existing deterministic candidate score fields remain authoritative for
`confidenceScore`, `thesisFitScore`, and `sourceConfidence`. The Thesis Map
confidence explanation may reference those values but must not calculate a
second competing score.

## UI behavior

### Candidate Detail

Add a compact, expandable `Pre-review Assessment` panel below the current AI
relevance summary. The collapsed state shows the signal, preliminary thesis,
and confidence rationale. The expanded state shows evidence coverage,
counter-thesis, and missing evidence.

### Dedicated brief page

Add a persistent view switcher:

`Brief | Thesis Map | Evidence | Sources`

The first-release Thesis Map uses an evidence-rail layout:

- Main pane: signal, thesis, implications, follow-the-money hypothesis,
  invalidation conditions, and opportunities.
- Evidence rail: claim IDs and linked source headlines.
- Selecting a claim highlights its supporting or contradicting evidence.
- Selecting a source opens the existing source URL in a new tab.
- On smaller screens, the evidence rail stacks below the claim content.

The route must support deep links to a selected view so the archive can open a
brief directly on the Thesis Map, Evidence, or Sources view.

### PDF export

The detailed export includes all Thesis Map sections, claim-level citations,
confidence rationale, limitations, and the counter-thesis. Missing sections
render the same precise evidence-limitation language as the UI.

## Failure handling and auditability

- Pre-review assessment failure does not fail the scan or hide the candidate.
- Brief generation can succeed while Thesis Map generation is marked unavailable.
- The UI exposes a retry action for a failed Thesis Map without duplicating the candidate or source hits.
- Every attempt records a correlation ID, agent version, contract version, source count, and failure reason.
- Unsupported claims are marked unsupported or omitted rather than presented as facts.
- Source-reference validation failures are visible to the analyst and recorded in audit events.

## Testing requirements

### Contract and backend

- Validate complete and incomplete pre-review assessments.
- Validate complete and incomplete Thesis Maps.
- Reject unknown or out-of-snapshot source external IDs.
- Verify no-evidence and conflicting-evidence states.
- Verify retry idempotency and no duplicate brief or candidate records.
- Verify generated content and analyst edits remain distinct.

### UI

- Render the pre-review panel in available, unavailable, and low-evidence states.
- Render all four dedicated-page views from live Convex data.
- Verify claim-to-source highlighting and external links.
- Verify deep links open the intended view.
- Verify responsive stacking of the evidence rail.

### Export

- Include every Thesis Map section and all cited sources.
- Preserve explicit limitation language in the PDF.
- Verify exports for complete, low-evidence, and failed-map states.

## Rollout

1. Add optional schema fields and backward-compatible validators.
2. Update Mastra contracts and prompts for the pre-review assessment and Thesis Map.
3. Update Convex ingestion and brief completion to validate and persist the new objects.
4. Add Candidate Detail and dedicated-page views using live data.
5. Update PDF export.
6. Run contract, backend, UI, and export tests against existing historical briefs.
7. Backfill only when source references can be resolved; otherwise display the explicit unavailable state.
