# Adopt X Candidate Detail Layout Design

## Summary

This change reshapes the `Candidate Detail` main content pane to match the approved screenshot as closely as possible on desktop while leaving the sidebar and global shell untouched. The page keeps the current demo data and workflow actions, but the layout, card grouping, density, and hierarchy are recomposed to read like an analyst review console rather than a generic stacked dashboard.

## Goals

- Match the approved screenshot 1:1 in desktop information architecture and visual grouping.
- Leave the sidebar unchanged.
- Preserve the current page actions and candidate data model.
- Make the main pane feel denser, more operational, and more review-oriented.
- Keep the route responsive without compromising desktop fidelity.

## Non-Goals

- No changes to sidebar structure, behavior, or styling.
- No changes to route names or navigation.
- No backend or data-model changes.
- No redesign of the app header beyond what is needed for alignment inside the candidate route.

## Approved Approach

Use the existing candidate data and controls, but recompose `src/routes/candidate.tsx` so the main pane mirrors the screenshot’s structure. This keeps the implementation focused and avoids a brittle one-off pixel recreation.

## Layout Structure

### Top Area

- Keep the page title in the shared shell header.
- Keep the action buttons in the shared shell header.
- Inside the route content, place the back link first.
- Under the back link, create a top summary row with:
- A wide headline summary card on the left.
- A compact `Review State` card on the right.

### Main Body

- Use a two-column desktop composition:
- Left workspace: broad primary review area.
- Right rail: narrow stacked review context area.
- The left workspace contains paired cards arranged in rows.
- The right rail contains vertically stacked support panels.

### Left Workspace Order

1. `Source Provenance`
2. `Extracted Facts`
3. `AI Relevance Summary`
4. `Attributes & Scores`
5. `Analyst Notes`
6. `Internal Tags`

Desktop grouping:

- Row 1: `Source Provenance` and `Extracted Facts`
- Row 2: `AI Relevance Summary` and `Attributes & Scores`
- Row 3: `Analyst Notes` and `Internal Tags`

### Right Rail Order

1. `Review State`
2. `Provenance Validation`
3. `Score Explanations`
4. `Audit Trail`
5. `Social / Community Enrichment`

## Visual Behavior

### Headline Summary Card

- Display candidate headline prominently.
- Keep the review-status badge inside this card.
- Present the core metadata as compact inline fields across the lower portion of the card.
- Match the screenshot’s horizontal metadata rhythm instead of the current looser grid feel.

### Card Density

- Tighten card padding, row height, and gaps between elements.
- Use compact uppercase section labels for numbered review steps.
- Keep panel headers short and operational.
- Favor table-like alignment and structured rows over spacious marketing-style spacing.

### Right Rail

- Keep it as a normal vertical column, not sticky.
- Narrower than the main workspace.
- Cards should read as review checkpoints and support context, not equal peers to the primary content.

### Notes and Tags

- Notes becomes a compact bottom-left panel with muted helper copy.
- Internal tags becomes a compact bottom-right panel with denser chip layout.

## Responsive Behavior

- Desktop is the fidelity target.
- On large screens, use the exact two-zone layout described above.
- On medium screens, allow the right rail to drop below the main workspace if needed.
- On small screens, stack panels vertically in the same semantic order.
- Responsive behavior should preserve content order and avoid horizontal overflow except where provenance tables need internal scrolling.

## Component Boundaries

### `src/routes/candidate.tsx`

- Recompose the page into a screenshot-matching desktop layout.
- Split repeated UI into small local helper components where it improves readability.
- Keep data constants local unless extraction becomes clearly beneficial.

Possible local helper units:

- `CandidateHeroCard`
- `ReviewStateCard`
- `ProvenanceTable`
- `FactsCard`
- `SummaryCard`
- `ScoresCard`
- `NotesCard`
- `TagsCard`
- `AuditTrailCard`

The goal is maintainability, not abstraction for its own sake.

## Content Mapping

- Keep current actions: edit mode, cancel, save changes, approve, reject, overflow menu.
- Keep current sections and mock data unless a missing screenshot field needs a presentational placeholder.
- Keep source chips, score badges, and status treatments, but tune their placement and density to match the screenshot.
- Keep provenance rows scrollable within their own panel if width requires it.

## Error Handling

- If content exceeds available width, constrain overflow inside the relevant card rather than breaking the overall page composition.
- Preserve truncation for long publisher names, headlines, and audit items.
- Avoid layout jumps between routes by keeping the candidate page within the existing shell sizing model.

## Testing

- Verify desktop layout matches the screenshot structure closely.
- Verify the sidebar remains unchanged.
- Verify action buttons still render and align correctly.
- Verify top summary card and right `Review State` card sit on the same row on desktop.
- Verify the right rail stacks in the approved order.
- Verify provenance table remains readable and scrolls internally if needed.
- Verify notes and tags render as paired bottom panels on desktop.
- Verify medium and small breakpoints remain usable.
- Verify the route still builds successfully.

## Recommendation

Implement this as a focused route-level rewrite in `src/routes/candidate.tsx`. Do not change the shell or sidebar for this task. The fastest correct path is to preserve the existing data and interaction vocabulary while replacing the main pane composition with the approved review-console layout.
