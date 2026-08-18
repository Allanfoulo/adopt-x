# Adopt X Windmill Source Expansion

**Last updated:** 2026-08-19

## Goal

Expand recurring deal discovery beyond the current SEC and Google News feeds while keeping Windmill responsible for collection, Mastra responsible for bounded corroboration, and Convex responsible for durable, auditable evidence. Firecrawl is an active enrichment dependency for the current adoption-agent scan path.

## Architecture

`run_scheduled_scan` remains the single orchestration entry point. It loads a source registry, selects enabled sources, dispatches each source to the appropriate collector, deduplicates the returned items, and sends candidate sources to the Mastra Adoption Agent. The agent must call the bounded Firecrawl corroboration tool before returning candidate JSON. Windmill then preserves the candidate draft and corroboration evidence in one batch ingested into Convex.

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

The scan result records all source types used in the run. Existing idempotency by external ID and content hash remains unchanged. Firecrawl does not become a new seed feed or a replacement for the primary event anchor; it augments a candidate that was discovered from the configured Windmill sources.

## Firecrawl Boundary

Firecrawl is integrated through the Mastra `firecrawlCorroborate` tool, following the Leadforge pattern of targeted public-web search with bounded retrieval. The tool receives the seed headline, publisher, URL, and optional company and target names. It requests up to 10 web results from Firecrawl, removes the seed URL, and retains at most 5 result pages per tool call with title, URL, description, and up to 8,000 characters of markdown.

The tool is evidence gathering, not proof by itself. Returned pages are labeled as corroborating evidence and remain linked to the Windmill seed candidate. They may support, contradict, or add context to a claim, but they cannot directly mutate extracted deal facts or replace the primary event anchor. The Mastra brief-enrichment agent may cite these pages using their stable `firecrawl:<url>` external IDs.

`FIRECRAWL_API_KEY` belongs in the deployed Mastra runtime, not in the browser bundle or Convex client environment. If the key is missing or Firecrawl fails, the Adoption Agent returns a failed tool result and Windmill quarantines that candidate with the failure reason rather than presenting an unverified candidate as fully corroborated. Other candidates may continue through the scan.

## Evidence Persistence and Citation

Windmill summarizes Firecrawl tool output by URL, deduplicates repeated pages, and passes the evidence array through the Convex ingest mutation. Convex stores it under `sourceHits.corroboration.evidence` alongside the result and independent-publisher counts.

The candidate detail page renders the retained corroborating pages beneath their seed source. Brief enrichment receives the same nested evidence, and the dedicated brief page exposes all cited sources with clickable URLs. Thesis Map evidence claims may reference either the primary source external ID or a retained `firecrawl:<url>` external ID. Unsupported claims must continue to use the explicit evidence-limitation language rather than being filled with inferred facts.

## Failure Handling

- One seed-source failure should be recorded with the source key and allow other configured sources to complete when the collector supports partial results.
- A Firecrawl failure should quarantine the affected candidate with an actionable reason; it must not silently convert a missing corroboration result into a successful evidence record.
- Invalid feed configuration should fail before ingestion with an actionable source-specific error.
- Duplicate URLs, external IDs, and content hashes should be collapsed before the Convex batch call, including duplicate Firecrawl pages returned across tool output.
- Unsupported sources must remain visible as unconfigured rather than appearing enabled.

## Verification

- Unit-test registry validation, source-class mapping, and deduplication.
- Run the Windmill flow against the configured development feeds.
- Confirm Convex receives source class, publisher, URL, headline, and source type for each collected item.
- Confirm each successful candidate retains Firecrawl evidence with stable external IDs, source URLs, titles, descriptions, and bounded markdown.
- Confirm candidate detail and brief pages display the retained corroborating pages as clickable citations.
- Confirm missing `FIRECRAWL_API_KEY`, HTTP failures, and malformed results quarantine the affected candidate with an actionable reason.
- Confirm existing scan and triage behavior remains unchanged.
- Confirm Firecrawl evidence is optional for individual claims but required for the current Adoption Agent scan contract; unsupported claims remain explicitly limited rather than inferred.
