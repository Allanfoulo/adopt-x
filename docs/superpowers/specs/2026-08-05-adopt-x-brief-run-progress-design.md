# Adopt X Brief Run Progress Design

## Goal

Replace simulated brief queueing with persisted, observable brief runs that report progress in Triage and feed the Brief Archive.

## Approved Behavior

- Queue Brief creates a persisted `briefRuns` record for the selected candidates.
- Selected candidates move to `brief_queued`.
- The Triage Operational Panel shows live brief runs and progress.
- Progress is based on completed and failed candidates out of the total batch.
- A run remains observable after navigation through Convex-backed data.
- The Operational Panel provides a way to view all recent and historical brief runs.
- Successful candidates become `brief_ready` and receive a persisted `dealBrief`.
- Failed candidates become `brief_failed` without blocking successful candidates in the same batch.
- The Brief Archive consumes the same persisted brief and run records.

## Data Flow

1. Triage sends selected candidate external IDs to a queue mutation.
2. Convex creates one `briefRuns` record and a queued job record for each candidate.
3. A generation action processes each candidate using its facts and source provenance.
4. Each completed candidate creates or updates a `dealBrief`, updates its candidate status, and increments run progress.
5. Each failure records an error and increments the failed count.
6. Live queries update the Operational Panel and Brief Archive without timers or fixture-only state.

## Backend Contract

Add queue, progress, and generation functions with validators for candidate IDs and run IDs. Preserve the existing `briefRuns` and `dealBriefs` schema boundaries. Run progress must include total, completed, failed, and remaining counts. Generation must be idempotent for a candidate/run pair so retries do not duplicate briefs.

## UI Behavior

- `Queue Brief` is disabled while a queue request is being submitted.
- A queued run appears immediately with a status badge and progress bar.
- The Triage Operational Panel has a live `View all` control for run history.
- Selecting a run shows its status, timestamps, counts, and any error details.
- Brief Archive lists persisted briefs and their statuses instead of static rows.

## Failure Handling

- Queue errors show an error toast and leave selected candidates unchanged.
- Candidate-level generation failures do not fail successful candidates in the same run.
- Retry operates on failed candidates only.
- Incomplete runs remain visible as `Running` or `Partial Failed` until resolved.

## Verification

- Queue one or more candidates and confirm a persisted run appears.
- Confirm the progress bar updates as candidates complete.
- Confirm generated briefs appear in Brief Archive.
- Confirm partial failure preserves successful briefs and exposes failed candidates.
- Confirm run history remains available after page navigation and refresh.
- Run application and Convex typechecks.
