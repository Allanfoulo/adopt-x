# Adopt X Portfolio Packet

## What This Product Proves

Adopt X is a strong portfolio project because it is not a novelty demo. It solves a real workflow problem with clear trust constraints:

- detect structured public events
- normalize them into canonical records
- let a human correct or approve them
- generate consistent research outputs

This shows product and engineering maturity.

## Why It Is Better Than a Generic AI Wrapper

- It has a defined source-of-truth model.
- It has a human approval gate.
- It separates deterministic state transitions from reasoning tasks.
- It models event flows and auditability explicitly.
- It uses AI where it helps interpretation, not where it would weaken control.

## What A Reviewer Would Notice

- strong problem framing
- narrow but defensible wedge
- thoughtful workflow design
- system boundaries that can scale
- realistic use of agents and scheduled jobs

## Demo Story

"Adopt X helps an analyst discover public AI integration deals across regulated sectors, triage them in a review queue, and produce structured adoption briefs with provenance and market context."

## Demo Narrative

1. Run a scheduled scan.
2. Show raw `sourceHit` ingestion.
3. Show deduped `dealCandidate` queue.
4. Open a candidate detail view and edit a score or tag.
5. Approve the candidate.
6. Show brief generation.
7. Open the finished brief and dashboard.

## Product Strengths

- Workflow-first
- Explainable
- Reproducible
- Extendable to more sources later
- Strong internal-tool ergonomics

## Risks for the Portfolio Story

- If the briefing quality looks too generic, the product can feel like a template.
- If the queue is not believable, the whole system feels thin.
- If `last30days` is treated as primary detection, the trust model gets weaker.

## Portfolio Recommendation

Lead with the triage workflow and brief artifact. Those two surfaces best communicate the intelligence of the product.

