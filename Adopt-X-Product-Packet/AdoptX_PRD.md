# Adopt X PRD

## Product

**Name:** Adopt X

**One-sentence positioning:** Adopt X is an internal analyst copilot that detects public AI integration deals, routes them through a human-reviewed triage queue, and turns approved events into structured adoption briefs across regulated industries.

## Target User and Buyer

- **Primary user:** internal research analyst or operator tracking public AI adoption signals.
- **Primary buyer:** a small research desk, strategy team, founder office, or operator doing proprietary market intelligence.
- **Secondary use:** portfolio-grade demo showing product, systems, and agent architecture judgment.

## Problem Statement

Public AI deals are fragmented across filings, investor-relations pages, PR wires, sector press, and market chatter. The hard problem is not finding any AI headline. The hard problem is identifying the subset of public events that actually signal AI integration into existing industries, then turning those into defensible, repeatable briefs without drowning in noise.

## Product Promise

Adopt X helps an analyst move from scattered public deal signals to a reviewable queue of AI-relevant opportunities, then to a structured brief that explains what happened and why it matters for adoption.

## What It Intentionally Does Not Do

- It does not treat social chatter as source-of-truth intake in the MVP.
- It does not auto-publish briefs without human review.
- It does not attempt full global coverage in the MVP.
- It does not act as a generic M&A database or a broad AI news dashboard.
- It does not replace analyst judgment on ambiguous classification decisions.

## MVP Scope

### Included

- Intake from structured public sources across the US, UK, South Africa, and Australia.
- Coverage focused on regulated sectors: fintech, healthcare, insurance, and legal.
- Source hit capture, candidate normalization, dedupe, and scoring.
- Human triage queue with approve, reject, and edit-tags-scores actions.
- Brief generation for approved items.
- Optional `last30days` enrichment after detection or approval for adoption context.
- Audit history for candidate edits and review decisions.

### Excluded

- Autonomous publishing.
- Subscriber-facing external product.
- Full social-first ingestion.
- Billing, multi-tenant SaaS, and external customer administration.

## Main Modules

1. **Source Intake**
2. **Normalization and Dedupe**
3. **Triage Queue**
4. **Candidate Detail and Review**
5. **Brief Generation**
6. **Brief Archive**
7. **Summary Dashboard**

## User Journeys

### Journey 1 - Review a new candidate

1. System captures a source hit from a filing, IR page, PR wire, or sector article.
2. Candidate is normalized and scored.
3. Candidate appears in `pending_review`.
4. Analyst opens detail view, checks provenance, edits sector or AI role if needed, and approves.
5. System queues brief generation and stores an audit event.

### Journey 2 - Generate and inspect a brief

1. Approved candidate enters `brief_queued`.
2. Brief agent assembles transaction summary, rationale, risks, implications, and takeaways.
3. If enabled, the agent calls `last30days` for market and adoption context.
4. Analyst opens the generated brief and uses it for discussion or downstream research.

### Journey 3 - Monitor adoption trends

1. Analyst opens the dashboard.
2. Dashboard shows counts by sector, geography, deal type, and AI role.
3. Analyst drills into the queue or archive for recent adoption patterns.

## Functional Requirements

### Intake and Detection

- System must scan structured public sources on a schedule.
- System must persist every raw source hit with provenance.
- System must normalize raw source hits into canonical deal candidates.
- System must dedupe repeated announcements referring to the same underlying event.

### Scoring and Review

- System must assign draft sector, geography, deal type, AI role, confidence, and thesis-fit score.
- System must place candidates into a review queue before promotion.
- Reviewer must be able to approve, reject, and edit tags or scores.
- Every meaningful review action must be auditable.

### Briefing

- System must generate a structured brief for approved candidates.
- System must store versioned brief outputs.
- System must allow optional `last30days` enrichment as a bounded tool call.

### Archive and Reporting

- System must expose approved briefs in an archive.
- System must support filtering by sector, geography, and deal type.
- System must show operational run state for scans and brief jobs.

## Non-Functional Requirements

