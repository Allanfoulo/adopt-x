# Adopt X Candidate Detail Actions Design

## Goal

Make the Candidate Detail actions functional against live Convex data without changing the established page composition.

## Approved Behavior

- Source URL buttons open the linked public source in a new browser tab using `target="_blank"` and `rel="noopener noreferrer"`.
- `Edit Facts` and `Edit Mode` enter one shared inline editing state.
- Fact values remain read-only until editing is active.
- `Save Changes` is disabled until at least one editable fact changes.
- `Cancel` discards all unsaved local changes and exits edit mode.
- A successful save exits edit mode, refreshes the live query, and shows a success toast.
- A failed save keeps the draft values and edit mode active while showing an error toast.

## Data Flow

1. Candidate Detail loads the selected candidate, facts, and source links through `candidate:getDetail`.
2. The UI copies editable fact values into local draft state when editing begins.
3. Saving sends only changed facts, along with the candidate external ID, to a Convex mutation.
4. Convex updates the corresponding `candidateFacts` rows, updates the candidate's `reviewEdits` metadata, and writes one audit event containing the changed fields and before/after values.
5. Convex returns the update result; the live query supplies the persisted values back to the page.

## Backend Contract

Add a public `candidate:updateFacts` mutation with validators for:

- candidate external ID
- a bounded array of `{ field, value }` changes
- an optional edit note

Only supported candidate fact fields may be updated. The mutation must reject empty changes, preserve source provenance, and record the actor as the current deferred-auth analyst/system identity used by the existing review mutations.

## UI Components

- `SourceProvenanceCard` renders each source URL as a real external link.
- `ExtractedFactsCard` renders editable controls only while editing.
- The page action bar owns edit, cancel, and save state.
- `Save Changes` shows a loading state during mutation and is disabled while saving.

## Error Handling

- Missing or invalid source URLs remain non-clickable rather than opening an empty tab.
- Fact mutation errors are shown through the global toast system.
- Unsaved edits are never replaced by query updates while edit mode is active.

## Verification

- Open a source URL and verify it opens in a new tab.
- Enter edit mode, change a fact, verify Save Changes becomes enabled.
- Save and verify the updated value remains after refresh.
- Verify the audit trail contains the changed fields and before/after values.
- Cancel changes and verify the persisted value is unchanged.
- Run application and Convex typechecks.
