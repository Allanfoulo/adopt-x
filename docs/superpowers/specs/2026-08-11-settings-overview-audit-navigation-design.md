# Settings, Overview, and Audit Navigation

## Objective

Make the Settings and Overview surfaces operationally live. Existing buttons
must either perform their intended navigation or be clearly unavailable; they
must not report completion through a toast without an underlying action. Add a
dedicated Audit Log page backed by the existing Convex audit events.

## Scope

### In scope

- Add an `/audit` route and expose it in the application shell navigation.
- Add a live Convex query for workspace audit events.
- Join audit events to users and return candidate/brief destinations when
  references exist.
- Link Settings audit actions and Overview audit actions to `/audit`.
- Route scan-related Overview actions to `/triage`.
- Route brief-related Overview actions to `/briefs`.
- Route candidate-attention actions to `/triage`.
- Preserve the current desktop composition and responsive behavior.
- Provide loading, empty, and error states for the Audit Log page.

### Out of scope

- Authentication and authorization wiring. The current workspace access model
  remains unchanged until auth is introduced.
- A separate scan-history route. Triage Queue remains the scan history surface.
- Changes to the existing audit event schema or event producers unless required
  to expose an existing field safely.
- New audit event types or retention policy behavior.

## Architecture

The existing `reviewAuditEvents` table remains the system of record. A new
Convex query reads the workspace-scoped `by_workspaceId_and_createdAt` index in
descending order, applies bounded query parameters, and joins optional actor
users. Each returned row includes its display metadata and a destination:

- Candidate event: `/candidate` with the existing candidate identifier.
- Brief event: `/briefs/$externalId` using the related brief's external ID.
- Unlinked event: no destination, rendered as a non-interactive row.

The Audit Log route consumes this query through `useQuery`. It does not use
fallback demo rows. The existing Overview and Settings queries remain the
source for their current live data.

## Navigation Contract

| Surface | Action | Destination |
| --- | --- | --- |
| Overview | View scans | `/triage` |
| Overview | View briefs | `/briefs` |
| Overview | Needs Attention / View all | `/triage` |
| Overview | Recent Approvals / View all | `/briefs` |
| Overview | Operational Runs / View all | `/triage` |
| Overview | Audit Trail / View all | `/audit` |
| Settings | View audit logs | `/audit` |
| Settings | Request access | Disabled with an explicit authentication-unavailable explanation until an access-request workflow exists |

The scan action itself remains wired to the existing scan mutation/action. The
navigation changes must not replace or bypass that behavior.

## Audit Log UX

- Page title: `Audit Log`.
- Default sort: newest first.
- Search filters actor, action, entity text, and reason locally after the
  bounded live query result is loaded.
- Entity filters distinguish candidate, brief, and unlinked events.
- Date filter supports a bounded recent range and an all-time option.
- Rows display timestamp, actor, actor type, action, target, reason, and
  correlation ID.
- Candidate and brief references are links; unlinked events remain readable
  without a dead affordance.
- Loading state uses the existing panel/skeleton vocabulary.
- Empty state explains that no audit events exist for the selected scope.
- Query failure shows an actionable retry control and preserves the page shell.

## Settings Behavior

Settings remains backed by `settings:getRuntimeConfig` and
`settings:updateRuntimeConfig`. Save continues to submit only validator-safe
fields. The audit-log action becomes a real route link. Other informational
actions must not claim an external workflow was created when no such mutation
exists. The current Request access control is disabled until authentication and
an access-request destination are implemented.

## Verification

- Run TypeScript compilation and formatting checks.
- Deploy Convex functions and verify the audit query returns live data.
- Confirm each Overview action resolves to the route in the navigation
  contract.
- Confirm Settings save still persists source toggles and runtime controls.
- Confirm the Audit Log page handles live rows, no rows, and query errors.
- Confirm candidate and brief audit links open their existing detail pages.
- Confirm desktop layout remains intact and narrow viewports remain usable.

## Acceptance Criteria

1. `/audit` is reachable from the sidebar, Settings, and Overview.
2. Audit rows are sourced from Convex and not fallback demo data.
3. Overview scan, brief, candidate, and audit actions navigate to working
   existing destinations.
4. No changed button displays a success toast as its only effect.
5. Settings continues to save without `_creationTime` or `_id` validator
   errors.
6. Existing responsive behavior is preserved.