- Deterministic, auditable state transitions.
- Fast queue responsiveness for analyst review.
- Clear provenance for every candidate and brief.
- Durable scheduled jobs with retries.
- Explainable scoring and manual override support.
- UI suitable for desktop-first internal-tool usage.

## Clean Architecture Mapping

- **UI layer:** React/TanStack review surfaces, archive views, dashboard, filters.
- **Application layer:** intake orchestration, candidate scoring requests, review actions, brief requests.
- **Domain layer:** candidate statuses, dedupe rules, AI role taxonomy, thesis-fit rules, approval semantics.
- **Infrastructure layer:** source fetchers, Mastra agent adapters, Windmill jobs, `last30days` tool adapter.

## Event-Driven Architecture

Core domain events:

- `source_hit.captured`
- `candidate.normalized`
- `candidate.scored`
- `candidate.reviewed`
- `candidate.approved`
- `candidate.rejected`
- `brief.requested`
- `brief.generated`
- `brief.failed`

Critical rule: the UI never promotes a source hit directly to a brief. Every event must flow through the `dealCandidate` state model.

## Agentic Workflow

- Intake agent classifies and enriches candidates with draft metadata.
- Review remains human-gated.
- Brief agent assembles structured output from approved candidate state and provenance.
- `last30days` is a supporting tool for contextual research, not a replacement for source-of-truth ingestion.

## Data Flow Summary

Structured sources feed `sourceHit`.
`sourceHit` records are normalized into `dealCandidate`.
`dealCandidate` records are scored and placed into `pending_review`.
Human review promotes approved candidates into `brief_queued`.
Brief generation creates `dealBrief`.

## Demo Data Plan

Seed demo data will include:

- fintech acquisition
- healthcare AI partnership
- insurance AI investment or integration deal
- legal AI infrastructure or workflow deal
- a few rejected or low-confidence candidates

## Success Metrics

- Analyst can review a new candidate from queue to approval in under 3 minutes.
- Approved candidates retain visible provenance and edit history.
- Brief generation succeeds for at least 90% of approved demo candidates.
- Dashboard correctly reflects sector and geography counts from canonical records.

## Risks and Mitigations

- **Noise risk:** structured intake may still over-capture AI-adjacent non-deals.
  - Mitigation: strict thesis-fit scoring and mandatory human gate.
- **Classification drift:** sector or AI role tagging may be inconsistent.
  - Mitigation: reviewer edit path plus auditable overrides.
- **Overreach into social-first ingestion too early:**
  - Mitigation: model `sourceClass` now, but delay `secondary_signal` promotion.
- **Opaque brief quality:**
  - Mitigation: always keep source snapshot and review history attached to the brief.

## Implementation Sequence

1. Build source hit ingestion and run tracking.
2. Build candidate normalization and dedupe.
3. Build triage queue and review detail.
4. Add candidate scoring agent.
5. Add approval audit log.
6. Add brief generation.
7. Add `last30days` enrichment adapter.
8. Add archive and summary dashboard.

## Lovable.dev Prompt

Build **Adopt X**, a dense desktop-first internal dashboard for analysts reviewing public AI adoption deals. This is **not** a landing page, hero page, brochure site, or generic startup admin template. It should feel like a serious research operations product used repeatedly throughout the day.

Design goal:

- help the analyst see what matters now
- help them review candidates quickly with confidence
- make the queue and detail workflow feel obvious
- keep the UI dense, scannable, and calm rather than flashy

Dominant UX principle: **smart defaults**

- the product pre-classifies candidates
- the analyst corrects and approves rather than entering everything from scratch
- machine-generated values should be clearly visible, editable, and easy to trust or override

Dominant dashboard principle: **queue-first clarity**

- the primary object is the triage queue
- the top of the experience should foreground queue state and actionable records, not decorative metrics
- avoid widget collage behavior

Build the app shell like this:

- a persistent left sidebar used as the global navigation spine
- a compact top action row for page-scoped search, filters, date range, and one dominant action
- a large main content area for the current page
- an optional secondary side panel for provenance, audit history, or run detail

Sidebar structure:

- short labels with icons
- obvious active state using a simple bar or pill, not ornate decoration
- global items only
- low-frequency items like Settings and Help at the bottom
- can collapse cleanly to icon-first mode

