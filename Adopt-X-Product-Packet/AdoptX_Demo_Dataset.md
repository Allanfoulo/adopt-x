# Adopt X Demo Dataset

## Scenario

The demo dataset represents a live internal analyst queue on July 16, 2026, with four regulated-sector candidates and one rejected low-signal event.

## Data Assumptions

- all events are public announcements
- all approved briefs come from human-reviewed candidates
- all timestamps are in ISO 8601
- demo records are plausible but synthetic

## Included Candidates

- fintech acquisition of an AI research platform
- healthcare partnership embedding AI clinical workflow support
- insurance investment in AI claims automation
- legal platform acquisition of AI compliance or review capability
- one off-thesis vendor announcement rejected from queue

## Included States

- `pending_review`
- `approved`
- `brief_ready`
- `rejected`

## Operational Context

- one completed scan run
- one running brief run
- one completed brief run

