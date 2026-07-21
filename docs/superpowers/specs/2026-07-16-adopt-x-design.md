# Adopt X Design

## Summary

Adopt X is a human-reviewed internal analyst system for detecting public AI integration deals in regulated sectors and turning approved events into structured adoption briefs.

## Approved Product Decisions

- audience: internal tool first, portfolio project second
- MVP shape: triage queue first
- intake: structured public sources first
- enrichment: `last30days` as bounded contextual tool
- reviewer permissions: approve, reject, and edit tags/scores
- sectors: fintech, healthcare, insurance, legal
- geography: US, UK, South Africa, Australia
- architecture preference: `A now, leave room for B later`
- product name: `Adopt X`

## Core Workflow

1. Scheduled scanners create `sourceHit` records.
2. Normalization creates canonical `dealCandidate` records.
3. Candidate scoring assigns draft metadata and confidence.
4. Human review gates approval.
5. Approved candidates queue structured brief generation.
6. Brief outputs enter the archive and dashboard.

## Architecture Decision

- React/TanStack owns analyst surfaces.
- Convex owns canonical state, runs, and audit history.
- Mastra owns scoring and brief drafting.
- Windmill owns durable scans and heavy background jobs.
- `last30days` remains enrichment, not primary source-of-truth intake.

## Data Model

Canonical records:

- `sourceHit`
- `dealCandidate`
- `scanRun`
- `briefRun`
- `dealBrief`
- `reviewAuditEvent`

## Extension Path

Future `B` behavior is allowed by modeling `sourceClass` from day one:

- `primary_structured`
- `secondary_signal`

This allows social or broader web signals later without replacing the core queue architecture.

## Packet Deliverables

The full packet is in [Adopt-X-Product-Packet](D:/Development/news-x/Adopt-X-Product-Packet):

- [AdoptX_PRD.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_PRD.md)
- [AdoptX_Positioning_Research.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Positioning_Research.md)
- [AdoptX_Portfolio_Packet.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Portfolio_Packet.md)
- [AdoptX_Architecture.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Architecture.md)
- [AdoptX_UI_Scope.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_UI_Scope.md)
- [AdoptX_Data_Flow_Model.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Data_Flow_Model.md)
- [AdoptX_Runtime_Topology_And_LLM_Boundary.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Runtime_Topology_And_LLM_Boundary.md)
- [AdoptX_Implementation_Contracts.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Implementation_Contracts.md)
- [AdoptX_System_Readiness_Review.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_System_Readiness_Review.md)
- [AdoptX_Demo_Dataset.md](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Demo_Dataset.md)
- [AdoptX_Demo_Dataset.json](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Demo_Dataset.json)
- [AdoptX_Mermaid_Diagrams.mmd](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Mermaid_Diagrams.mmd)
- [AdoptX_Dataflow_Visuals.html](D:/Development/news-x/Adopt-X-Product-Packet/AdoptX_Dataflow_Visuals.html)

## Review Gate

Review this spec and the packet before implementation planning. The next step after approval is to write the implementation plan for the first build sprint.