Primary navigation:

- Overview
- Triage Queue
- Brief Archive
- Dashboard
- Settings

The **Overview** page should be a calm command center, not a noisy KPI wall. It should answer:

- what needs attention now
- whether scans and brief jobs are healthy
- which sectors are most active

Show:

- queue counts by status
- latest scan status
- latest brief generation status
- compact sector distribution summary
- a short "Needs Attention" list
- a recent approvals strip or list

Use a restrained grid. Do not make the overview a collage of equal-weight cards.

The **Triage Queue** page is the heart of the product and should be the strongest page in the whole prompt. It should look like a real analyst work surface.

Use:

- a dense table as the main object
- a compact filter/search bar above it
- optional tabs for queue subsets like `All`, `Pending Review`, `Approved`, `Rejected`

The table should include columns for:

- company
- target
- sector
- geography
- deal type
- AI role
- confidence score
- thesis-fit score
- source confidence
- published date
- status

Table behavior:

- sortable columns
- filters for sector, geography, deal type, status, and source class
- row selection with contextual bulk actions only after selection
- row click opens detail
- row anatomy should stay consistent and highly scannable
- no heavy card borders around every row; prefer a cleaner stacked-table feel

The **Candidate Detail** experience should feel like an analyst workbench, not a generic CRM record page. Use a split layout or full-page detail with clearly grouped sections:

- summary header with company, target, status, and confidence badges
- source provenance section with publisher, headline, date, snippet, and links
- extracted facts section
- AI relevance and thesis-fit summary
- editable review fields for sector, deal type, AI role, confidence score, and thesis-fit score
- visible distinction between machine-generated values and human-edited values
- strong approve and reject actions
- audit timeline showing who changed what and when

This page should make the risk of action obvious. The user should know exactly what approving the candidate will do next.

The **Brief Archive** page should feel lighter than the queue but still operational. Use either a compact table or list-style rows rather than oversized cards.

Show:

- sector
- geography
- date
- company / target
- short takeaway
- version or status badge
- search and archive filters

The **Dashboard** page should support scanning, not visual theater. Use only standard, readable chart patterns:

- line chart for trends over time
- bar charts for sector, geography, deal type, and AI role breakdowns

Chart rules:

- labels and axes should be visible
- pair each chart with a short text summary
- the chart should still make sense without hover
- no exotic chart types
- no decorative animation

The **Settings** page should be lightweight and operational:

- source toggles
- scan cadence controls
- enrichment controls
- runtime config placeholders

Use realistic demo data across:

- fintech
- healthcare
- insurance
- legal

Design all important states explicitly:

- loading
- empty queue
- failed scan
- candidate needs review
- brief queued
- brief ready
- brief failed
- permission-restricted action
- destructive confirmation

Interaction rules:

- one obvious primary action per page
- contextual bulk actions appear only after selection
- use subtle toasts for save/approve/reject feedback
- destructive actions should confirm or support undo
- no hover-induced layout shift
- motion should be subtle, functional, and fast
- optimistic UI is acceptable for lightweight list actions if failure recovery is visible

Visual direction:

- professional internal-tool aesthetic
- restrained palette
- strong hierarchy
- compact typography scale
- consistent spacing and row rhythm
- clean table/list composition
- no startup fluff
- no giant marketing bento sections
- no ornamental gradients as the main visual idea
- trust and clarity should dominate the feel

Accessibility and responsiveness:

- keyboard-friendly table and detail interactions
- visible focus states
- good contrast in light mode
- clear labels for icon actions
- tablet-friendly adaptation
- mobile can be simplified, but the priority is desktop analyst usage

Important product framing:

- this is a human-reviewed AI deal intelligence tool
- structured public sources are the primary intake
- social or community research may enrich a candidate later
- the brief is downstream of review, not the starting point

Future implementation note:

- the frontend will later connect to Convex for canonical records, audit history, events, and realtime updates
- the frontend will later call Mastra-backed HTTP routes for scoring, enrichment, and brief generation
- the human review gate must remain visible in the product structure
