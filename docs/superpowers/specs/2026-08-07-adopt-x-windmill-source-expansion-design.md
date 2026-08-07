# Adopt X Windmill Source Expansion

## Goal

Expand recurring deal discovery beyond the current SEC and Google News feeds while keeping Windmill responsible for collection and Convex responsible for durable, auditable evidence. Firecrawl remains deferred until its documentation and credentials are supplied.

## Architecture

`run_scheduled_scan` remains the single orchestration entry point. It loads a source registry, selects enabled sources, dispatches each source to the appropriate collector, deduplicates the returned items, and ingests one batch into Convex.

The registry is configuration, not agent memory. Every source has a stable key, publisher, source type, source class, reputation, and either an RSS/Atom URL or a named adapter. The initial rollout uses the existing public-feed collector for stable RSS/Atom sources. Protocol-specific sources can receive dedicated collectors without creating separate schedules or ingestion paths.

## Source Classes

- `primary_structured`: official regulatory, exchange, company IR, newsroom, and issuer press-release sources. These can establish that an event occurred.
- `secondary_signal`: broad news and sector discovery sources. These can corroborate or identify candidates but do not independently establish a deal without supporting evidence.
- `community`: public discussion and social sources. These are enrichment context only.

Every ingested source keeps its class and publisher metadata. The source class must not be inferred from the language model output.

## Initial Expansion

The source registry will support these groups:

- SEC/EDGAR and exchange announcements
- Company investor-relations and newsroom feeds
- Official press-release wires
- Sector-specific sources for healthcare, fintech, insurance, legal, and adjacent industries
- Broad discovery feeds such as Google News
- Optional community sources, clearly marked as enrichment context

Only verified feed URLs or implemented adapters may be enabled. A catalog entry without an implementation is displayed as unconfigured and is not silently treated as active.

## Configuration Flow

The settings source toggles map to registry keys. Windmill reads the enabled source configuration for each scheduled run. The existing `ADOPTX_FEEDS_JSON` variable remains supported during migration; the registry format will be compatible with it so deployment does not require a breaking cutover.

The scan result records all source types used in the run. Existing idempotency by external ID and content hash remains unchanged.

## Firecrawl Boundary

Firecrawl will be added later as an enrichment collector following the Leadforge pattern: targeted scrape plus bounded search, structured source-strength output, persisted observability, and fallback behavior. It will be allowed to discover and retrieve additional corroborating pages, but those results will be linked to the Windmill seed candidate and labeled as supporting, enrichment, or conflicting evidence. It will not replace the primary event anchor or directly mutate deal facts.

## Failure Handling

- One source failure should be recorded with the source key and allow other configured sources to complete when the collector supports partial results.
- Invalid feed configuration should fail before ingestion with an actionable source-specific error.
- Duplicate URLs, external IDs, and content hashes should be collapsed before the Convex batch call.
- Unsupported sources must remain visible as unconfigured rather than appearing enabled.

## Verification

- Unit-test registry validation, source-class mapping, and deduplication.
- Run the Windmill flow against the configured development feeds.
- Confirm Convex receives source class, publisher, URL, headline, and source type for each collected item.
- Confirm existing scan and triage behavior remains unchanged.
- Confirm Firecrawl is not required for the expanded Windmill scan to run.
