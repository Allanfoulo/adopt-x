# Adopt X UI Scope

## Product Goal

Help an analyst orient quickly, review confidently, and move approved candidates into repeatable briefs with minimal cognitive load.

## Users and Context

- Desktop-first internal analyst
- Time-constrained
- Needs provenance, not just AI summaries
- Must be able to correct the system easily

## Primary Tasks

- scan the queue
- open a candidate
- validate provenance
- correct fields
- approve or reject
- inspect generated brief
- review top-level adoption patterns

## Dominant Psychology Principle

**Smart defaults**

The system should pre-classify candidates and pre-fill draft scores so the analyst is reviewing and correcting, not authoring from scratch.

Secondary principle:

**Goal gradient**

Run progress and stage counts should make the pipeline feel active and legible.

## Information Architecture

- **Overview:** run health, queue counts, recent approvals, brief output status
- **Triage Queue:** primary working surface
- **Candidate Detail:** source evidence, draft fields, edits, review actions
- **Brief Archive:** approved briefs
- **Dashboard:** adoption counts and trends
- **Settings:** runtime config and source toggles

## Flow and Interaction Model

1. Analyst lands on Overview or Queue.
2. Filters to a sector or geography.
3. Opens a candidate detail panel.
4. Reviews provenance and draft metadata.
5. Edits scores or tags if needed.
6. Approves or rejects.
7. Watches brief generation status.
8. Opens the archive entry.

## Hierarchy and Layout

- Queue table is primary.
- Candidate detail is split into:
  - source provenance
  - extracted facts
  - scoring and classification
  - review actions
- Brief view emphasizes summary first, evidence second.
- Dashboard is secondary and should not compete with the queue.

## Visual System

- restrained palette
- dense but readable table views
- clear badge colors for statuses
- obvious distinction between machine-generated fields and human-edited fields
- minimal decorative motion

## States and Edge Cases

- empty queue
- active scan
- failed scan
- candidate missing enough evidence
- brief queued
- brief generation failed
- permission-restricted review action

## Accessibility Review

- keyboard navigable queue
- visible focus states
- readable density on large tables
- no color-only meaning for statuses

## Responsiveness

- desktop-first
- tablet should preserve queue usability
- mobile can degrade to read-only or limited detail behavior in MVP

## Design System Impact

Reusable patterns:

- queue table
- detail inspector
- audit timeline
- run status panel
- evidence source list
- approval action bar

## Final Recommendation

Design the product as a serious internal tool. The queue is the heart of the system. The UI should constantly answer:

- what needs attention now
- why this candidate matters
- what happens if I approve it

